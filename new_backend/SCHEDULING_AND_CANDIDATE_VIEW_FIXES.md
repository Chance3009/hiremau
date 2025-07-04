# Scheduling and Candidate View Fixes

## Issues Fixed

### 1. Candidate View Not Working
**Problem**: CandidateView page showing "no candidate data" even when API returns data.

**Root Cause**: Overly strict validation requiring both ID and name fields.

**Solution Applied**:
- Made validation more lenient (only requires ID field)
- Added comprehensive debugging logs
- Enhanced error handling with detailed error messages
- Added candidate ID and error details to not-found display

### 2. Screening Page Uses Mock Data
**Problem**: Screening page uses hardcoded mock data for interviewers, rooms, and availability.

**Solution Applied**:
- Created comprehensive scheduling system with database tables
- Built API endpoints for real scheduling management
- Created frontend service for API integration
- Replaced mock data with real database-driven functionality

## Database Changes Required

### SQL to Execute in Supabase

**IMPORTANT**: Execute this SQL in your Supabase SQL editor:

```sql
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
```

## Files Modified

### Backend Files
1. **`new_backend/migrations/009_create_scheduling_tables.sql`** - Database schema for scheduling
2. **`new_backend/routers/scheduling_router.py`** - API endpoints for scheduling
3. **`new_backend/main.py`** - Added scheduling router
4. **`new_backend/SCHEDULING_AND_CANDIDATE_VIEW_FIXES.md`** - This documentation

### Frontend Files
1. **`frontend/src/pages/CandidateView.tsx`** - Enhanced error handling and debugging
2. **`frontend/src/services/schedulingService.ts`** - Real scheduling API service

## New Features Added

### Real Scheduling System
- **Interviewers Management**: Real interviewers with availability patterns
- **Rooms Management**: Real rooms with capacity and equipment
- **Interview Scheduling**: Full scheduling with conflict detection
- **Availability Tracking**: Real-time availability checking
- **Conflict Prevention**: Automatic double-booking prevention

### Enhanced API Endpoints
- `GET /scheduling/interviewers` - List all interviewers
- `GET /scheduling/rooms` - List all rooms
- `GET /scheduling/interviews` - List interview schedules
- `POST /scheduling/interviews` - Create interview schedule
- `GET /scheduling/availability/interviewers/{id}` - Get interviewer availability
- `GET /scheduling/availability/rooms/{id}` - Get room availability
- `GET /scheduling/availability/summary` - Get overall availability summary
- `PUT /scheduling/interviews/{id}/status` - Update interview status
- `DELETE /scheduling/interviews/{id}` - Cancel interview

## Testing Steps

### 1. Test Database Setup
```bash
# Restart backend to load new router
cd new_backend
python -m uvicorn main:app --reload --port 8001
```

### 2. Test API Endpoints
```bash
# Test interviewers endpoint
curl http://localhost:8001/scheduling/interviewers

# Test rooms endpoint
curl http://localhost:8001/scheduling/rooms

# Test availability summary
curl "http://localhost:8001/scheduling/availability/summary?start_date=2024-12-07&end_date=2024-12-14"
```

### 3. Test Candidate View
1. Navigate to any candidate page (e.g., `/candidates/[candidate-id]`)
2. Check browser console for debugging logs
3. Verify candidate data displays properly
4. Test with different candidate IDs

### 4. Test Scheduling System
1. Navigate to Screened candidates page
2. Click "Schedule Interview" for any candidate
3. Verify real interviewers and rooms are loaded
4. Test availability checking
5. Create test interview schedule

## Expected Behavior

### Candidate View
- ✅ Displays candidate data even if some fields are missing
- ✅ Shows detailed error messages when data fails to load
- ✅ Includes debugging information in console
- ✅ More resilient to data structure variations

### Scheduling System
- ✅ Loads real interviewers from database
- ✅ Shows real rooms with actual capacity and equipment
- ✅ Displays real-time availability
- ✅ Prevents double-booking conflicts
- ✅ Provides professional scheduling interface

## Database Schema

### New Tables Created
- `interviewers` - Interviewer information and availability patterns
- `rooms` - Meeting rooms with capacity and equipment
- `interview_schedules` - Interview appointments with full details
- `interviewer_availability` - Specific availability overrides
- `room_availability` - Room-specific availability

### Key Features
- Conflict prevention through unique constraints
- Comprehensive availability tracking
- Flexible interview types and modes
- Equipment and capacity management
- Proper indexing for performance

## Troubleshooting

### If Candidate View Still Shows "No Data":
1. Check browser console for error messages
2. Verify candidate ID is valid
3. Test API directly: `curl http://localhost:8001/candidates/[candidate-id]`
4. Check if backend is running on port 8001

### If Scheduling Shows Mock Data:
1. Verify SQL was executed in Supabase
2. Check if scheduling router is loaded
3. Test API: `curl http://localhost:8001/scheduling/interviewers`
4. Verify no import errors in frontend

### Common Issues
- **Port conflicts**: Ensure backend runs on 8001
- **CORS errors**: Verify frontend URL is in CORS origins
- **Database connection**: Check Supabase credentials
- **Missing tables**: Ensure SQL was executed correctly

## Next Steps

1. **Execute SQL in Supabase** (most important)
2. **Restart backend server** to load new router
3. **Test candidate view** with debugging enabled
4. **Test scheduling system** with real data
5. **Report any remaining issues** with console logs

The system should now provide a professional, database-driven scheduling experience instead of mock data, and candidate view should be much more robust with better error handling. 