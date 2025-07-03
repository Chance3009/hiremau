# Development Tracker & Memory System

## 📋 Table of Contents
1. [Stage & Action Definitions](#stage--action-definitions)
2. [Change Logs](#change-logs)
3. [Structure Documentation](#structure-documentation)
4. [Integration Plan](#integration-plan)
5. [Update Tracking](#update-tracking)
6. [Development Workflow](#development-workflow)

---

## 🎯 Stage & Action Definitions

### Recruitment Stages Memory
| Stage | Meaning | Description | Typical Duration | Key Actions |
|-------|---------|-------------|------------------|-------------|
| `applied` | Initial Application | Candidate submitted application | 1-3 days | shortlist, reject, put-on-hold |
| `screening` | Resume Review | HR/Recruiter reviewing candidate | 2-5 days | schedule-interview, reject-after-screening |
| `interview-scheduled` | Interview Booked | Interview scheduled with candidate | 1-7 days | start-interview, reschedule, cancel-and-reject |
| `interviewing` | Interview in Progress | Currently interviewing | 30-90 min | complete-interview, pause-interview |
| `interview-completed` | Interview Done | Interview finished, awaiting review | 1-3 days | move-to-final-review, request-another-interview |
| `additional-interview` | Second Round | Additional interviews needed | 3-7 days | schedule-next-interview, skip-additional |
| `final-review` | Decision Making | Final team review | 2-5 days | extend-offer, final-reject |
| `offer-extended` | Offer Sent | Offer letter sent to candidate | 3-10 days | offer-accepted, offer-declined, negotiate-offer |
| `negotiating` | Salary Negotiation | Negotiating offer terms | 1-7 days | update-offer, negotiation-failed |
| `on-hold` | Paused | Process temporarily paused | Variable | reactivate, reject-from-hold |
| `hired` | Success | Candidate accepted and hired | N/A | N/A (terminal) |
| `rejected` | Not Selected | Candidate not moving forward | N/A | N/A (terminal) |

### Action Definitions Memory
| Action | From Stage | To Stage | Description | Required Fields |
|--------|------------|----------|-------------|-----------------|
| `shortlist` | applied | screening | Move to screening phase | notes (optional) |
| `reject` | applied | rejected | Reject application | reason |
| `schedule-interview` | screening | interview-scheduled | Schedule first interview | interviewer, date, time |
| `start-interview` | interview-scheduled | interviewing | Begin interview process | room (optional) |
| `complete-interview` | interviewing | interview-completed | Finish interview | notes, score |
| `move-to-final-review` | interview-completed | final-review | Move to final decision | notes |
| `extend-offer` | final-review | offer-extended | Send offer letter | salary, start_date |
| `offer-accepted` | offer-extended | hired | Candidate accepts offer | acceptance_date |
| `offer-declined` | offer-extended | rejected | Candidate declines offer | reason |

---

## 📝 Change Logs

### Version History
| Version | Date | Changes | Status | Tester |
|---------|------|---------|--------|--------|
| v1.0.0 | 2024-01-XX | Initial setup | ✅ Complete | System |
| v1.1.0 | 2024-01-XX | Recruitment pipeline | ✅ Complete | System |
| v1.2.0 | 2024-01-XX | Workflow integration | ✅ Complete | System |
| v1.3.0 | 2024-01-XX | Mock data loading | ⚠️ Partial | System |

### Recent Changes Log
```
[2024-01-XX] - Job Openings Enhancement Complete
  - Added file upload functionality with AI parsing simulation
  - Implemented bulk selection and operations
  - Enhanced search and filtering capabilities
  - Improved job card design with tags and priority indicators
  - Added analytics integration and better navigation

[2024-01-XX] - Events Management Complete
  - Enhanced event cards with better UX and actions
  - Added QR registration functionality
  - Improved event status filtering and management
  - Added comprehensive dropdown actions menu

[2024-01-XX] - Dashboard Enhancement Complete
  - Redesigned with personalized greeting and time-based messaging
  - Added recent activity feed and better metrics visualization
  - Enhanced quick actions with priority indicators
  - Improved responsive design and user experience
```

### Implementation Status
| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| Sidebar Navigation | ✅ Complete | 100% | Enhanced with user dropdown, role display, proper navigation grouping |
| Header/Top Bar | ✅ Complete | 100% | Context-aware filters, improved search, better notifications |
| Dashboard | ✅ Complete | 100% | Redesigned with personalized greeting, activity feed, enhanced metrics, better quick actions |
| Events Management | ✅ Complete | 100% | Enhanced with QR registration, better event cards, improved actions menu |
| Job Openings | ✅ Complete | 100% | Added file upload, AI parsing simulation, bulk actions, better search and filtering |
| Recruitment Pipeline | 🔄 In Progress | 10% | Starting complete stage management system |
| Interview Assistant | 📋 Planned | 0% | AI integration, real-time analysis |
| Settings/Admin | 📋 Planned | 0% | Company files, RAG integration |

### Current Focus Areas
1. **Navigation & Layout** - Fixing global filter context issues
2. **User Experience** - Streamlining workflows and reducing clutter
3. **Backend Integration** - Ensuring robust API connections
4. **AI Features** - Implementing resume parsing and interview analysis

---

## 🏗️ Structure Documentation

### API Endpoints Structure
```markdown
# API Endpoints Reference

## Base Configuration
- **Base URL**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Core Endpoints

### Candidates API
- `GET /candidates/` - List all candidates
- `GET /candidates/{id}/` - Get candidate details
- `POST /candidates/` - Create new candidate
- `PUT /candidates/{id}/` - Update candidate
- `DELETE /candidates/{id}/` - Delete candidate
- `GET /candidates/by-stage/{stage}/` - Get candidates by stage
- `GET /candidates/analytics/summary/` - Get analytics

### Workflow API
- `GET /workflow/summary/` - Get workflow summary
- `GET /workflow/stages/` - Get all stages
- `GET /workflow/stage/{stage}/candidates/` - Get candidates in stage
- `POST /candidates/{id}/action/{action}/` - Perform action
- `GET /candidates/{id}/available-actions/` - Get available actions

### Jobs API
- `GET /jobs/` - List all jobs
- `GET /jobs/{id}/` - Get job details
- `POST /jobs/` - Create new job
- `PUT /jobs/{id}/` - Update job
- `DELETE /jobs/{id}/` - Delete job

### Events API
- `GET /events/` - List all events
- `GET /events/{id}/` - Get event details
- `POST /events/` - Create new event
- `PUT /events/{id}/` - Update event
- `DELETE /events/{id}/` - Delete event

### Interviews API
- `GET /interviews/` - List all interviews
- `GET /interviews/{id}/` - Get interview details
- `POST /interviews/` - Create new interview
- `PUT /interviews/{id}/` - Update interview
- `DELETE /interviews/{id}/` - Delete interview

### AI API
- `POST /ai/extract-job-details/` - Extract job details from text
- `POST /ai/suggest-skills/` - Suggest skills for job
```

### Database Model Structure
```markdown
# Database Model Reference

## Core Tables

### candidates
- `id` (UUID, PK) - Unique identifier
- `name` (TEXT, NOT NULL) - Candidate name
- `email` (TEXT, UNIQUE) - Email address
- `phone` (TEXT) - Phone number
- `stage` (TEXT) - Current recruitment stage
- `status` (TEXT) - Active/Inactive/Archived
- `skills` (ARRAY) - Skills array
- `experience` (TEXT) - Work experience
- `education` (TEXT) - Education background
- `ai_profile_json` (JSONB) - AI analysis data
- `ai_profile_summary` (TEXT) - AI summary
- `created_at` (TIMESTAMP) - Creation date
- `updated_at` (TIMESTAMP) - Last update

### jobs
- `id` (UUID, PK) - Unique identifier
- `title` (TEXT, NOT NULL) - Job title
- `company` (TEXT) - Company name
- `location` (TEXT) - Job location
- `description` (TEXT) - Job description
- `requirements` (ARRAY) - Requirements array
- `status` (TEXT) - Open/Closed/Draft
- `created_at` (TIMESTAMP) - Creation date
- `updated_at` (TIMESTAMP) - Last update

### candidate_stage_history
- `id` (UUID, PK) - Unique identifier
- `candidate_id` (UUID, FK) - Reference to candidate
- `action` (TEXT) - Action performed
- `from_stage` (TEXT) - Previous stage
- `to_stage` (TEXT) - New stage
- `notes` (TEXT) - Action notes
- `performed_by`