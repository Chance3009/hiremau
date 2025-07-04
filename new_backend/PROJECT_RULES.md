# HireMau Project Rules & Guidelines

## Project Structure

### Backend (`new_backend/`)
```
new_backend/
├── main.py                 # FastAPI app entry point
├── models.py              # Pydantic models & enums
├── workflow_state_machine.py  # Recruitment workflow logic
├── supabase_client.py     # Database connection
├── run_server.py          # Server startup script
├── setup.sql              # Database schema
├── requirements.txt       # Python dependencies
├── routers/               # API endpoints
│   ├── candidates_router.py
│   ├── workflow_router.py
│   ├── dashboard_router.py
│   ├── interviews_router.py
│   ├── events_router.py
│   ├── jobs_router.py
│   └── ai_router.py
├── services/              # Business logic
│   ├── candidate_service.py
│   ├── workflow_service.py
│   ├── event_service.py
│   ├── job_service.py
│   └── interview_service.py
└── utils/                 # Utility functions
```

### Frontend (`frontend/`)
- React/TypeScript application
- Uses shadcn/ui components
- Supabase integration for auth and data

## Key Conventions

### 1. Database Schema
- **Candidates Table**: Core recruitment data with stage tracking
- **Jobs Table**: Job postings and requirements
- **Events Table**: Recruitment events and career fairs
- **Interviews Table**: Interview scheduling and management
- **Stage History**: Audit trail for candidate progression

### 2. Recruitment Workflow Stages
```python
# Valid stages (from models.py)
APPLIED = "applied"
SCREENING = "screening"
INTERVIEW_SCHEDULED = "interview-scheduled"
INTERVIEWING = "interviewing"
INTERVIEW_COMPLETED = "interview-completed"
ADDITIONAL_INTERVIEW = "additional-interview"
FINAL_REVIEW = "final-review"
OFFER_EXTENDED = "offer-extended"
NEGOTIATING = "negotiating"
ON_HOLD = "on-hold"
HIRED = "hired"
REJECTED = "rejected"
```

### 3. API Endpoints
- **Base URL**: `http://localhost:8001`
- **Docs**: `http://localhost:8001/docs`
- **Workflow**: `/workflow/*` endpoints for stage management
- **Candidates**: `/candidates/*` for candidate CRUD
- **Jobs**: `/jobs/*` for job management
- **Events**: `/events/*` for event management
- **Interviews**: `/interviews/*` for interview scheduling

### 4. File Naming Conventions
- **Python files**: snake_case (`candidate_service.py`)
- **Classes**: PascalCase (`CandidateService`)
- **Functions**: snake_case (`get_candidate_by_id`)
- **Constants**: UPPER_SNAKE_CASE (`RECRUITMENT_STAGES`)
- **Database columns**: snake_case (`applied_date`)

### 5. Import Structure
```python
# Always use relative imports within modules
from .models import Candidate, RecruitmentStage
from .services import candidate_service
from .routers import candidates_router
```

## Development Rules

### 1. Backend Development
- **Framework**: FastAPI with Pydantic models
- **Database**: Supabase (PostgreSQL) with pgvector
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Dependencies**: See `requirements.txt`

### 2. Frontend Development
- **Framework**: React with TypeScript
- **UI Library**: shadcn/ui components
- **State Management**: Zustand stores
- **API Client**: Custom services with Supabase client

### 3. Database Rules
- **Primary Keys**: Always UUID with `gen_random_uuid()`
- **Timestamps**: `created_at`, `updated_at` on all tables
- **Soft Deletes**: Use `status` field instead of hard deletes
- **Foreign Keys**: Proper CASCADE/SET NULL rules
- **Indexes**: On frequently queried columns

### 4. API Design Rules
- **RESTful**: Follow REST conventions
- **Validation**: Use Pydantic models for request/response
- **Error Handling**: Consistent error responses
- **Pagination**: For list endpoints
- **Filtering**: Query parameters for filtering

### 5. Workflow Rules
- **Stage Transitions**: Must be validated by state machine
- **Action Logging**: All actions logged in stage history
- **Audit Trail**: Complete history of candidate progression
- **Permissions**: Role-based access control

## Important Commands

### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python run_server.py

# Or directly with uvicorn
uvicorn main:app --reload --port 8001
```

### Database Setup
```sql
-- Run setup.sql in Supabase SQL editor
-- Enable pgvector extension
-- Create all tables and indexes
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Key Files to Remember

### Backend Core Files
- `main.py` - FastAPI app configuration
- `models.py` - All data models and enums
- `workflow_state_machine.py` - Recruitment workflow logic
- `supabase_client.py` - Database connection setup

### Documentation Files
- `INTEGRATION_SUMMARY.md` - Integration approach
- `DATABASE_MODEL.md` - Database schema details
- `CHANGES_SUMMARY.md` - Recent changes
- `README.md` - Project overview

### Configuration Files
- `requirements.txt` - Python dependencies
- `setup.sql` - Database schema
- `serviceAccount.json` - Supabase credentials

## Development Workflow

### 1. Feature Development
1. Update models if needed
2. Add service layer logic
3. Create/update router endpoints
4. Test with API docs
5. Update frontend if needed

### 2. Database Changes
1. Update `setup.sql`
2. Run migration in Supabase
3. Update models if needed
4. Test data operations

### 3. Workflow Changes
1. Update `workflow_state_machine.py`
2. Update models (enums)
3. Update services
4. Test stage transitions

## Common Issues & Solutions

### 1. Import Errors
- Check `__init__.py` files exist in packages
- Use relative imports within modules
- Check Python path and virtual environment

### 2. Database Connection
- Verify Supabase credentials in `serviceAccount.json`
- Check network connectivity
- Verify table permissions

### 3. Workflow Issues
- Check stage transitions in state machine
- Verify action permissions
- Check stage history logging

### 4. Frontend Integration
- Check API endpoint URLs
- Verify CORS settings
- Check authentication tokens

## Security Considerations

### 1. Authentication
- Use Supabase Auth for user management
- Implement role-based access control
- Secure API endpoints with proper authentication

### 2. Data Protection
- Encrypt sensitive data
- Implement proper input validation
- Use prepared statements for database queries

### 3. File Uploads
- Validate file types and sizes
- Scan for malware
- Store in secure cloud storage

## Performance Guidelines

### 1. Database
- Use proper indexes
- Implement pagination for large datasets
- Use vector search for AI features

### 2. API
- Implement caching where appropriate
- Use async operations for I/O
- Optimize database queries

### 3. Frontend
- Implement lazy loading
- Use React.memo for expensive components
- Optimize bundle size

---

**Last Updated**: Current session
**Version**: 1.0
**Maintainer**: Development Team 