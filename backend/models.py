from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


# Enums
class RecruitmentStage(str, Enum):
    # Core workflow stages
    APPLIED = "applied"
    SCREENING = "screening"
    SCREENED = "screened"  # Added to match database constraint
    INTERVIEW_SCHEDULED = "interview-scheduled"
    INTERVIEWING = "interviewing"
    INTERVIEW_COMPLETED = "interview-completed"
    ADDITIONAL_INTERVIEW = "additional-interview"
    FINAL_REVIEW = "final-review"
    OFFER_EXTENDED = "offer-extended"
    NEGOTIATING = "negotiating"
    ON_HOLD = "on-hold"

    # Terminal stages
    HIRED = "hired"
    REJECTED = "rejected"

    # Backward compatibility aliases
    INTERVIEWED = "interview-completed"  # Maps to INTERVIEW_COMPLETED
    SHORTLISTED = "final-review"  # Maps to FINAL_REVIEW


class CandidateStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class CandidateAction(str, Enum):
    # Applied stage actions
    SHORTLIST = "shortlist"
    REJECT = "reject"
    PUT_ON_HOLD = "put-on-hold"
    VIEW_PROFILE = "view-profile"
    ANALYZE_RESUME = "analyze-resume"

    # Screening stage actions
    SCHEDULE_INTERVIEW = "schedule-interview"
    REJECT_AFTER_SCREENING = "reject-after-screening"
    UPDATE_SCREENING_NOTES = "update-screening-notes"

    # Interview Scheduled stage actions
    START_INTERVIEW = "start-interview"
    RESCHEDULE = "reschedule"
    CANCEL_AND_REJECT = "cancel-and-reject"
    REMIND_CANDIDATE = "remind-candidate"

    # Interviewing stage actions
    COMPLETE_INTERVIEW = "complete-interview"
    PAUSE_INTERVIEW = "pause-interview"
    CANCEL_INTERVIEW = "cancel-interview"

    # Interview Completed stage actions
    MOVE_TO_FINAL_REVIEW = "move-to-final-review"
    REQUEST_ANOTHER_INTERVIEW = "request-another-interview"
    REJECT_AFTER_INTERVIEW = "reject-after-interview"
    UPDATE_INTERVIEW_NOTES = "update-interview-notes"

    # Additional Interview stage actions
    SCHEDULE_NEXT_INTERVIEW = "schedule-next-interview"
    SKIP_ADDITIONAL = "skip-additional"

    # Final Review stage actions
    EXTEND_OFFER = "extend-offer"
    FINAL_REJECT = "final-reject"
    PUT_ON_HOLD_FOR_REVIEW = "put-on-hold-for-review"
    COMPARE_CANDIDATES = "compare-candidates"

    # Offer Extended stage actions
    OFFER_ACCEPTED = "offer-accepted"
    OFFER_DECLINED = "offer-declined"
    NEGOTIATE_OFFER = "negotiate-offer"
    WITHDRAW_OFFER = "withdraw-offer"

    # Negotiating stage actions
    UPDATE_OFFER = "update-offer"
    NEGOTIATION_FAILED = "negotiation-failed"
    ACCEPT_COUNTER_OFFER = "accept-counter-offer"

    # On Hold stage actions
    REACTIVATE = "reactivate"
    REJECT_FROM_HOLD = "reject-from-hold"
    UPDATE_HOLD_REASON = "update-hold-reason"

    # Backward compatibility aliases
    MAKE_OFFER = "extend-offer"  # Maps to EXTEND_OFFER
    MOVE_TO_FINAL = "move-to-final-review"  # Maps to MOVE_TO_FINAL_REVIEW
    SCREEN = "shortlist"  # Maps to SHORTLIST
    HIRE = "offer-accepted"  # Maps to OFFER_ACCEPTED


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CULTURE_FIT = "culture-fit"
    FINAL = "final"
    SCREENING = "screening"


class JobStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    DRAFT = "draft"
    PAUSED = "paused"


class EventStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FileType(str, Enum):
    RESUME = "resume"
    CERTIFICATE = "cert"
    TRANSCRIPT = "transcript"
    PORTFOLIO = "portfolio"
    OTHER = "other"


# Base Models
class BaseEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = "system"
    updated_by: str = "system"


# Company Profile
class CompanyProfile(BaseEntity):
    name: str
    address: Optional[str] = None
    industry: Optional[str] = None
    profile_text: Optional[str] = None


class CompanyProfileCreate(BaseModel):
    name: str
    address: Optional[str] = None
    industry: Optional[str] = None
    profile_text: Optional[str] = None


class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    profile_text: Optional[str] = None


# Workflow Models (defined before Candidate to avoid circular imports)
class StageTransition(BaseModel):
    candidateId: str
    fromStage: RecruitmentStage
    toStage: RecruitmentStage
    action: CandidateAction
    reason: Optional[str] = None
    performedBy: str
    timestamp: str
    notes: Optional[str] = None


class WorkflowAction(BaseModel):
    action: CandidateAction
    candidateId: str
    performedBy: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = {}
    notes: Optional[str] = None


class StageInfo(BaseModel):
    stage: RecruitmentStage
    label: str
    description: str
    actions: List[CandidateAction]
    candidateCount: int


class WorkflowSummary(BaseModel):
    totalCandidates: int
    stageBreakdown: List[StageInfo]
    recentTransitions: List[StageTransition]


class ActionResult(BaseModel):
    success: bool
    message: str
    candidateId: str
    newStage: Optional[RecruitmentStage] = None
    nextActions: Optional[List[CandidateAction]] = []


# Candidates (matching your schema)
class Candidate(BaseEntity):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: CandidateStatus = CandidateStatus.ACTIVE
    stage: RecruitmentStage = RecruitmentStage.APPLIED
    skills: Optional[Dict[str, Any]] = None  # JSONB
    education: Optional[str] = None
    experience: Optional[str] = None
    ai_profile_json: Optional[Dict[str, Any]] = None  # JSONB
    ai_profile_summary: Optional[str] = None
    profile_embedding: Optional[List[float]] = None  # Vector(1536)

    # Workflow fields
    currentStage: Optional[RecruitmentStage] = RecruitmentStage.APPLIED
    stageHistory: Optional[List[StageTransition]] = []
    lastActionDate: Optional[str] = None
    assignedRecruiter: Optional[str] = None


class CandidateCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None
    education: Optional[str] = None
    experience: Optional[str] = None


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[CandidateStatus] = None
    stage: Optional[RecruitmentStage] = None
    skills: Optional[Dict[str, Any]] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    ai_profile_json: Optional[Dict[str, Any]] = None
    ai_profile_summary: Optional[str] = None


# Candidate Files
class CandidateFile(BaseEntity):
    candidate_id: str
    file_type: FileType
    file_url: str
    extracted_text: Optional[str] = None


class CandidateFileCreate(BaseModel):
    candidate_id: str
    file_type: FileType
    file_url: str
    extracted_text: Optional[str] = None


# Candidate AI Analysis
class CandidateAIAnalysis(BaseEntity):
    candidate_id: str
    analysis_json: Dict[str, Any]  # JSONB
    model_version: str


class CandidateAIAnalysisCreate(BaseModel):
    candidate_id: str
    analysis_json: Dict[str, Any]
    model_version: str


# Candidate Stage History
class CandidateStageHistory(BaseEntity):
    candidate_id: str
    action: str
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None
    notes: Optional[str] = None
    performed_by: str
    status: str


class CandidateStageHistoryCreate(BaseModel):
    candidate_id: str
    action: str
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None
    notes: Optional[str] = None
    performed_by: str
    status: str


# Job Models
class JobBase(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[Dict] = None


class JobCreate(JobBase):
    status: str = "active"


class JobUpdate(JobBase):
    title: Optional[str] = None
    status: Optional[str] = None


class Job(JobBase):
    id: str
    status: str
    applicants: int = 0
    shortlisted: int = 0
    interviewed: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str = "system"
    updated_by: str = "system"

    class Config:
        from_attributes = True


# Event Models
class EventBase(BaseModel):
    title: str
    date: str
    time: Optional[str] = None
    location: str
    positions: Optional[int] = 0
    analytics_json: Optional[Dict] = None


class EventCreate(EventBase):
    status: str = "upcoming"


class EventUpdate(EventBase):
    title: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class Event(EventBase):
    id: str
    status: str
    registrations: int = 0
    interviews: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str = "system"
    updated_by: str = "system"

    class Config:
        from_attributes = True


# Event Registration Models
class EventRegistrationBase(BaseModel):
    candidate_id: str
    job_id: Optional[str] = None


class EventRegistrationCreate(EventRegistrationBase):
    event_id: str


class EventRegistration(EventRegistrationBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime
    created_by: str = "system"
    updated_by: str = "system"

    class Config:
        from_attributes = True


# Event Interview Models
class EventInterviewBase(BaseModel):
    candidate_id: str
    job_id: Optional[str] = None
    interviewer: Optional[str] = None
    scheduled_at: datetime


class EventInterviewCreate(EventInterviewBase):
    pass


class EventInterview(EventInterviewBase):
    id: str
    event_id: str
    status: str = "scheduled"
    feedback: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime
    created_by: str = "system"
    updated_by: str = "system"

    class Config:
        from_attributes = True


# Interviews (matching your schema)
class InterviewBase(BaseModel):
    candidate_id: str
    type: str = Field(default="technical")
    status: str = Field(default="not_started")


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    summary: Optional[Dict] = None


class Interview(InterviewBase):
    id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    summary: Optional[Dict] = None

    class Config:
        from_attributes = True


class InterviewStatus:
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterviewType:
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CULTURAL = "cultural"
    FINAL = "final"


# AI Models
class JobExtractionRequest(BaseModel):
    text: str


class SalaryInfo(BaseModel):
    min: str
    max: str
    currency: str
    period: str


class JobExtractionResponse(BaseModel):
    title: str
    department: str
    location: str
    description: str
    requirements: List[str]
    salary: Optional[SalaryInfo]
    employment_type: str
    experience_level: str
    benefits: List[str]


class SkillsSuggestionRequest(BaseModel):
    text: str


class SkillsSuggestionResponse(BaseModel):
    skills: List[str]


# Dashboard Models
class DashboardOverview(BaseModel):
    summary: Dict[str, Any]
    candidate_metrics: Dict[str, Any]
    job_metrics: Dict[str, Any]
    event_metrics: Dict[str, Any]
    interview_metrics: Dict[str, Any]


class DashboardEvents(BaseModel):
    events: List[Dict[str, Any]]
    total_events: int
    upcoming_events: int
    total_registrations: int
    total_candidates: int


class DashboardJobs(BaseModel):
    jobs: List[Dict[str, Any]]
    total_jobs: int
    active_jobs: int
    total_applicants: int
    avg_applicants_per_job: float


# Response Models
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class InterviewTranscript(BaseModel):
    interview_id: str
    speaker: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class InterviewAnalysis(BaseModel):
    confidence: float
    key_points: List[str]
    flags: List[str]
    recommendations: List[str]


class Interview(BaseModel):
    id: str
    candidate_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    transcript: List[InterviewTranscript] = []
    analysis: Optional[InterviewAnalysis] = None
    summary: Optional[Dict] = None


class InterviewCreate(BaseModel):
    candidate_id: str


class InterviewUpdate(BaseModel):
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    summary: Optional[Dict] = None


class InterviewStatus:
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterviewType:
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CULTURAL = "cultural"
    FINAL = "final"


# Event Position Models
class EventPositionBase(BaseModel):
    event_id: str
    job_id: str
    slots: Optional[int] = 0
    filled: Optional[int] = 0
    description: Optional[str] = None


class EventPositionCreate(EventPositionBase):
    pass


class EventPosition(EventPositionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str = "system"
    updated_by: str = "system"

    class Config:
        from_attributes = True
