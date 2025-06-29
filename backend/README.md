# 🚀 HireMau Backend API

## Overview

FastAPI-powered backend service for the HireMau recruitment platform, providing comprehensive recruitment workflow management with AI-powered features.

## 🏗️ Architecture

```
backend/
├── routers/                 # API route definitions
│   ├── candidates.py       # Candidate management endpoints
│   ├── jobs.py             # Job posting endpoints
│   ├── interviews.py       # Interview management
│   ├── events.py           # Recruitment event handling
│   ├── workflow.py         # Workflow state management
│   └── ai.py               # AI-powered features
├── services/                # Business logic layer
│   ├── candidate_service.py # Candidate operations
│   ├── workflow_service.py  # Workflow management
│   └── interview_service.py # Interview operations
├── models.py               # Pydantic data models
├── firestore_client.py     # Database client
├── workflow_state_machine.py # State machine logic
└── main.py                 # FastAPI application entry
```

## 🎯 Key Features

### Recruitment Workflow Engine
- **12-stage workflow** with clear state transitions
- **State machine validation** prevents invalid transitions
- **Audit trail** for all candidate actions
- **Flexible hold/reactivation** system

### AI-Powered Analysis
- **Resume screening** with Gemini Pro integration
- **Skill extraction** and job matching
- **Candidate ranking** algorithms
- **Interview question generation**

### Comprehensive API
- **RESTful endpoints** for all operations
- **Advanced filtering** and search capabilities
- **Real-time updates** via WebSocket (planned)
- **OpenAPI documentation** at `/docs`

## 🚦 Quick Start

### Prerequisites
- Python 3.8+
- Google Cloud Firestore account
- Gemini API key (optional, for AI features)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hiremau/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Setup

```env
# Database Configuration
FIRESTORE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# AI Integration (Optional)
GEMINI_API_KEY=your-gemini-api-key

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Server Configuration
HOST=0.0.0.0
PORT=8001
RELOAD=true
```

### Run the Server

```bash
python main.py
```

The API will be available at:
- **API**: http://localhost:8001
- **Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## 📊 Recruitment Workflow

### States
1. **Applied** - New applications
2. **Screening** - Resume review
3. **Interview Scheduled** - Appointment booked
4. **Interviewing** - Live interview
5. **Interview Completed** - Awaiting evaluation
6. **Additional Interview** - Multiple rounds
7. **Final Review** - Decision making
8. **Offer Extended** - Job offer made
9. **Negotiating** - Salary discussion
10. **On Hold** - Process paused
11. **Hired** ✅ - Success (terminal)
12. **Rejected** ❌ - Process ended (terminal)

### Valid Transitions
See [RECRUITMENT_WORKFLOW.md](./RECRUITMENT_WORKFLOW.md) for complete workflow documentation.

## 🔌 API Endpoints

### Candidates
```http
GET    /candidates/                    # List all candidates with filters
POST   /candidates/                    # Create new candidate
GET    /candidates/{id}                # Get candidate details
PUT    /candidates/{id}                # Update candidate
DELETE /candidates/{id}                # Delete candidate
GET    /candidates/{id}/actions        # Get available actions
POST   /candidates/{id}/actions/{action} # Perform workflow action
```

### Jobs
```http
GET    /jobs/                          # List all jobs
POST   /jobs/                          # Create new job
GET    /jobs/{id}                      # Get job details
PUT    /jobs/{id}                      # Update job
DELETE /jobs/{id}                      # Delete job
```

### Workflow
```http
GET    /workflow/stages                # Get all workflow stages
GET    /workflow/actions               # Get all available actions
GET    /workflow/stages/{stage}/actions # Get actions for specific stage
POST   /workflow/validate-transition   # Validate state transition
GET    /workflow/flow-diagram          # Get workflow diagram data
```

### AI Features
```http
POST   /ai/extract-job-details         # Extract job details from text
POST   /ai/suggest-skills              # Suggest skills for position
POST   /ai/analyze-candidate           # Analyze candidate fit
```

## 🗄️ Database Schema

### Candidates Collection
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "position": "string",
  "currentStage": "applied|screening|interview-scheduled|...",
  "status": "active|on-hold|rejected|hired",
  "stageHistory": [
    {
      "fromStage": "applied",
      "toStage": "screening",
      "action": "shortlist",
      "performedBy": "recruiter_001",
      "timestamp": "2024-01-15T10:00:00Z",
      "notes": "Strong technical background"
    }
  ],
  "skills": ["React", "TypeScript", "Node.js"],
  "aiAnalysis": {
    "overallMatch": 85.5,
    "skillMatches": [...],
    "cultureFit": 90.0
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_workflow.py

# Run tests with output
pytest -v -s
```

## 📈 Performance

### Optimization Features
- **Database indexing** on frequently queried fields
- **Response caching** for static data
- **Pagination** for large result sets
- **Async operations** for external API calls

### Monitoring
- **Health check** endpoint for uptime monitoring
- **Structured logging** for debugging
- **Request metrics** (planned)
- **Error tracking** integration ready

## 🔒 Security

### Authentication & Authorization
- **JWT token** support (planned)
- **Role-based access** control
- **API rate limiting** (planned)
- **CORS protection** configured

### Data Protection
- **Input validation** with Pydantic models
- **SQL injection** prevention (NoSQL database)
- **Sensitive data** encryption (planned)
- **Audit logging** for all operations

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t hiremau-backend .

# Run container
docker run -p 8001:8001 --env-file .env hiremau-backend
```

### Cloud Deployment
- **Google Cloud Run** ready
- **Heroku** compatible
- **AWS Lambda** with Mangum adapter
- **Kubernetes** deployment configs (planned)

## 📝 Development

### Code Standards
- **PEP 8** style guidelines
- **Type hints** throughout codebase
- **Docstrings** for all functions
- **Error handling** with proper HTTP status codes

### Adding New Features
1. Create feature branch
2. Add models in `models.py`
3. Implement service logic in `services/`
4. Add API routes in `routers/`
5. Write tests
6. Update documentation

### Database Migrations
When changing data models:
1. Update Pydantic models
2. Create migration script if needed
3. Test with sample data
4. Document breaking changes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- **API Docs**: Available at `/docs` when server is running
- **Workflow Guide**: [RECRUITMENT_WORKFLOW.md](./RECRUITMENT_WORKFLOW.md)
- **Examples**: [WORKFLOW_EXAMPLES.md](./WORKFLOW_EXAMPLES.md)
- **State Machine**: [workflow_state_machine.py](./workflow_state_machine.py)

## 🐛 Troubleshooting

### Common Issues

**ImportError: No module named 'google.cloud'**
```bash
pip install google-cloud-firestore
```

**CORS errors from frontend**
- Check `CORS_ORIGINS` in `.env`
- Ensure frontend URL is included

**Firestore permission denied**
- Verify service account credentials
- Check Firestore security rules

**AI features not working**
- Ensure `GEMINI_API_KEY` is set
- Check API quota limits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 