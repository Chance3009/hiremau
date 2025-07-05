-- Create enum types
CREATE TYPE recruitment_stage AS ENUM (
  'applied',
  'screening',
  'interview_scheduled',
  'interviewing',
  'interview_completed',
  'final_review',
  'offer_extended',
  'hired',
  'rejected'
);

CREATE TYPE candidate_status AS ENUM (
  'active',
  'on_hold',
  'withdrawn',
  'rejected',
  'hired'
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  current_position TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  salary_expectations DECIMAL NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  resume_url TEXT,
  stage recruitment_stage NOT NULL DEFAULT 'applied',
  status candidate_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 