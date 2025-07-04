#!/usr/bin/env python3
"""
Check candidate data in the database
"""
from dotenv import load_dotenv
from supabase import create_client, Client
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def check_candidate_data():
    print("🔍 Checking candidate data...\n")

    # Check candidates table
    try:
        candidates_response = supabase.table(
            "candidates").select("*").execute()
        print(f"📋 CANDIDATES TABLE: {len(candidates_response.data)} records")

        for candidate in candidates_response.data:
            print(f"  - ID: {candidate.get('id')}")
            print(f"    Name: {candidate.get('name')}")
            print(f"    Email: {candidate.get('email')}")
            print(f"    Stage: {candidate.get('stage')}")
            print(f"    Created: {candidate.get('created_at')}")
            print("    ---")

    except Exception as e:
        print(f"❌ Error checking candidates table: {e}")

    # Check candidate_table (embeddings)
    try:
        candidate_table_response = supabase.table(
            "candidate_table").select("*").execute()
        print(
            f"\n🧠 CANDIDATE_TABLE (embeddings): {len(candidate_table_response.data)} records")

        for record in candidate_table_response.data:
            print(f"  - ID: {record.get('id')}")
            print(f"    Name: {record.get('name')}")
            print(f"    Document ID: {record.get('document_id')}")
            print(f"    Content Preview: {record.get('content', '')[:100]}...")
            print("    ---")

    except Exception as e:
        print(f"❌ Error checking candidate_table: {e}")

    # Check initial_screening_evaluation
    try:
        evaluation_response = supabase.table(
            "initial_screening_evaluation").select("*").execute()
        print(
            f"\n📊 INITIAL_SCREENING_EVALUATION: {len(evaluation_response.data)} records")

        for eval_record in evaluation_response.data:
            print(f"  - ID: {eval_record.get('id')}")
            print(f"    Candidate ID: {eval_record.get('candidate_id')}")
            print(f"    Overall Score: {eval_record.get('overall_score')}")
            print(f"    Recommendation: {eval_record.get('recommendation')}")
            print(f"    Created: {eval_record.get('created_at')}")
            print("    ---")

    except Exception as e:
        print(f"❌ Error checking initial_screening_evaluation: {e}")

    # Check job_applications
    try:
        job_apps_response = supabase.table(
            "job_applications").select("*").execute()
        print(f"\n💼 JOB_APPLICATIONS: {len(job_apps_response.data)} records")

        for app in job_apps_response.data:
            print(f"  - ID: {app.get('id')}")
            print(f"    Candidate ID: {app.get('candidate_id')}")
            print(f"    Job ID: {app.get('job_id')}")
            print(f"    Event ID: {app.get('event_id')}")
            print(f"    Status: {app.get('status')}")
            print("    ---")

    except Exception as e:
        print(f"❌ Error checking job_applications: {e}")


if __name__ == "__main__":
    check_candidate_data()
