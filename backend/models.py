from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from enum import Enum


# Recruitment workflow enums and types
class RecruitmentStage(str, Enum):
    # Core workflow stages
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

    # Terminal stages
    HIRED = "hired"
    REJECTED = "rejected"

    # Backward compatibility aliases
    SCREENED = "screening"  # Maps to SCREENING
    INTERVIEWED = "interview-completed"  # Maps to INTERVIEW_COMPLETED
    SHORTLISTED = "final-review"  # Maps to FINAL_REVIEW


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


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CULTURAL_FIT = "cultural-fit"
    FINAL = "final"
    INSTANT = "instant"


# Workflow models
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


# Existing models with workflow enhancements
class SkillMatch(BaseModel):
    skill: str
    score: float
    required: bool
    experience: str


class RiskFactor(BaseModel):
    type: str
    severity: str
    description: str


class Insight(BaseModel):
    type: str
    description: str


class LearningPath(BaseModel):
    skill: str
    priority: str
    estimatedTimeToAcquire: str


class AIAnalysis(BaseModel):
    overallMatch: float
    skillMatches: List[SkillMatch]
    cultureFit: float
    growthPotential: float
    riskFactors: List[RiskFactor]
    insights: List[Insight]
    recommendedRole: str
    similarRoles: List[str]
    learningPath: List[LearningPath]


class AISummary(BaseModel):
    strengths: List[str]
    considerations: List[str]
    fitAnalysis: str


class Candidate(BaseModel):
    id: str
    name: str
    position: str
    email: str
    phone: str
    currentCompany: str
    skills: List[str]
    experience: str
    education: str
    status: Literal['shortlist', 'kiv', 'reject', 'new',
                    'interview-scheduled', 'interviewing', 'final-review', 'offer-made']
    eventId: str
    positionId: str
    screeningScore: float
    aiMatch: float
    availability: List[str]
    preferredTime: str
    appliedDate: str
    lastPosition: str
    expectedSalary: str
    location: str
    visaStatus: str
    tags: List[str]
    screeningNotes: str
    aiAnalysis: AIAnalysis
    aiSummary: AISummary

    # Workflow fields
    currentStage: Optional[RecruitmentStage] = RecruitmentStage.APPLIED
    stageHistory: Optional[List[StageTransition]] = []
    lastActionDate: Optional[str] = None
    assignedRecruiter: Optional[str] = None

    # Additional fields for compatibility
    summary: Optional[str] = None
    fitScore: Optional[float] = None
    event: Optional[str] = None
    score: Optional[float] = None
    date: Optional[str] = None
    resume_url: Optional[str] = None


class Job(BaseModel):
    id: str
    title: str
    department: str
    location: str
    type: str
    experience: str
    salary: str
    status: str
    applicants: int
    shortlisted: int
    interviewed: int
    description: str
    requirements: Optional[List[str]] = []

    # Workflow fields
    hiringManagerId: Optional[str] = None
    recruiterIds: Optional[List[str]] = []
    targetHires: Optional[int] = 1
    priority: Optional[Literal["high", "medium", "low"]] = "medium"


class Interviewer(BaseModel):
    id: str
    name: str
    role: str
    email: Optional[str] = None
    department: Optional[str] = None
    availability: Optional[List[Dict[str, Any]]] = []


class Note(BaseModel):
    text: str
    timestamp: str
    author: Optional[str] = None


class KeyHighlight(BaseModel):
    type: str
    point: str
    confidence: float


class ResumeMatches(BaseModel):
    matching: List[str]
    discrepancies: List[str]


class ReportAIAnalysis(BaseModel):
    overallScore: float
    confidence: float
    strengths: List[str]
    concerns: List[str]
    keyHighlights: List[KeyHighlight]
    resumeMatches: ResumeMatches


class InterviewReport(BaseModel):
    id: str
    interviewId: str
    candidateId: str
    interviewer: Interviewer
    date: str
    duration: int
    quickLabels: List[str]
    quickNotes: List[Note]
    aiAnalysis: ReportAIAnalysis


class InterviewMessage(BaseModel):
    id: str
    type: Literal['question', 'answer']
    content: str
    timestamp: str
    category: Optional[str] = None
    rating: Optional[int] = None
    color: Optional[str] = None
    aiAnalysis: Optional[Dict[str, Any]] = None
    quickLabels: Optional[List[str]] = []


class Interview(BaseModel):
    id: str
    candidateId: str
    eventId: str
    date: str
    time: str
    duration: int
    type: InterviewType
    status: InterviewStatus
    interviewer: Interviewer
    room: str
    notes: List[Note]
    messages: Optional[List[InterviewMessage]] = []

    # Workflow fields
    scheduledBy: Optional[str] = None
    scheduledAt: Optional[str] = None
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    outcome: Optional[Literal["pass", "fail", "pending"]] = None
    nextSteps: Optional[List[str]] = []


class Event(BaseModel):
    id: str
    title: str
    date: str
    time: str
    location: str
    company: str
    status: str
    registrations: int
    positions: int
    interviews: int

    # Workflow fields
    organizerId: Optional[str] = None
    recruiters: Optional[List[str]] = []
    targetCandidates: Optional[int] = None


class InterviewEvaluation(BaseModel):
    overallScore: float
    technicalScore: float
    communicationScore: float
    culturalFitScore: float
    strengths: List[str]
    weaknesses: List[str]
    notes: List[str]
    recommendation: Literal['strong_yes', 'yes', 'maybe', 'no']


class RoomSession(BaseModel):
    interviewer: str
    candidate: str
    startTime: str
    endTime: str
    interviewId: Optional[str] = None


class Room(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    status: Literal['available', 'occupied', 'reserved', 'maintenance']
    currentSession: Optional[RoomSession] = None
    equipment: List[str]

    # Scheduling fields
    bookings: Optional[List[Dict[str, Any]]] = []
    availability: Optional[List[str]] = []


class Position(BaseModel):
    id: str
    title: str
    department: str
    location: str
    description: str
    requirements: List[str]

    # Workflow fields
    hiringManagerId: Optional[str] = None
    status: Optional[Literal["open", "closed", "on-hold"]] = "open"
    priority: Optional[Literal["high", "medium", "low"]] = "medium"


# Workflow response models
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
