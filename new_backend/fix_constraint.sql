-- Fix the candidates stage constraint to include all required stages
-- Run this in your Supabase SQL editor

-- First, check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_candidates_stage';

-- Drop the existing constraint
ALTER TABLE public.candidates
DROP CONSTRAINT IF EXISTS check_candidates_stage;

-- Add the updated constraint with all required stages
ALTER TABLE public.candidates
ADD CONSTRAINT check_candidates_stage CHECK (
  stage = ANY (
    ARRAY[
      'applied'::text,
      'screening'::text,
      'screened'::text,
      'interview'::text,
      'interview_scheduled'::text,
      'interviewing'::text,
      'interview_completed'::text,
      'shortlisted'::text,
      'final_review'::text,
      'offer'::text,
      'offer_extended'::text,
      'hired'::text,
      'rejected'::text,
      'declined'::text,
      'onboarded'::text,
      'on_hold'::text,
      'negotiating'::text
    ]
  )
);

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_candidates_stage';

-- Test that the constraint allows 'screened'
-- This should succeed if the constraint is correct
UPDATE candidates 
SET stage = 'screened', updated_at = CURRENT_TIMESTAMP 
WHERE id = 'bf8eae0c-4057-4500-b30d-745fd66c7e21';

-- Check the result
SELECT id, name, stage FROM candidates 
WHERE id = 'bf8eae0c-4057-4500-b30d-745fd66c7e21'; 