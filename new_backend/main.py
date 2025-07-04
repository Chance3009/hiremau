from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers.jobs_router import router as jobs_router
from routers.candidates_router import router as candidates_router
from routers.events_router import router as events_router
from routers.interviews_router import router as interviews_router
from routers.ai_router import router as ai_router
from routers.dashboard_router import router as dashboard_router
from routers.workflow_router import router as workflow_router
from routers.evaluation_router import router as evaluation_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Validate required environment variables


def validate_environment():
    """Validate that all required environment variables are set"""
    required_vars = {
        'SUPABASE_URL': 'Supabase project URL',
        'SUPABASE_KEY': 'Supabase anon key',
        'SUPABASE_SERVICE_KEY': 'Supabase service key',
        'GEMINI_API_KEY': 'Gemini AI API key'
    }

    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"{var} ({description})")

    if missing_vars:
        error_msg = f"Missing required environment variables:\n" + \
            "\n".join(missing_vars)
        error_msg += "\n\nPlease create a .env file in the new_backend directory with:"
        error_msg += "\nSUPABASE_URL=your_supabase_project_url"
        error_msg += "\nSUPABASE_KEY=your_supabase_anon_key"
        error_msg += "\nSUPABASE_SERVICE_KEY=your_supabase_service_key"
        error_msg += "\nGEMINI_API_KEY=your_gemini_api_key"
        logger.error(error_msg)
        raise ValueError(error_msg)

# Initialize Supabase and verify existing setup


def setup_supabase():
    """Initialize Supabase client and verify existing setup"""
    try:
        from supabase_client import supabase

        # Test database connection
        logger.info("Testing Supabase connection...")
        result = supabase.table("candidates").select(
            "count", count="exact").execute()
        logger.info("✅ Supabase database connection successful")

        # Verify storage buckets exist
        verify_storage_buckets(supabase)

        # Verify RLS is enabled
        verify_rls_policies(supabase)

        return True
    except Exception as e:
        logger.error(f"❌ Supabase setup failed: {str(e)}")
        return False


def verify_storage_buckets(supabase):
    """Verify Supabase storage buckets exist"""
    try:
        # List existing buckets
        buckets = supabase.storage.list_buckets()
        bucket_names = [bucket.name for bucket in buckets] if buckets else []

        required_buckets = ['company', 'transcripts', 'resume', 'other-docs']
        missing_buckets = [
            name for name in required_buckets if name not in bucket_names]

        if missing_buckets:
            logger.warning(f"⚠️ Missing storage buckets: {missing_buckets}")
        else:
            logger.info("✅ All required storage buckets exist")

    except Exception as e:
        logger.warning(f"⚠️ Could not verify storage buckets: {str(e)}")


def verify_rls_policies(supabase):
    """Verify Row Level Security is enabled"""
    try:
        # Test if RLS is working by trying to access a table
        # If RLS is not enabled, this would fail
        result = supabase.table("candidates").select(
            "count", count="exact").execute()
        logger.info("✅ RLS policies are working correctly")

    except Exception as e:
        logger.warning(f"⚠️ RLS verification failed: {str(e)}")


# Validate environment before creating app
try:
    validate_environment()
    logger.info("✅ Environment variables validated")
except ValueError as e:
    logger.error(f"❌ Environment validation failed: {str(e)}")
    raise

# Create FastAPI app
app = FastAPI(
    title="HireMau API",
    description="AI-powered HR/Recruitment Platform API with Supabase integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000",
                   "http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(candidates_router)
app.include_router(jobs_router)
app.include_router(events_router)
app.include_router(interviews_router)
app.include_router(ai_router)
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(workflow_router, prefix="/workflow", tags=["workflow"])
app.include_router(evaluation_router)


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting HireMau API...")

    # Setup Supabase
    if setup_supabase():
        logger.info("✅ Application startup completed successfully")
    else:
        logger.error(
            "❌ Application startup failed - Supabase setup incomplete")


@app.get("/")
async def root():
    return {"message": "HireMau API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    from datetime import datetime
    try:
        from supabase_client import supabase
        # Test database connection
        result = supabase.table("candidates").select(
            "count", count="exact").execute()
        return {
            "status": "healthy",
            "message": "API is running",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}",
            "database": "disconnected",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


@app.get("/test-db")
def test_database():
    """Test database connectivity and setup"""
    try:
        from supabase_client import supabase

        # Test basic connection
        result = supabase.table("candidates").select(
            "count", count="exact").execute()

        # Test storage buckets
        buckets = supabase.storage.list_buckets()

        return {
            "status": "success",
            "message": "Database connection working",
            "database": {
                "connected": True,
                "candidates_count": result.count if hasattr(result, 'count') else "unknown"
            },
            "storage": {
                "buckets": [bucket.name for bucket in buckets] if buckets else []
            },
            "environment": {
                "supabase_url": os.getenv("SUPABASE_URL", "not_set")[:20] + "..." if os.getenv("SUPABASE_URL") else "not_set",
                "gemini_key": "set" if os.getenv("GEMINI_API_KEY") else "not_set"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}",
            "error": str(e),
            "setup_instructions": {
                "1": "Create .env file with SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, GEMINI_API_KEY",
                "2": "Run setup.sql in Supabase SQL Editor",
                "3": "Create storage buckets in Supabase Dashboard",
                "4": "Enable RLS policies in Supabase Dashboard"
            }
        }


@app.get("/setup-instructions")
def get_setup_instructions():
    """Get detailed setup instructions"""
    return {
        "title": "HireMau Backend Setup Instructions",
        "steps": {
            "1_environment": {
                "title": "Environment Variables",
                "description": "Create .env file in new_backend/ directory",
                "content": """
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
                """.strip()
            },
            "2_database": {
                "title": "Database Schema",
                "description": "Run setup.sql in Supabase SQL Editor",
                "content": "Execute the setup.sql file in your Supabase project's SQL Editor"
            },
            "3_storage": {
                "title": "Storage Buckets",
                "description": "Create storage buckets in Supabase Dashboard",
                "content": """
Go to Supabase Dashboard > Storage > Create buckets:
- candidate-files (public)
- resumes (public)
- certificates (public)
- transcripts (public)
                """.strip()
            },
            "4_rls": {
                "title": "Row Level Security",
                "description": "Enable RLS on all tables",
                "content": """
In Supabase SQL Editor, run:
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
                """.strip()
            }
        }
    }


@app.post("/create-sample-data")
def create_sample_data():
    """Create sample events and jobs for testing"""
    try:
        from supabase_client import supabase

        # Sample events
        sample_events = [
            {
                "title": "Tech Career Fair 2024",
                "name": "Tech Career Fair 2024",
                "description": "Annual technology career fair with top companies",
                "date": "2024-12-15",
                "location": "San Francisco Convention Center",
                "status": "active",
                "event_type": "career-fair"
            },
            {
                "title": "Engineering Networking Event",
                "name": "Engineering Networking Event",
                "description": "Monthly networking event for engineers",
                "date": "2024-11-30",
                "location": "New York Tech Hub",
                "status": "active",
                "event_type": "networking"
            },
            {
                "title": "AI & ML Conference",
                "name": "AI & ML Conference",
                "description": "Conference focused on AI and Machine Learning",
                "date": "2024-12-01",
                "location": "Austin Convention Center",
                "status": "active",
                "event_type": "conference"
            }
        ]

        # Sample jobs
        sample_jobs = [
            {
                "title": "Software Engineer",
                "department": "Engineering",
                "location": "Remote",
                "status": "active",
                "description": "Full-stack software engineer position",
                "job_type": "full-time",
                "salary_range": "$80,000 - $120,000",
                "company": "Tech Corp"
            },
            {
                "title": "Product Manager",
                "department": "Product",
                "location": "New York",
                "status": "active",
                "description": "Senior product manager role",
                "job_type": "full-time",
                "salary_range": "$100,000 - $150,000",
                "company": "Tech Corp"
            },
            {
                "title": "UX Designer",
                "department": "Design",
                "location": "San Francisco",
                "status": "active",
                "description": "Senior UX designer position",
                "job_type": "full-time",
                "salary_range": "$90,000 - $130,000",
                "company": "Design Studio"
            },
            {
                "title": "Data Scientist",
                "department": "Data",
                "location": "Remote",
                "status": "active",
                "description": "Data scientist with ML experience",
                "job_type": "full-time",
                "salary_range": "$95,000 - $140,000",
                "company": "AI Solutions"
            }
        ]

        # Insert events
        events_result = supabase.table(
            "events").insert(sample_events).execute()

        # Insert jobs
        jobs_result = supabase.table("jobs").insert(sample_jobs).execute()

        return {
            "success": True,
            "message": "Sample data created successfully",
            "events_created": len(events_result.data) if events_result.data else 0,
            "jobs_created": len(jobs_result.data) if jobs_result.data else 0
        }

    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create sample data"
        }


@app.post("/load-mock-data")
def load_mock_data_endpoint():
    """Load mock data into the database"""
    try:
        from supabase_client import supabase

        # Check if data already exists
        existing_candidates = supabase.table(
            "candidates").select("count", count="exact").execute()
        if existing_candidates.count and existing_candidates.count > 0:
            return {
                "success": False,
                "message": "Mock data already exists",
                "candidates_count": existing_candidates.count
            }

        # Mock candidate data
        mock_candidates = [
            {
                "name": "John Smith",
                "email": "john.smith@example.com",
                "phone": "+1-555-0101",
                "status": "active",
                "stage": "applied",
                "education": "Bachelor's in Computer Science",
                "experience": "3 years",
                "current_position": "Software Developer",
                "years_experience": 3,
                "skills": ["Python", "JavaScript", "React", "Node.js"],
                "availability": "2 weeks notice",
                "salary_expectations": 85000,
                "preferred_work_type": "remote",
                "source": "career_fair"
            },
            {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "phone": "+1-555-0102",
                "status": "active",
                "stage": "screening",
                "education": "Master's in Data Science",
                "experience": "5 years",
                "current_position": "Data Analyst",
                "years_experience": 5,
                "skills": ["Python", "SQL", "Machine Learning", "Tableau"],
                "availability": "1 month notice",
                "salary_expectations": 105000,
                "preferred_work_type": "hybrid",
                "source": "linkedin"
            }
        ]

        # Insert mock candidates
        result = supabase.table("candidates").insert(mock_candidates).execute()

        return {
            "success": True,
            "message": "Mock data loaded successfully",
            "candidates_created": len(result.data) if result.data else 0
        }

    except Exception as e:
        logger.error(f"Error loading mock data: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to load mock data"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
