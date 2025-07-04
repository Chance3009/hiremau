#!/usr/bin/env python3
"""
Script to run database migrations
"""
import sys
import os
from supabase_client import supabase


def run_migration(migration_file):
    """Run a specific migration file"""
    try:
        print(f"📊 Running migration: {migration_file}")

        # Read the SQL file
        migration_path = os.path.join('migrations', migration_file)

        if not os.path.exists(migration_path):
            print(f"❌ Migration file not found: {migration_path}")
            return False

        with open(migration_path, 'r') as f:
            sql_content = f.read()

        print(f"📝 SQL content to execute:")
        print("=" * 50)
        print(sql_content)
        print("=" * 50)

        print("\n🎯 Please execute the above SQL in your Supabase SQL editor.")
        print("This migration will create:")
        print("- interview_schedules table for storing interview details")
        print("- candidate_notes table for fallback storage")
        print("- Proper indexes and triggers")

        # Test current database connection
        print("\n📊 Testing database connection...")
        result = supabase.table("candidates").select("count").execute()

        if result.data:
            print("✅ Database connection successful")

            # Check if candidates have stages that need interview scheduling
            stage_result = supabase.table("candidates").select(
                "stage").eq("stage", "interview").execute()
            interview_candidates = len(
                stage_result.data) if stage_result.data else 0

            print(
                f"📈 Found {interview_candidates} candidates in 'interview' stage")

            if interview_candidates > 0:
                print("🎯 These candidates are ready for interview scheduling!")

        else:
            print("❌ Database connection failed")
            return False

        return True

    except Exception as e:
        print(f"❌ Error running migration: {e}")
        return False


def main():
    """Main migration runner"""
    print("🚀 HireMau Database Migration Runner")
    print("=====================================")

    # Run the interview schedules migration
    success = run_migration('008_create_interview_schedules_table.sql')

    if success:
        print("\n✅ Migration instructions provided successfully!")
        print("\n📋 Next steps:")
        print("1. Copy the SQL above and run it in Supabase SQL editor")
        print("2. Update the database constraint to include all stages")
        print("3. Test the interview scheduling workflow")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
