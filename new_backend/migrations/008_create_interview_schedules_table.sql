-- Create interview_schedules table for storing interview scheduling details
CREATE TABLE IF NOT EXISTS public.interview_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    interviewer TEXT NOT NULL,
    room TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_by TEXT DEFAULT 'user',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_schedules_candidate_id ON public.interview_schedules(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_scheduled_date ON public.interview_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_status ON public.interview_schedules(status);

-- Create candidate_notes table if it doesn't exist (fallback storage)
CREATE TABLE IF NOT EXISTS public.candidate_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for candidate_notes
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate_id ON public.candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_type ON public.candidate_notes(note_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_interview_schedules_updated_at ON public.interview_schedules;
CREATE TRIGGER update_interview_schedules_updated_at
    BEFORE UPDATE ON public.interview_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 