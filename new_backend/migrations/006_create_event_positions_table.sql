-- Create event_positions table to link events with job positions
CREATE TABLE IF NOT EXISTS public.event_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  event_id UUID NULL,
  job_id UUID NULL,
  positions_available INTEGER NULL DEFAULT 1,
  positions_filled INTEGER NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_positions_pkey PRIMARY KEY (id),
  CONSTRAINT event_positions_event_id_fkey FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT event_positions_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_positions_event_id ON public.event_positions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_positions_job_id ON public.event_positions(job_id);

-- Add unique constraint to prevent duplicate job-event pairs
ALTER TABLE public.event_positions 
ADD CONSTRAINT unique_event_job_pair UNIQUE (event_id, job_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.event_positions ENABLE ROW LEVEL SECURITY;

-- Create policy for event_positions (allow all operations for now)
CREATE POLICY "Allow all operations on event_positions" ON public.event_positions
FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.event_positions IS 'Links events with job positions, tracking available and filled positions';
COMMENT ON COLUMN public.event_positions.positions_available IS 'Number of positions available for this job at this event';
COMMENT ON COLUMN public.event_positions.positions_filled IS 'Number of positions filled for this job at this event'; 