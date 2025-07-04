#!/usr/bin/env python3
"""
Script to check database tables structure and content
"""
from supabase_client import supabase


def check_table_content(table_name):
    print(f"\n=== CHECKING {table_name.upper()} ===")
    try:
        # Check table structure and sample data
        result = supabase.table(table_name).select('*').limit(3).execute()

        if result.data:
            print(f"Sample records ({len(result.data)}):")
            for i, record in enumerate(result.data):
                print(f"\nRecord {i+1}:")
                for key, value in record.items():
                    if key == 'embedding':
                        print(f"  {key}: {'Present' if value else 'None'}")
                    elif key == 'content':
                        content_preview = str(value)[:100] if value else 'None'
                        print(f"  {key}: {content_preview}...")
                    else:
                        print(f"  {key}: {value}")
        else:
            print("No data found")

        # Get total count
        count_result = supabase.table(table_name).select(
            '*', count='exact').execute()
        print(f"Total records: {count_result.count}")

    except Exception as e:
        print(f"Error checking {table_name}: {e}")


def main():
    print("CHECKING DATABASE TABLES FOR EMBEDDINGS AND CONTENT")
    print("=" * 50)

    # Check all potential embedding tables
    tables_to_check = [
        'candidate_table',
        'company_table',
        'test'
    ]

    for table in tables_to_check:
        check_table_content(table)

    print("\n" + "=" * 50)
    print("SUMMARY:")
    print("Tables that appear to store embeddings should be kept.")
    print("Tables that are empty or contain only mock data can be dropped.")


if __name__ == "__main__":
    main()
