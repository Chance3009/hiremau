# Development Tracker & Memory System

## 📋 Table of Contents
1. [Stage & Action Definitions](#stage--action-definitions)
2. [Change Logs](#change-logs)
3. [Structure Documentation](#structure-documentation)
4. [Integration Plan](#integration-plan)
5. [Update Tracking](#update-tracking)
6. [Development Workflow](#development-workflow)
7. [Interview Management Data Requirements](#interview-management-data-requirements)

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

## 🎤 Interview Management Data Requirements

### Core Interview Data Structure
```typescript
interface Interview {
  // Basic Information
  id: string;
  candidateId: string;
  jobId: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral' | 'final';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  
  // Scheduling Information
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // minutes
  timezone: string;
  location?: string; // for in-person
  meetingLink?: string; // for video calls
  roomId?: string;
  
  // Participants
  interviewer: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  interviewers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    isPrimary: boolean;
  }>;
  
  // Interview Content
  questions: Array<{
    id: string;
    question: string;
    category: 'technical' | 'behavioral' | 'cultural' | 'experience';
    expectedAnswer?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
  }>;
  
  // Evaluation Criteria
  evaluationCriteria: Array<{
    criterion: string;
    weight: number;
    description: string;
    maxScore: number;
  }>;
  
  // Results & Feedback
  feedback: {
    technicalScore: number;
    communicationScore: number;
    culturalFitScore: number;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
    notes: string;
    decision: 'pass' | 'fail' | 'maybe';
  };
  
  // AI Analysis
  aiAnalysis?: {
    sentimentAnalysis: {
      confidence: number;
      enthusiasm: number;
      nervousness: number;
    };
    keywordExtraction: string[];
    responseQuality: number;
    communicationPatterns: {
      clarity: number;
      conciseness: number;
      relevance: number;
    };
    redFlags: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}
```

### Candidate Interview History
```typescript
interface CandidateInterviewHistory {
  candidateId: string;
  interviews: Array<{
    interviewId: string;
    type: string;
    date: string;
    interviewer: string;
    status: string;
    score: number;
    feedback: string;
  }>;
  overallProgress: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}
```

### Interview Scheduling Data
```typescript
interface InterviewScheduling {
  // Availability Management
  interviewerAvailability: Array<{
    interviewerId: string;
    date: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      isBooked: boolean;
      conflictReason?: string;
    }>;
  }>;
  
  // Room Management
  roomAvailability: Array<{
    roomId: string;
    roomName: string;
    capacity: number;
    equipment: string[];
    date: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      bookedBy?: string;
    }>;
  }>;
  
  // Candidate Preferences
  candidateAvailability: {
    preferredTimes: string[];
    blackoutTimes: string[];
    timezone: string;
    preferredType: 'phone' | 'video' | 'in-person';
  };
}
```

### Interview Analytics Data
```typescript
interface InterviewAnalytics {
  // Performance Metrics
  metrics: {
    totalInterviews: number;
    completionRate: number;
    averageDuration: number;
    averageScore: number;
    noShowRate: number;
    rescheduleRate: number;
  };
  
  // Interviewer Performance
  interviewerStats: Array<{
    interviewerId: string;
    name: string;
    totalInterviews: number;
    averageScore: number;
    feedbackQuality: number;
    timeliness: number;
    candidateSatisfaction: number;
  }>;
  
  // Question Effectiveness
  questionAnalytics: Array<{
    questionId: string;
    question: string;
    timesAsked: number;
    averageScore: number;
    discriminationIndex: number;
    candidateFeedback: number;
  }>;
  
  // Trends & Insights
  trends: {
    scoreTrends: Array<{
      period: string;
      averageScore: number;
      passRate: number;
    }>;
    popularInterviewTypes: Array<{
      type: string;
      count: number;
      successRate: number;
    }>;
  };
}
```

### Data Collection Points for Dynamic System

#### 1. **Real-time Interview Data**
- Live scoring during interviews
- Real-time notes and observations
- Time tracking for each question/section
- Interruption and pause tracking
- Audio/video quality metrics

#### 2. **Candidate Interaction Data**
- Response times
- Verbal and non-verbal cues (future AI integration)
- Question clarifications requested
- Confidence levels observed
- Technical demonstration results

#### 3. **Interview Flow Data**
- Question sequence and timing
- Skip patterns and adaptations
- Interviewer deviations from script
- Technical difficulties encountered
- Interview environment factors

#### 4. **Post-Interview Data**
- Immediate feedback capture
- Collaborative scoring (multi-interviewer)
- Reference check integration
- Background check status
- Decision timeline tracking

#### 5. **Integration Data Points**
- Calendar system integration
- Email/SMS notification logs
- Video conferencing platform data
- Document sharing and review
- Compliance and recording permissions

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
[2024-01-XX] - Interview Management System Complete ⭐ MAJOR MILESTONE
  - Interview Lobby: Comprehensive dashboard with real-time interview monitoring
  - Interview Scheduling: AI-powered scheduling with availability management
  - Live Interview: Full interview conductor with timer, questions, AI analysis
  - Interview Analytics: Performance metrics and interviewer statistics
  - AI Integration: Sentiment analysis, communication patterns, red flag detection
  - Real-time Features: Live scoring, timer, progress tracking, media controls
  - Preparation Management: Resume review, question generation, material readiness
  - Room Management: Virtual and physical room booking and management

[2024-01-XX] - Recruitment Pipeline Major Enhancement
  - Applied Candidates: Added bulk operations, candidate selection, enhanced AI insights
  - Shortlisted Candidates: Complete redesign with offer management and metrics dashboard
  - Added comprehensive stats overview with real-time calculations
  - Enhanced candidate cards with scoring visualization and offer status tracking
  - Implemented proper error handling and loading states throughout pipeline
  - Added deadline warnings and decision tracking features

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
| Recruitment Pipeline | ✅ Complete | 90% | Applied Candidates enhanced, Shortlisted complete with metrics |
| Interview Management | ✅ Complete | 95% | Comprehensive system: Lobby, Scheduling, Live Interview, AI analysis |
| Settings/Admin | 📋 Planned | 0% | Company files, RAG integration |

### Current Focus Areas
1. **Interview Management** - ✅ **COMPLETED** - Full system with lobby, scheduling, live interviews, AI analysis
2. **Settings & Admin** - Company file management, RAG integration, system configuration
3. **Backend Integration** - Real API connections, authentication, database operations
4. **Advanced AI Features** - Enhanced resume parsing, interview insights, predictive analytics

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

### Interviews API (NEW - To Be Implemented)
- `GET /interviews/` - List all interviews
- `GET /interviews/{id}/` - Get interview details
- `POST /interviews/` - Create new interview
- `PUT /interviews/{id}/` - Update interview
- `DELETE /interviews/{id}/` - Delete interview
- `GET /interviews/candidate/{candidateId}/` - Get candidate's interview history
- `GET /interviews/interviewer/{interviewerId}/` - Get interviewer's interviews
- `POST /interviews/{id}/start/` - Start interview session
- `POST /interviews/{id}/complete/` - Complete interview
- `GET /interviews/analytics/` - Get interview analytics
- `GET /interviews/availability/` - Get availability data
- `POST /interviews/schedule/` - Schedule new interview

### AI API
- `POST /ai/extract-job-details/` - Extract job details from text
- `POST /ai/suggest-skills/` - Suggest skills for job
- `POST /ai/analyze-interview/` - Analyze interview performance (NEW)
- `POST /ai/generate-questions/` - Generate interview questions (NEW)
- `POST /ai/evaluate-response/` - Evaluate candidate response (NEW)
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

### interviews (NEW - To Be Implemented)
- `id` (UUID, PK) - Unique identifier
- `candidate_id` (UUID, FK) - Reference to candidate
- `job_id` (UUID, FK) - Reference to job
- `interviewer_id` (UUID, FK) - Primary interviewer
- `type` (TEXT) - Interview type
- `status` (TEXT) - Interview status
- `scheduled_date` (TIMESTAMP) - Scheduled date/time
- `duration` (INTEGER) - Duration in minutes
- `location` (TEXT) - Location or meeting link
- `questions_json` (JSONB) - Interview questions
- `feedback_json` (JSONB) - Interview feedback
- `scores_json` (JSONB) - Scoring data
- `ai_analysis_json` (JSONB) - AI analysis results
- `created_at` (TIMESTAMP) - Creation date
- `updated_at` (TIMESTAMP) - Last update

### interview_participants (NEW)
- `id` (UUID, PK) - Unique identifier
- `interview_id` (UUID, FK) - Reference to interview
- `user_id` (UUID, FK) - Reference to user/interviewer
- `role` (TEXT) - Participant role
- `is_primary` (BOOLEAN) - Is primary interviewer

### interview_questions (NEW)
- `id` (UUID, PK) - Unique identifier
- `question` (TEXT, NOT NULL) - Question text
- `category` (TEXT) - Question category
- `difficulty` (TEXT) - Difficulty level
- `expected_answer` (TEXT) - Expected answer
- `time_limit` (INTEGER) - Time limit in minutes
- `created_at` (TIMESTAMP) - Creation date

### candidate_stage_history
- `id` (UUID, PK) - Unique identifier
- `candidate_id` (UUID, FK) - Reference to candidate
- `action` (TEXT) - Action performed
- `from_stage` (TEXT) - Previous stage
- `to_stage` (TEXT) - New stage
- `notes` (TEXT) - Action notes
- `performed_by`