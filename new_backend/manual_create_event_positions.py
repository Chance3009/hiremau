#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Get credentials
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize Supabase client
supabase: Client = create_client(url, key)


def create_event_positions_table():
    """Create the event_positions table"""

    # SQL to create the table
    sql = """
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
    """

    try:
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql})
        print("✅ Successfully created event_positions table")

        # Create indexes
        index_sql = """
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_event_positions_event_id ON public.event_positions(event_id);
        CREATE INDEX IF NOT EXISTS idx_event_positions_job_id ON public.event_positions(job_id);
        """

        result = supabase.rpc('exec_sql', {'sql': index_sql})
        print("✅ Successfully created indexes")

        # Add unique constraint
        constraint_sql = """
        -- Add unique constraint to prevent duplicate job-event pairs
        ALTER TABLE public.event_positions 
        ADD CONSTRAINT IF NOT EXISTS unique_event_job_pair UNIQUE (event_id, job_id);
        """

        result = supabase.rpc('exec_sql', {'sql': constraint_sql})
        print("✅ Successfully added unique constraint")

        # Enable RLS
        rls_sql = """
        -- Enable RLS (Row Level Security)
        ALTER TABLE public.event_positions ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for event_positions (allow all operations for now)
        CREATE POLICY IF NOT EXISTS "Allow all operations on event_positions" ON public.event_positions
        FOR ALL USING (true);
        """

        result = supabase.rpc('exec_sql', {'sql': rls_sql})
        print("✅ Successfully enabled RLS and created policy")

        print("\n🎉 Event positions table created successfully!")

    except Exception as e:
        print(f"❌ Error creating event_positions table: {str(e)}")

        # Try alternative method - using raw SQL query
        try:
            print("Trying alternative method...")

            # Simple table creation without foreign keys first
            simple_sql = """
            CREATE TABLE IF NOT EXISTS public.event_positions (
              id UUID NOT NULL DEFAULT gen_random_uuid(),
              event_id UUID NULL,
              job_id UUID NULL,
              positions_available INTEGER NULL DEFAULT 1,
              positions_filled INTEGER NULL DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT event_positions_pkey PRIMARY KEY (id)
            );
            """

            # Execute using query method
            result = supabase.postgrest.query(simple_sql)
            print("✅ Basic table created successfully")

        except Exception as e2:
            print(f"❌ Alternative method also failed: {str(e2)}")


if __name__ == "__main__":
    create_event_positions_table()
