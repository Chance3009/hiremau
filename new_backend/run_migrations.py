import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def run_migrations():
    """Run database migrations"""
    try:
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")

        supabase = create_client(supabase_url, supabase_key)

        # Read and execute migration files
        migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
        for filename in sorted(os.listdir(migrations_dir)):
            if filename.endswith(".sql"):
                logger.info(f"Running migration: {filename}")
                with open(os.path.join(migrations_dir, filename), "r") as f:
                    sql = f.read()
                    # Split SQL into individual statements
                    statements = [s.strip()
                                  for s in sql.split(";") if s.strip()]
                    for statement in statements:
                        try:
                            supabase.query(statement).execute()
                            logger.info(f"Successfully executed statement")
                        except Exception as e:
                            logger.error(
                                f"Error executing statement: {str(e)}")
                            logger.error(f"Statement: {statement}")
                            # Don't raise error, continue with next statement
                            continue

        logger.info("Migrations completed successfully")

    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}")
        raise


if __name__ == "__main__":
    run_migrations()
