-- Migration 009: Create scheduling tables for real interview management
-- Create interviewers table
CREATE TABLE IF NOT EXISTS interviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    availability_pattern JSONB DEFAULT '{}', -- Store weekly availability pattern
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'event', 'virtual'
    location VARCHAR(255),
    equipment JSONB DEFAULT '[]', -- Store equipment list
    is_active BOOLEAN DEFAULT true,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- Optional event association
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_schedules table (enhanced version)
CREATE TABLE IF NOT EXISTS interview_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES interviewers(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    interview_type VARCHAR(50) DEFAULT 'technical', -- 'technical', 'hr', 'cultural', 'final'
    interview_mode VARCHAR(50) DEFAULT 'in-person', -- 'in-person', 'virtual', 'hybrid'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled'
    notes TEXT,
    meeting_link VARCHAR(500), -- For virtual interviews
    created_by UUID, -- Who scheduled this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent double booking
    UNIQUE(interviewer_id, scheduled_date, scheduled_time),
    UNIQUE(room_id, scheduled_date, scheduled_time)
);

-- Create interviewer_availability table for specific date/time availability
CREATE TABLE IF NOT EXISTS interviewer_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id UUID REFERENCES interviewers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255), -- For unavailability
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent overlapping availability slots
    UNIQUE(interviewer_id, date, start_time, end_time)
);

-- Create room_availability table for specific date/time availability
CREATE TABLE IF NOT EXISTS room_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255), -- For unavailability
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent overlapping availability slots
    UNIQUE(room_id, date, start_time, end_time)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_schedules_candidate_id ON interview_schedules(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_interviewer_id ON interview_schedules(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_room_id ON interview_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_date ON interview_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interviewer_availability_date ON interviewer_availability(interviewer_id, date);
CREATE INDEX IF NOT EXISTS idx_room_availability_date ON room_availability(room_id, date);

-- Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interviewers_updated_at BEFORE UPDATE ON interviewers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_schedules_updated_at BEFORE UPDATE ON interview_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviewer_availability_updated_at BEFORE UPDATE ON interviewer_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_availability_updated_at BEFORE UPDATE ON room_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO interviewers (name, email, role, department, availability_pattern) VALUES
('John Doe', 'john.doe@company.com', 'Senior Engineer', 'Engineering', '{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "friday": ["09:00", "10:00", "11:00", "14:00", "15:00"]}'),
('Sarah Johnson', 'sarah.johnson@company.com', 'Tech Lead', 'Engineering', '{"monday": ["10:00", "11:00", "14:00", "15:00", "16:00"], "tuesday": ["10:00", "11:00", "14:00", "15:00", "16:00"], "wednesday": ["10:00", "11:00", "14:00", "15:00", "16:00"], "thursday": ["10:00", "11:00", "14:00", "15:00", "16:00"], "friday": ["10:00", "11:00", "14:00", "15:00"]}'),
('Mike Chen', 'mike.chen@company.com', 'HR Manager', 'Human Resources', '{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], "friday": ["09:00", "10:00", "11:00", "14:00", "15:00"]}'),
('Emily Rodriguez', 'emily.rodriguez@company.com', 'Product Manager', 'Product', '{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "friday": ["09:00", "10:00", "11:00", "14:00", "15:00"]}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (name, capacity, type, location, equipment) VALUES
('Meeting Room 1', 4, 'general', 'Floor 1', '["projector", "whiteboard", "video_conferencing"]'),
('Meeting Room 2', 6, 'general', 'Floor 1', '["projector", "whiteboard", "video_conferencing"]'),
('Interview Room A', 2, 'general', 'Floor 2', '["whiteboard", "comfortable_seating"]'),
('Interview Room B', 2, 'general', 'Floor 2', '["whiteboard", "comfortable_seating"]'),
('Conference Room', 12, 'general', 'Floor 3', '["projector", "whiteboard", "video_conferencing", "large_screen"]'),
('Virtual Room', 100, 'virtual', 'Online', '["video_conferencing", "screen_sharing", "recording"]');

-- Insert sample availability for the next 30 days
INSERT INTO interviewer_availability (interviewer_id, date, start_time, end_time, is_available)
SELECT 
    i.id,
    CURRENT_DATE + interval '1 day' * generate_series(0, 29),
    '09:00'::time,
    '17:00'::time,
    true
FROM interviewers i
WHERE i.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO room_availability (room_id, date, start_time, end_time, is_available)
SELECT 
    r.id,
    CURRENT_DATE + interval '1 day' * generate_series(0, 29),
    '08:00'::time,
    '18:00'::time,
    true
FROM rooms r
WHERE r.is_active = true AND r.type != 'virtual'
ON CONFLICT DO NOTHING; 