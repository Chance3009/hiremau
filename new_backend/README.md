# HireMau Backend API

A comprehensive AI-powered HR/Recruitment platform backend built with FastAPI, Supabase, and modern AI technologies.

## 🚀 Features

### Core HR/Recruitment
- **Candidate Management**: Complete candidate lifecycle from application to hire
- **Job Postings**: Create, manage, and track job openings with advanced filtering
- **Event Management**: Career fairs, recruitment events, and virtual meetups
- **Interview Scheduling**: Automated interview scheduling and management
- **Workflow Automation**: Customizable recruitment workflows and stage transitions

### AI-Powered Features
- **Job Description Extraction**: Extract structured job details from unstructured text
- **Skills Suggestion**: AI-powered skills and requirements suggestions
- **Candidate Analysis**: Automated candidate profile analysis and insights
- **Candidate Comparison**: Compare multiple candidates for positions
- **Interview Questions**: Generate contextual interview questions
- **Profile Enrichment**: AI-powered candidate profile enhancement

### Analytics & Dashboard
- **Real-time Analytics**: Live recruitment pipeline metrics
- **Conversion Tracking**: Stage-to-stage conversion rates
- **Performance Metrics**: Recruiter and hiring manager performance
- **Custom Reports**: Flexible reporting and data export

### Technical Features
- **Vector Search**: Semantic search using embeddings
- **Document Processing**: Resume parsing and document analysis
- **Multi-tenant Support**: Row-level security for data isolation
- **Audit Trail**: Complete change tracking and compliance
- **RESTful API**: Comprehensive API with OpenAPI documentation

## 🏗️ Architecture

```
new_backend/
├── main.py                 # FastAPI application entry point
├── models.py              # Pydantic models and data validation
├── supabase_client.py     # Supabase database client
├── requirements.txt       # Python dependencies
├── run_server.py         # Server startup script
├── DATABASE_MODEL.md     # Complete database schema
├── README.md             # This file
├── candidate_service.py  # Candidate business logic
├── candidates_router.py  # Candidate API endpoints
├── job_service.py        # Job business logic
├── jobs_router.py        # Job API endpoints
├── event_service.py      # Event business logic
├── events_router.py      # Event API endpoints
├── interview_service.py  # Interview business logic
├── interviews_router.py  # Interview API endpoints
├── dashboard_router.py   # Dashboard and analytics endpoints
├── ai_router.py          # AI-powered features endpoints
└── venv/                 # Virtual environment
```

## 🛠️ Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI/ML**: Google Gemini, OpenAI, LangChain
- **Vector Search**: ChromaDB, Sentence Transformers
- **Authentication**: Supabase Auth
- **Document Processing**: PyPDF2, pdfplumber, pytesseract
- **Testing**: pytest, pytest-asyncio
- **Code Quality**: black, isort, flake8, mypy

## 📋 Prerequisites

- Python 3.10+
- Supabase account and project
- Google Gemini API key (optional, for AI features)
- OpenAI API key (optional, for advanced AI features)

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
cd new_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the `new_backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `DATABASE_MODEL.md` in your Supabase SQL editor
3. Update your `.env` file with the Supabase URL and key

### 4. Start the Server

```bash
# Option 1: Using the run script
python run_server.py

# Option 2: Direct uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Option 3: Using the main file
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔧 API Endpoints

### Core Endpoints

#### Candidates (`/candidates`)
- `GET /` - List all candidates with filtering
- `POST /` - Create new candidate
- `GET /{id}` - Get candidate by ID
- `PUT /{id}` - Update candidate
- `DELETE /{id}` - Delete candidate
- `GET /by-stage/{stage}` - Get candidates by recruitment stage
- `GET /workflow/summary` - Get workflow summary
- `POST /{id}/actions/{action}` - Perform workflow action
- `GET /analytics/summary` - Get candidate analytics

#### Jobs (`/jobs`)
- `GET /` - List all jobs with filtering
- `POST /` - Create new job
- `GET /{id}` - Get job by ID
- `PUT /{id}` - Update job
- `DELETE /{id}` - Delete job
- `GET /{id}/candidates` - Get candidates for job
- `GET /{id}/pipeline` - Get job recruitment pipeline
- `GET /analytics/summary` - Get job analytics

#### Events (`/events`)
- `GET /` - List all events with filtering
- `POST /` - Create new event
- `GET /{id}` - Get event by ID
- `PUT /{id}` - Update event
- `DELETE /{id}` - Delete event
- `GET /upcoming/` - Get upcoming events
- `GET /past/` - Get past events
- `GET /{id}/analytics` - Get event analytics
- `GET /{id}/candidates` - Get candidates for event

#### Interviews (`/interviews`)
- `GET /` - List all interviews with filtering
- `POST /` - Create new interview
- `GET /{id}` - Get interview by ID
- `PUT /{id}` - Update interview
- `DELETE /{id}` - Delete interview
- `POST /{id}/start` - Start interview session
- `POST /{id}/complete` - Complete interview
- `POST /{id}/reschedule` - Reschedule interview
- `POST /{id}/cancel` - Cancel interview
- `GET /scheduled` - Get scheduled interviews
- `GET /today` - Get today's interviews

#### Dashboard (`/dashboard`)
- `GET /overview` - Get comprehensive dashboard overview
- `GET /events` - Get dashboard events data
- `GET /jobs` - Get dashboard jobs data
- `GET /recent-activity` - Get recent activity
- `GET /analytics/pipeline` - Get pipeline analytics
- `GET /metrics/recruitment-funnel` - Get recruitment funnel
- `GET /performance/recruiters` - Get recruiter performance

#### AI Features (`/ai`)
- `POST /extract-job-details` - Extract job details from text
- `POST /suggest-skills` - Suggest skills for job description
- `POST /analyze-candidate` - Analyze candidate profile
- `POST /compare-candidates` - Compare multiple candidates
- `POST /generate-interview-questions` - Generate interview questions
- `POST /enrich-candidate` - Enrich candidate profile
- `GET /agent-status` - Get AI service status

## 🔐 Authentication & Security

The API uses Supabase for authentication and row-level security:

- **JWT Tokens**: Secure token-based authentication
- **Row Level Security**: Data isolation between users/organizations
- **Input Validation**: All inputs validated through Pydantic models
- **Audit Trail**: Complete change tracking for compliance

## 🧪 Testing

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=.

# Run specific test file
pytest test_candidates.py

# Run tests with verbose output
pytest -v
```

## 📊 Database Schema

The complete database schema is documented in `DATABASE_MODEL.md` and includes:

- **Core Tables**: candidates, jobs, events, interviews
- **Supporting Tables**: workflow_actions, ai_analysis, documents, vector_embeddings
- **Audit Tables**: audit_log
- **Indexes**: Performance and vector search indexes
- **Triggers**: Automatic timestamp updates and audit logging
- **Views**: Analytics and reporting views

## 🔄 Migration from Old Backend

This new backend is a complete migration from the old Firestore-based backend:

### What's New
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Enhanced AI Features**: More comprehensive AI-powered functionality
- **Better Performance**: Optimized queries and indexing
- **Improved Security**: Row-level security and audit trails
- **Comprehensive API**: More endpoints and better documentation

### Migration Steps
1. **Data Migration**: Export data from Firestore and import to Supabase
2. **API Updates**: Update frontend to use new API endpoints
3. **Environment Setup**: Configure new environment variables
4. **Testing**: Verify all functionality works with new backend

## 🚀 Deployment

### Local Development
```bash
python run_server.py
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Using Docker
docker build -t hiremau-backend .
docker run -p 8000:8000 hiremau-backend
```

### Environment Variables for Production
```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_KEY=your_production_supabase_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the database schema in `DATABASE_MODEL.md`
- Open an issue in the repository

## 🔮 Roadmap

- [ ] Multi-company support
- [ ] Advanced workflow automation
- [ ] Real-time notifications
- [ ] Advanced reporting dashboards
- [ ] External ATS integrations
- [ ] Mobile app API
- [ ] Advanced AI features
- [ ] Performance optimizations 