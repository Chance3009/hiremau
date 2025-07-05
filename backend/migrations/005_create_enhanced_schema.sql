-- Migration: Create enhanced database schema
-- This migration creates the improved schema for the recruitment pipeline

-- First, let's enhance the existing events table
ALTER TABLE events 
DROP COLUMN IF EXISTS time,
DROP COLUMN IF EXISTS positions,
DROP COLUMN IF EXISTS registrations,
DROP COLUMN IF EXISTS interviews,
DROP COLUMN IF EXISTS analytics_json;

-- Add new columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'career_fair',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_interviews INTEGER DEFAULT 0;

-- Create event_jobs junction table for many-to-many relationship
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
    
    UNIQUE(event_id, job_id)
);

-- Enhance the existing jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS salary_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_max DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR';

-- Enhance candidates table with Malaysian context
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS current_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR',
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create job_applications table for tracking candidate applications
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Application Details
    application_method VARCHAR(50) DEFAULT 'direct',
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'rejected', 'withdrawn')),
    stage VARCHAR(50) DEFAULT 'applied',
    
    -- Score & Evaluation
    screening_score DECIMAL(5,2),
    interview_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(candidate_id, job_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_event_jobs_event_id ON event_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_jobs_job_id ON event_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_event_id ON job_applications(event_id);

-- Add table comments
COMMENT ON TABLE event_jobs IS 'Junction table linking events and jobs with specific details';
COMMENT ON TABLE job_applications IS 'Tracks candidate applications to specific jobs';

-- Update existing data to match new structure
UPDATE candidates 
SET 
    currency = 'MYR',
    source_type = COALESCE(source, 'direct'),
    last_activity_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE currency IS NULL OR source_type IS NULL OR last_activity_at IS NULL;

UPDATE jobs 
SET 
    currency = 'MYR',
    location = COALESCE(location, 'Malaysia')
WHERE currency IS NULL OR location IS NULL;
 