#!/usr/bin/env python3
"""
Script to update database constraints for candidate stages
"""
import sys
import os
from supabase_client import supabase


def update_stage_constraint():
    """Update the candidates table constraint to include all valid stages"""
    try:
        print("📊 Updating candidate stage constraint...")

        # Since Supabase doesn't allow direct DDL execution via the client,
        # we'll log the SQL that needs to be executed manually
        print("\n📝 Please execute the following SQL in your Supabase SQL editor:")
        print("=" * 70)

        sql_commands = """
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
"""

        print(sql_commands)
        print("=" * 70)

        print("\n🎯 After executing the SQL, the valid stages will be:")
        print("- applied")
        print("- screened")
        print("- interview")
        print("- shortlisted")
        print("- final_review")
        print("- offer")
        print("- hired")
        print("- rejected")
        print("- declined")
        print("- onboarded")

        # Test current constraint by checking what stages exist
        print("\n📊 Checking current candidate stages...")
        result = supabase.table("candidates").select("stage").execute()

        if result.data:
            stages = set(candidate.get('stage')
                         for candidate in result.data if candidate.get('stage'))
            print(f"Current stages in database: {sorted(stages)}")
        else:
            print("No candidates found in database")

    except Exception as e:
        print(f"❌ Error checking database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    update_stage_constraint()
