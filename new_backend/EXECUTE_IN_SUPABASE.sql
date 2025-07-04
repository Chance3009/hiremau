-- ================================================================
-- HIREMAU DATABASE RESTRUCTURING - EXECUTE IN SUPABASE SQL EDITOR
-- ================================================================
-- This script completes the database restructuring for the recruitment pipeline
-- Execute this entire script in your Supabase SQL Editor

-- 1. DROP UNUSED TABLES (confirmed empty)
-- ================================================================
DROP TABLE IF EXISTS candidate_table CASCADE;
DROP TABLE IF EXISTS test CASCADE;

-- Note: company_table is preserved as it contains 33 embedding records

-- 2. CREATE EVENT_JOBS JUNCTION TABLE (Many-to-Many Events-Jobs)
-- ================================================================
CREATE TABLE IF NOT EXISTS event_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Job-specific event details
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1,
    
    -- Interview Scheduling
    interview_slots_available INTEGER DEFAULT 10,
    interview_slots_booked INTEGER DEFAULT 0,
    interview_duration_minutes INTEGER DEFAULT 30,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(event_id, job_id),
    CONSTRAINT valid_positions CHECK (positions_available >= positions_filled),
    CONSTRAINT valid_interview_slots CHECK (interview_slots_available >= interview_slots_booked)
);

-- 3. CREATE JOB_APPLICATIONS TABLE (Candidate Applications Tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Application Details
    application_method VARCHAR(50) DEFAULT 'direct' CHECK (application_method IN ('direct', 'event', 'referral', 'job_board')),
    cover_letter TEXT,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'rejected', 'withdrawn')),
    stage VARCHAR(50) DEFAULT 'applied',
    
    -- Score & Evaluation
    screening_score DECIMAL(5,2),
    interview_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    
    -- Workflow
    assigned_recruiter UUID,
    last_action_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(candidate_id, job_id),
    CONSTRAINT valid_scores CHECK (screening_score >= 0 AND interview_score >= 0 AND overall_score >= 0)
);

-- 4. ENHANCE EVENTS TABLE (Add Malaysian Context & Features)
-- ================================================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'career_fair',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meeting_platform VARCHAR(100),
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_interviews INTEGER DEFAULT 0;

-- Clean up old columns if they exist
ALTER TABLE events 
DROP COLUMN IF EXISTS time,
DROP COLUMN IF EXISTS positions,
DROP COLUMN IF EXISTS registrations,
DROP COLUMN IF EXISTS interviews,
DROP COLUMN IF EXISTS analytics_json;

-- Add constraints for events (drop if exists, then add)
DO $$ 
BEGIN
    -- Drop constraint if it exists, then add it
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_events_status') THEN
        ALTER TABLE events DROP CONSTRAINT check_events_status;
    END IF;
    ALTER TABLE events ADD CONSTRAINT check_events_status 
    CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled'));
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_event_type') THEN
        ALTER TABLE events DROP CONSTRAINT check_event_type;
    END IF;
    ALTER TABLE events ADD CONSTRAINT check_event_type 
    CHECK (event_type IN ('career_fair', 'networking', 'workshop', 'conference', 'virtual', 'hybrid'));
END $$;

-- 5. ENHANCE JOBS TABLE (Add Malaysian Context & Salary Structure)
-- ================================================================
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS salary_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_max DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR',
ADD COLUMN IF NOT EXISTS responsibilities TEXT[],
ADD COLUMN IF NOT EXISTS preferred_qualifications TEXT[],
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS required_skills TEXT[],
ADD COLUMN IF NOT EXISTS preferred_skills TEXT[],
ADD COLUMN IF NOT EXISTS technical_skills TEXT[],
ADD COLUMN IF NOT EXISTS soft_skills TEXT[],
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT 'HireMau',
ADD COLUMN IF NOT EXISTS reporting_manager VARCHAR(255),
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS target_hires INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_hires INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_screened INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_interviewed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_offers INTEGER DEFAULT 0;

-- Clean up old columns
ALTER TABLE jobs 
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS experience,
DROP COLUMN IF EXISTS salary,
DROP COLUMN IF EXISTS applicants,
DROP COLUMN IF EXISTS shortlisted,
DROP COLUMN IF EXISTS interviewed;

-- Add constraints for jobs (drop if exists, then add)
DO $$ 
BEGIN
    -- Jobs status constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_jobs_status') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_jobs_status;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_jobs_status 
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled'));
    
    -- Employment type constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_employment_type') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_employment_type;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_employment_type 
    CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship'));
    
    -- Experience level constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_experience_level') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_experience_level;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_experience_level 
    CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive'));
    
    -- Urgency constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_urgency') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_urgency;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_urgency 
    CHECK (urgency IN ('low', 'normal', 'high', 'urgent'));
    
    -- Salary range constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_salary_range') THEN
        ALTER TABLE jobs DROP CONSTRAINT check_salary_range;
    END IF;
    ALTER TABLE jobs ADD CONSTRAINT check_salary_range 
    CHECK (salary_max >= salary_min OR salary_max IS NULL OR salary_min IS NULL);
END $$;

-- 6. ENHANCE CANDIDATES TABLE (Add Malaysian Context & Tracking)
-- ================================================================
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS current_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS education_field VARCHAR(100),
ADD COLUMN IF NOT EXISTS education_institution VARCHAR(255),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS technical_skills TEXT[],
ADD COLUMN IF NOT EXISTS soft_skills TEXT[],
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR',
ADD COLUMN IF NOT EXISTS availability_date DATE,
ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS source_details TEXT,
ADD COLUMN IF NOT EXISTS referring_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_analysis_version VARCHAR(20) DEFAULT 'v1';

-- Add constraints for candidates (drop if exists, then add)
DO $$ 
BEGIN
    -- Preferred work type constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_preferred_work_type') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_preferred_work_type;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_preferred_work_type 
    CHECK (preferred_work_type IN ('remote', 'onsite', 'hybrid'));
    
    -- Source type constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_source_type') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_source_type;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_source_type 
    CHECK (source_type IN ('direct', 'event', 'referral', 'linkedin', 'job_board', 'social_media'));
    
    -- Candidates status constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_candidates_status') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_candidates_status;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_candidates_status 
    CHECK (status IN ('active', 'on_hold', 'withdrawn', 'rejected', 'hired'));
    
    -- Candidates stage constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_candidates_stage') THEN
        ALTER TABLE candidates DROP CONSTRAINT check_candidates_stage;
    END IF;
    ALTER TABLE candidates ADD CONSTRAINT check_candidates_stage 
    CHECK (stage IN ('applied', 'screening', 'screened', 'interview_scheduled', 'interviewing', 'interview_completed', 'final_review', 'shortlisted', 'offer_extended', 'hired', 'rejected'));
END $$;

-- 7. CREATE PERFORMANCE INDEXES
-- ================================================================
-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Candidate indexes
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_source_type ON candidates(source_type);
CREATE INDEX IF NOT EXISTS idx_candidates_last_activity ON candidates(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_event_jobs_event_id ON event_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_jobs_job_id ON event_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_event_jobs_status ON event_jobs(status);

-- Application tracking indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_event_id ON job_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_stage ON job_applications(stage);

-- 8. CREATE UPDATE TRIGGERS
-- ================================================================
-- Create or update the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables (drop if exists, then create)
DO $$ 
BEGIN
    -- Drop and recreate event_jobs trigger
    DROP TRIGGER IF EXISTS update_event_jobs_updated_at ON event_jobs;
    CREATE TRIGGER update_event_jobs_updated_at
        BEFORE UPDATE ON event_jobs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Drop and recreate job_applications trigger
    DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
    CREATE TRIGGER update_job_applications_updated_at
        BEFORE UPDATE ON job_applications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;

-- 9. ADD TABLE COMMENTS FOR DOCUMENTATION
-- ================================================================
COMMENT ON TABLE events IS 'Main events table for managing recruitment events with Malaysian context';
COMMENT ON TABLE jobs IS 'Job openings with Malaysian salary structure (MYR) and employment types';
COMMENT ON TABLE candidates IS 'Candidate profiles with Malaysian preferences and tracking';
COMMENT ON TABLE event_jobs IS 'Junction table linking events and jobs with specific event details';
COMMENT ON TABLE job_applications IS 'Tracks candidate applications to specific jobs through events or direct application';
COMMENT ON TABLE company_table IS 'Vector embeddings for company information (RAG/AI)';

-- 10. UPDATE EXISTING DATA FOR MALAYSIAN CONTEXT
-- ================================================================
-- Update candidates with Malaysian defaults
UPDATE candidates 
SET 
    currency = 'MYR',
    source_type = COALESCE(source, 'direct'),
    last_activity_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE currency IS NULL OR source_type IS NULL OR last_activity_at IS NULL;

-- Update jobs with Malaysian defaults
UPDATE jobs 
SET 
    currency = 'MYR',
    location = COALESCE(location, 'Malaysia'),
    company_name = COALESCE(company, 'HireMau'),
    employment_type = CASE 
        WHEN employment_type IS NULL THEN 'full_time'
        ELSE employment_type 
    END,
    experience_level = CASE 
        WHEN experience_level IS NULL THEN 'mid'
        ELSE experience_level 
    END
WHERE currency IS NULL OR location IS NULL OR company_name IS NULL 
   OR employment_type IS NULL OR experience_level IS NULL;

-- Update events with proper event types
UPDATE events 
SET 
    event_type = CASE 
        WHEN name ILIKE '%career fair%' OR title ILIKE '%career fair%' THEN 'career_fair'
        WHEN name ILIKE '%meetup%' OR title ILIKE '%meetup%' THEN 'networking'
        WHEN name ILIKE '%virtual%' OR title ILIKE '%virtual%' THEN 'virtual'
        ELSE 'career_fair'
    END,
    is_virtual = CASE 
        WHEN name ILIKE '%virtual%' OR title ILIKE '%virtual%' OR location ILIKE '%online%' THEN TRUE
        ELSE FALSE
    END
WHERE event_type IS NULL OR is_virtual IS NULL;

-- 11. CREATE SAMPLE JOB APPLICATIONS FOR EXISTING DATA
-- ================================================================
-- Create job applications for existing candidates (linking them to active jobs)
INSERT INTO job_applications (candidate_id, job_id, application_method, status, stage, created_at)
SELECT 
    c.id as candidate_id,
    j.id as job_id,
    'direct' as application_method,
    'submitted' as status,
    c.stage as stage,
    c.created_at
FROM candidates c
CROSS JOIN jobs j
WHERE j.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM job_applications ja 
    WHERE ja.candidate_id = c.id AND ja.job_id = j.id
)
LIMIT 50; -- Limit to avoid too many combinations

-- ================================================================
-- MIGRATION COMPLETED!
-- ================================================================
-- Run the verification script after executing this SQL:
-- python new_backend/check_tables.py 