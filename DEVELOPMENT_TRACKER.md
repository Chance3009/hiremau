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
[2024-01-XX] - Created PROJECT_RULES.md
  - Added project structure documentation
  - Defined naming conventions
  - Added development workflow

[2024-01-XX] - Implemented recruitment workflow
  - Added 12 recruitment stages
  - Created workflow state machine
  - Integrated with candidate service

[2024-01-XX] - Database schema updates
  - Added stage_history field to candidates
  - Created candidate_stage_history table
  - Added workflow-related indexes

[2024-01-XX] - API endpoint creation
  - Added /workflow/* endpoints
  - Created candidate action endpoints
  - Added stage transition validation
```

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
- `performed_by` (TEXT) - Who performed action
- `timestamp` (TIMESTAMP) - When performed
```

---

## 🚀 Integration Plan

### Phase 1: Core Setup ✅
- [x] Project structure setup
- [x] Database schema creation
- [x] Basic models and enums
- [x] Supabase connection
- **Test**: ✅ Database connection working
- **Status**: COMPLETE

### Phase 2: Recruitment Pipeline ✅
- [x] Workflow state machine
- [x] Stage definitions
- [x] Action definitions
- [x] Basic workflow service
- **Test**: ✅ Stage transitions working
- **Status**: COMPLETE

### Phase 3: API Development ✅
- [x] Candidate router
- [x] Workflow router
- [x] Basic CRUD operations
- [x] Action endpoints
- **Test**: ✅ API endpoints responding
- **Status**: COMPLETE

### Phase 4: Frontend Integration 🔄
- [ ] Frontend workflow integration
- [ ] Stage visualization
- [ ] Action buttons
- [ ] Real-time updates
- **Test**: ⏳ Pending frontend tests
- **Status**: IN PROGRESS

### Phase 5: Advanced Features 📋
- [ ] AI integration
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Reporting dashboard
- **Test**: ⏳ Not started
- **Status**: PLANNED

### Phase 6: Production Ready 📋
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation
- **Test**: ⏳ Not started
- **Status**: PLANNED

---

## 🔄 Update Tracking

### Synchronization Checklist
When making changes, update these files:

#### Code Changes
- [ ] `models.py` - Update enums/models
- [ ] `workflow_state_machine.py` - Update transitions
- [ ] `services/*.py` - Update business logic
- [ ] `routers/*.py` - Update API endpoints

#### Documentation Updates
- [ ] `DEVELOPMENT_TRACKER.md` - Update this file
- [ ] `PROJECT_RULES.md` - Update rules if needed
- [ ] `API_ENDPOINTS.md` - Update endpoint list
- [ ] `DATABASE_MODEL.md` - Update schema docs

#### Integration Updates
- [ ] Update integration plan status
- [ ] Add new test checkpoints
- [ ] Update change logs
- [ ] Update version history

### Update Workflow
1. **Make Code Changes**
2. **Test Changes**
3. **Update Documentation**
4. **Update Integration Plan**
5. **Commit with Descriptive Message**

---

## 🛠️ Development Workflow

### Daily Development Process
1. **Check Current Status**
   - Review integration plan
   - Check current phase
   - Review pending tasks

2. **Make Changes**
   - Follow naming conventions
   - Update models if needed
   - Test changes immediately

3. **Update Documentation**
   - Update change logs
   - Update structure docs
   - Update integration plan

4. **Test & Validate**
   - Run API tests
   - Check database operations
   - Verify workflow logic

5. **Commit & Track**
   - Commit with clear message
   - Update version history
   - Mark phase completion

### Quality Gates
- ✅ Code follows naming conventions
- ✅ API endpoints documented
- ✅ Database schema updated
- ✅ Tests passing
- ✅ Documentation updated
- ✅ Integration plan updated

---

## 📊 Status Dashboard

### Current Status
- **Phase**: 3 (API Development)
- **Status**: 90% Complete
- **Next Milestone**: Frontend Integration
- **Blockers**: None

### Recent Activity
- ✅ Workflow state machine implemented
- ✅ API endpoints created
- ✅ Database schema finalized
- 🔄 Frontend integration in progress

### Upcoming Tasks
1. Complete frontend workflow integration
2. Add AI analysis features
3. Implement email notifications
4. Create reporting dashboard

---

**Last Updated**: Current Session
**Version**: 1.0.0
**Maintainer**: Development Team 