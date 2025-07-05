from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class RecruitmentStage(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWING = "interviewing"
    INTERVIEW_COMPLETED = "interview_completed"
    FINAL_REVIEW = "final_review"
    OFFER_EXTENDED = "offer_extended"
    HIRED = "hired"
    REJECTED = "rejected"


class CandidateStatus(str, Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    WITHDRAWN = "withdrawn"
    REJECTED = "rejected"
    HIRED = "hired"


class StageTransition(BaseModel):
    from_stage: RecruitmentStage
    to_stage: RecruitmentStage
    action: str
    notes: Optional[str]
    performed_by: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CandidateStageHistory(BaseModel):
    candidate_id: str
    transitions: List[StageTransition]
    current_stage: RecruitmentStage
    current_status: CandidateStatus
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class CandidateCreate(BaseModel):
    name: str
    email: str
    phone: str
    current_position: str
    years_experience: int
    education: str
    experience: str
    skills: List[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    availability: str
    salary_expectations: float
    preferred_work_type: str
    source: str
    notes: Optional[str]
    job_id: Optional[str]
    event_id: Optional[str]


class CandidateUpdate(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    current_position: Optional[str]
    years_experience: Optional[int]
    education: Optional[str]
    experience: Optional[str]
    skills: Optional[List[str]]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    availability: Optional[str]
    salary_expectations: Optional[float]
    preferred_work_type: Optional[str]
    source: Optional[str]
    notes: Optional[str]
    job_id: Optional[str]
    event_id: Optional[str]
    stage: Optional[RecruitmentStage]
    status: Optional[CandidateStatus]


class Candidate(CandidateCreate):
    id: str
    stage: RecruitmentStage = RecruitmentStage.APPLIED
    status: CandidateStatus = CandidateStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resume_url: Optional[str]
    ai_analysis_id: Optional[str]


class CandidateAIAnalysisCreate(BaseModel):
    candidate_id: str
    analysis_json: dict
    model_version: str = "gemini-pro-v1"


class CandidateAIAnalysis(CandidateAIAnalysisCreate):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
