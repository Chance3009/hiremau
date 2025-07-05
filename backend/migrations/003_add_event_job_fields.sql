-- Add event_id and job_id to candidates table
ALTER TABLE candidates 
ADD COLUMN event_id UUID,
ADD COLUMN job_id UUID;

-- Create indexes for better performance
CREATE INDEX idx_candidates_event_id ON candidates(event_id);
CREATE INDEX idx_candidates_job_id ON candidates(job_id);

-- Update the recruitment_stage enum to match frontend expectations
ALTER TYPE recruitment_stage ADD VALUE IF NOT EXISTS 'screened';
ALTER TYPE recruitment_stage ADD VALUE IF NOT EXISTS 'shortlisted';

-- Add additional fields that are missing
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS ai_profile_json JSONB,
ADD COLUMN IF NOT EXISTS ai_profile_summary TEXT,
ADD COLUMN IF NOT EXISTS profile_embedding VECTOR(1536),
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS preferred_work_type TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    name TEXT,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    status TEXT DEFAULT 'active',
    event_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    status TEXT DEFAULT 'active',
    description TEXT,
    job_type TEXT,
    salary_range TEXT,
    company TEXT,
    requirements TEXT[],
    skills_required TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create interviews table for proper interview scheduling
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id),
    job_id UUID REFERENCES jobs(id),
    interviewer_id UUID,
    interviewer_name TEXT,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    interview_type TEXT DEFAULT 'standard',
    room_name TEXT,
    room_id UUID,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create interviewers table
CREATE TABLE IF NOT EXISTS interviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    department TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_rooms table
CREATE TABLE IF NOT EXISTS interview_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    room_type TEXT DEFAULT 'meeting',
    equipment TEXT[],
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO events (title, name, description, date, location, status, event_type) VALUES
('UPM Career Fair 2025', 'UPM Career Fair 2025', 'Annual career fair at UPM', '2025-03-15 09:00:00', 'UPM Campus', 'active', 'career_fair'),
('Tech Meetup March', 'Tech Meetup March', 'Monthly tech meetup', '2025-03-20 18:00:00', 'Tech Hub KL', 'active', 'meetup'),
('Virtual Job Fair', 'Virtual Job Fair', 'Online job fair', '2025-03-25 10:00:00', 'Online', 'active', 'virtual')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (title, department, location, status, description, job_type, salary_range, company, requirements, skills_required) VALUES
('Frontend Developer', 'Engineering', 'Kuala Lumpur', 'active', 'Develop user-facing web applications', 'full_time', '8000-12000', 'HireMau', ARRAY['Bachelor in Computer Science', '3+ years experience'], ARRAY['React', 'TypeScript', 'CSS']),
('Backend Developer', 'Engineering', 'Kuala Lumpur', 'active', 'Develop server-side applications', 'full_time', '9000-13000', 'HireMau', ARRAY['Bachelor in Computer Science', '3+ years experience'], ARRAY['Python', 'FastAPI', 'PostgreSQL']),
('Full Stack Developer', 'Engineering', 'Kuala Lumpur', 'active', 'Develop both frontend and backend', 'full_time', '10000-15000', 'HireMau', ARRAY['Bachelor in Computer Science', '5+ years experience'], ARRAY['React', 'Python', 'PostgreSQL', 'TypeScript']),
('DevOps Engineer', 'Engineering', 'Kuala Lumpur', 'active', 'Manage infrastructure and deployment', 'full_time', '11000-16000', 'HireMau', ARRAY['Bachelor in Computer Science', '4+ years experience'], ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD']),
('Data Scientist', 'Data', 'Kuala Lumpur', 'active', 'Analyze data and build ML models', 'full_time', '12000-18000', 'HireMau', ARRAY['Master in Data Science', '3+ years experience'], ARRAY['Python', 'SQL', 'Machine Learning', 'Statistics'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO interviewers (name, email, role, department, status) VALUES
('John Doe', 'john.doe@hiremau.com', 'Senior Engineering Manager', 'Engineering', 'active'),
('Emma Wilson', 'emma.wilson@hiremau.com', 'Lead Frontend Developer', 'Engineering', 'active'),
('Michael Chen', 'michael.chen@hiremau.com', 'Principal Backend Engineer', 'Engineering', 'active'),
('Sarah Johnson', 'sarah.johnson@hiremau.com', 'HR Manager', 'Human Resources', 'active'),
('David Liu', 'david.liu@hiremau.com', 'DevOps Lead', 'Engineering', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO interview_rooms (name, capacity, room_type, equipment, status) VALUES
('Meeting Room 1', 6, 'meeting', ARRAY['Projector', 'Whiteboard', 'Conference Phone'], 'available'),
('Meeting Room 2', 4, 'meeting', ARRAY['TV Screen', 'Whiteboard'], 'available'),
('Interview Room A', 3, 'interview', ARRAY['Laptop', 'Whiteboard'], 'available'),
('Interview Room B', 3, 'interview', ARRAY['Laptop', 'Whiteboard'], 'available'),
('Conference Room', 12, 'conference', ARRAY['Projector', 'Sound System', 'Video Conferencing'], 'available')
ON CONFLICT (id) DO NOTHING; 