# Development Tracker & Memory System

## 📋 Table of Contents
1. [Current Implementation Status](#current-implementation-status)
2. [Stage & Action Definitions](#stage--action-definitions)
3. [Change Logs](#change-logs)
4. [Structure Documentation](#structure-documentation)
5. [Integration Plan](#integration-plan)
6. [Update Tracking](#update-tracking)
7. [Development Workflow](#development-workflow)
8. [Interview Management Data Requirements](#interview-management-data-requirements)

---

## 🎯 Current Implementation Status

### ✅ COMPLETED: Candidate Registration System
**Date**: Current Session
**Status**: Fully Functional

#### Frontend Implementation:
- **CandidateIntakeForm**: Complete form with validation
  - Name, Email, Phone (required fields)
  - Event dropdown (fetches from Supabase)
  - Position dropdown (fetches from Supabase)
  - Resume upload to Supabase storage
  - Supporting documents upload (optional)
  - File validation (type and size)
  - Real-time form validation

- **CandidateIntake Page**: Registration workflow
  - Form submission handling
  - Success confirmation with candidate details
  - Next steps actions (Shortlist, KIV, Reject)
  - Reset form for new registrations
  - Integration with candidate list view

- **CandidateList Component**: Display candidates
  - Fetch candidates by stage
  - List and card view modes
  - Real-time loading states
  - Error handling

#### Backend Integration:
- **Direct Supabase Integration**: No backend API needed for basic operations
- **File Storage**: Automatic upload to Supabase storage buckets
  - `resumes/` bucket for resume files
  - `candidate-files/` bucket for supporting documents
- **Database Operations**: 
  - Insert candidate record
  - Create file records in `candidate_files` table
  - Create event registration in `event_registrations` table
  - Create stage history in `candidate_stage_history` table

#### Database Schema Utilization:
```sql
-- Using existing tables without modification:
candidates (name, email, phone, stage, status, source, notes)
candidate_files (candidate_id, file_type, file_url, file_name, file_size)
event_registrations (event_id, candidate_id)
candidate_stage_history (candidate_id, action, from_stage, to_stage)
events (id, title, name, status)
jobs (id, title, status)
```

#### Key Features Implemented:
1. **Minimal Data Collection**: Only essential fields required
2. **File Upload**: Resume and supporting documents with validation
3. **Event/Position Linking**: Dropdown selection from active records
4. **Incomplete Row Support**: Creates candidate with minimal data, other fields can be added later
5. **Stage Management**: Automatic placement in "applied" stage
6. **Error Handling**: Comprehensive error handling and user feedback
7. **Success Flow**: Clear confirmation and next steps

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
| `final-review` | Decision Making | Final team review | 2-5 days | extend-offer, final-reject |
| `offer-extended` | Offer Sent | Offer letter sent to candidate | 3-10 days | offer-accepted, offer-declined, negotiate-offer |
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
| Version | Date | Changes | Status | Implementation |
|---------|------|---------|--------|----------------|
| v1.0.0 | Current | Candidate Registration System | ✅ Complete | Direct Supabase Integration |

### Recent Changes Log
```
[Current Session] - Candidate Registration System Implementation ⭐ MAJOR MILESTONE
  Frontend Components:
  - ✅ CandidateIntakeForm: Complete form with validation and file uploads
  - ✅ CandidateIntake Page: Full registration workflow with success handling
  - ✅ CandidateList: Display candidates with multiple view modes
  - ✅ CandidateService: Direct Supabase integration for CRUD operations
  
  Database Integration:
  - ✅ File uploads to Supabase storage (resumes, supporting documents)
  - ✅ Candidate record creation with minimal required fields
  - ✅ Event registration linking
  - ✅ Stage history tracking
  - ✅ File metadata storage
  
  Key Features:
  - ✅ Form validation (required fields, file types, file sizes)
  - ✅ Dynamic dropdowns (events and positions from database)
  - ✅ File upload with progress and error handling
  - ✅ Success confirmation with next steps
  - ✅ Error handling and user feedback
  - ✅ Incomplete row support (minimal data entry)
```

### Implementation Status
| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| Candidate Registration | ✅ Complete | 100% | Fully functional with file uploads |
| Event/Position Dropdowns | ✅ Complete | 100% | Dynamic loading from Supabase |
| File Storage | ✅ Complete | 100% | Resume and supporting docs to Supabase |
| Database Integration | ✅ Complete | 100% | Direct Supabase operations |
| Form Validation | ✅ Complete | 100% | Client-side validation with error messages |
| Success Workflow | ✅ Complete | 100% | Confirmation and next steps |
| Error Handling | ✅ Complete | 100% | Comprehensive error management |

### Next Implementation Priorities
1. **AI Agent Integration** - Connect to backend agent for resume analysis
2. **Workflow Actions** - Implement shortlist/reject functionality
3. **Candidate Detail View** - Individual candidate profile pages
4. **Search and Filtering** - Enhanced candidate discovery
5. **Bulk Operations** - Multi-candidate actions

---

## 🏗️ Structure Documentation

### Frontend Architecture
```
frontend/src/
├── components/candidate/
│   ├── CandidateIntakeForm.tsx     ✅ Complete
│   ├── CandidateList.tsx           ✅ Complete
│   └── CandidateCard.tsx           📋 Existing
├── pages/
│   └── CandidateIntake.tsx         ✅ Complete
├── services/
│   └── candidateService.ts         ✅ Complete
└── lib/
    └── supabaseClient.ts           ✅ Complete
```

### Database Schema (Current Usage)
```sql
-- Core tables being used:
candidates: Basic candidate information
candidate_files: File storage metadata  
event_registrations: Event-candidate linking
candidate_stage_history: Workflow tracking
events: Available events for selection
jobs: Available positions for selection

-- Storage buckets:
resumes: Resume file storage
candidate-files: Supporting document storage
```

### API Integration Pattern
```typescript
// Direct Supabase Integration (No Backend API)
import { supabase } from '@/lib/supabaseClient';

// Create candidate with files
const candidate = await createCandidate({
  name, email, phone, event_id, job_id,
  resumeFile, supportingDocs
});

// Handles:
// 1. File uploads to storage
// 2. Database record creation
// 3. Related table updates
// 4. Error handling
```

---

## 🎯 Integration Plan

### Phase 1: ✅ COMPLETED - Basic Registration
- [x] Form creation with validation
- [x] File upload functionality
- [x] Database integration
- [x] Success/error handling

### Phase 2: 🚧 IN PROGRESS - AI Integration
- [ ] Connect to backend AI agent
- [ ] Resume text extraction
- [ ] Candidate profile analysis
- [ ] AI insights display

### Phase 3: 📋 PLANNED - Workflow Management
- [ ] Implement stage transitions
- [ ] Bulk candidate operations
- [ ] Advanced filtering and search
- [ ] Candidate detail views

### Phase 4: 📋 PLANNED - Advanced Features
- [ ] Real-time notifications
- [ ] Interview scheduling
- [ ] Email automation
- [ ] Analytics dashboard

---

## 📊 Technical Specifications

### File Upload Specifications
```typescript
// Resume files
- Formats: PDF, DOC, DOCX
- Max size: 5MB
- Storage: supabase.storage.from('resumes')

// Supporting documents  
- Formats: PDF, DOC, DOCX, JPG, PNG
- Max size: 5MB each
- Storage: supabase.storage.from('candidate-files')
```

### Form Validation Rules
```typescript
- Name: Required, min 2 characters
- Email: Required, valid email format
- Phone: Required, min 8 characters
- Event: Required, must exist in database
- Position: Required, must exist in database
- Resume: Optional, validated file type/size
- Supporting docs: Optional, multiple files allowed
```

### Database Operations Flow
```
1. Validate form data
2. Upload files to Supabase storage
3. Create candidate record
4. Create file metadata records
5. Create event registration
6. Create stage history entry
7. Return success confirmation
```

This implementation provides a solid foundation for the recruitment pipeline with minimal viable functionality that can be extended with AI features and advanced workflow management.

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