-- Update the candidates table constraint to include all valid stages
ALTER TABLE public.candidates
DROP CONSTRAINT IF EXISTS check_candidates_stage;

ALTER TABLE public.candidates
ADD CONSTRAINT check_candidates_stage CHECK (
  stage = ANY (
    ARRAY[
      'applied'::text,
      'screened'::text,
      'interview'::text,
      'shortlisted'::text,
      'final_review'::text,
      'offer'::text,
      'hired'::text,
      'rejected'::text,
      'declined'::text,
      'onboarded'::text
    ]
  )
);

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_candidates_stage'; 