-- SIMPLIFIED HIREMAU DATABASE SCHEMA
-- Designed to match frontend capabilities and HR workflow
-- =======================================================

-- 1. FIRST, CHECK AND UPDATE EXISTING DATA TO MATCH CONSTRAINTS
-- =============================================================

-- Check current status values and update them to match our constraints
UPDATE events SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE events SET status = 'active' WHERE status NOT IN ('draft', 'active', 'completed', 'cancelled');

UPDATE jobs SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE jobs SET status = 'active' WHERE status NOT IN ('draft', 'active', 'closed');

UPDATE candidates SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE candidates SET status = 'active' WHERE status NOT IN ('active', 'withdrawn', 'hired');

UPDATE candidates SET stage = 'applied' WHERE stage IS NULL OR stage = '';
UPDATE candidates SET stage = 'applied' WHERE stage NOT IN ('applied', 'screening', 'interviewed', 'shortlisted', 'rejected');

-- 2. DROP UNUSED TABLES (CONFIRMED EMPTY)
-- =======================================
DROP TABLE IF EXISTS candidate_table;
DROP TABLE IF EXISTS test;

-- 3. CREATE SIMPLIFIED EVENT_JOBS JUNCTION TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS event_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate event-job combinations
    UNIQUE(event_id, job_id)
);

-- 4. CREATE SIMPLIFIED JOB APPLICATIONS TRACKING
-- ===============================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Application status (simple workflow)
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interviewed', 'offered', 'hired', 'rejected')),
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate applications
    UNIQUE(candidate_id, job_id)
);

-- 5. ADD ESSENTIAL FIELDS TO EVENTS (MINIMAL)
-- ===========================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'career_fair',
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_participants INTEGER;

-- Simple event constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_events_status') THEN
        ALTER TABLE events DROP CONSTRAINT check_events_status;
    END IF;
    ALTER TABLE events ADD CONSTRAINT check_events_status 
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));
END $$;

-- 6. ADD ESSENTIAL FIELDS TO JOBS (MINIMAL)
-- =========================================
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20) DEFAULT 'full_time',
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'mid',
ADD COLUMN IF NOT EXISTS salary_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_max DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR',
ADD COLUMN IF NOT EXISTS requirements TEXT[];

-- Simple job constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_jobs_status') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_jobs_status;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_jobs_status 
    CHECK (status IN ('draft', 'active', 'closed'));
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_employment_type') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_employment_type;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_employment_type 
    CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship'));
END $$;

-- 7. ADD ESSENTIAL FIELDS TO CANDIDATES (MINIMAL)
-- ===============================================
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS current_position VARCHAR(255),
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'immediate',
ADD COLUMN IF NOT EXISTS salary_expectations DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preferred_work_type VARCHAR(20) DEFAULT 'hybrid',
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'direct';

-- Remove AI fields that were removed from candidates table
ALTER TABLE candidates 
DROP COLUMN IF EXISTS ai_profile_summary,
DROP COLUMN IF EXISTS ai_profile_json;

-- Update any invalid preferred_work_type values to 'hybrid' before adding constraint
UPDATE candidates SET preferred_work_type = 'hybrid' 
WHERE preferred_work_type IS NULL 
   OR preferred_work_type NOT IN ('remote', 'onsite', 'hybrid');

-- Simple candidate constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_candidates_status') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_candidates_status;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_candidates_status 
    CHECK (status IN ('active', 'withdrawn', 'hired'));
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_candidates_stage') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_candidates_stage;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_candidates_stage 
    CHECK (stage IN ('applied', 'screening', 'interviewed', 'shortlisted', 'rejected'));
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_preferred_work_type') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_preferred_work_type;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_preferred_work_type 
    CHECK (preferred_work_type IN ('remote', 'onsite', 'hybrid'));
END $$;

-- 8. CREATE ESSENTIAL INDEXES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_event_jobs_event_id ON event_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_jobs_job_id ON event_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);

-- 9. ADD UPDATE TRIGGERS FOR NEW TABLES
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
    CREATE TRIGGER update_job_applications_updated_at
        BEFORE UPDATE ON job_applications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;

-- 10. UPDATE EXISTING DATA WITH DEFAULTS
-- =====================================
UPDATE jobs 
SET 
    currency = 'MYR',
    employment_type = 'full_time',
    experience_level = 'mid'
WHERE currency IS NULL OR employment_type IS NULL OR experience_level IS NULL;

UPDATE candidates 
SET 
    availability = 'immediate',
    preferred_work_type = 'hybrid',
    source = 'direct'
WHERE availability IS NULL OR preferred_work_type IS NULL OR source IS NULL;

-- 11. CREATE SAMPLE JOB APPLICATIONS FOR EXISTING CANDIDATES
-- =========================================================
INSERT INTO job_applications (candidate_id, job_id, event_id, status)
SELECT 
    c.id,
    c.job_id,
    c.event_id,
    CASE 
        WHEN c.stage = 'applied' THEN 'applied'
        WHEN c.stage = 'screening' THEN 'screening'
        WHEN c.stage = 'interviewed' THEN 'interviewed'
        WHEN c.stage = 'shortlisted' THEN 'offered'
        ELSE 'applied'
    END
FROM candidates c
WHERE c.job_id IS NOT NULL
ON CONFLICT (candidate_id, job_id) DO NOTHING;

-- 12. ADD COMMENTS FOR DOCUMENTATION
-- =================================
COMMENT ON TABLE events IS 'Recruitment events (career fairs, networking events)';
COMMENT ON TABLE jobs IS 'Job openings with Malaysian salary structure';
COMMENT ON TABLE candidates IS 'Candidate profiles with basic information';
COMMENT ON TABLE event_jobs IS 'Links jobs to events';
COMMENT ON TABLE job_applications IS 'Tracks candidate applications to jobs';

-- 13. SUCCESS MESSAGE
-- ==================
SELECT 'SIMPLIFIED SCHEMA APPLIED SUCCESSFULLY!' as message; 