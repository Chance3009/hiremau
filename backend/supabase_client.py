import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing Supabase environment variables. "
        "Please set SUPABASE_URL and SUPABASE_KEY in your .env file"
    )

# Create Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Supabase client: {str(e)}")
    raise

# Create service client for admin operations (if needed)
service_supabase = None
if SUPABASE_SERVICE_KEY:
    try:
        service_supabase: Client = create_client(
            SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("✅ Supabase service client initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Failed to initialize service client: {str(e)}")


async def get_supabase() -> Client:
    """Get the main Supabase client"""
    return supabase


async def get_service_supabase() -> Client:
    """Get the service Supabase client for admin operations"""
    if not service_supabase:
        raise ValueError(
            "Service client not available. SUPABASE_SERVICE_KEY not set.")
    return service_supabase


async def test_connection():
    """Test the Supabase connection"""
    try:
        result = await supabase.table("candidates").select(
            "count", count="exact").execute()
        logger.info("✅ Supabase connection test successful")
        return True
    except Exception as e:
        logger.error(f"❌ Supabase connection test failed: {str(e)}")
        return False
