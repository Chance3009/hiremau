"""Data models for candidate profile enrichment."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime


class WorkExperience(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    graduation_year: Optional[str] = None
    description: Optional[str] = None


class Certification(BaseModel):
    name: Optional[str] = None
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None


class Course(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    completion_date: Optional[str] = None


class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    url: Optional[str] = None


class Publication(BaseModel):
    title: Optional[str] = None
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None


class Patent(BaseModel):
    title: Optional[str] = None
    patent_number: Optional[str] = None
    issue_date: Optional[str] = None
    description: Optional[str] = None


class Recommendation(BaseModel):
    recommender_name: Optional[str] = None
    relationship: Optional[str] = None
    text: Optional[str] = None


class VolunteerExperience(BaseModel):
    organization: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class GitHubRepository(BaseModel):
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    url: str


class LinkedInProfile(BaseModel):
    profile_url: Optional[str] = None
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    linkedin_id: Optional[str] = None
    linkedin_num_id: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country_code: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None
    position: Optional[str] = None
    current_position: Optional[str] = None
    current_company: Optional[str] = None
    current_company_name: Optional[str] = None
    current_company_company_id: Optional[str] = None
    work_experience: List[WorkExperience] = []
    experience: Optional[str] = None
    education: List[Education] = []
    educations_details: Optional[str] = None
    skills: List[str] = []
    certifications: List[Certification] = []
    courses: List[Course] = []
    projects: List[Project] = []
    publications: List[Publication] = []
    patents: List[Patent] = []
    recommendations: List[Recommendation] = []
    recommendations_count: Optional[int] = None
    volunteer_experience: List[VolunteerExperience] = []
    organizations: List[str] = []
    languages: List[str] = []
    honors_and_awards: List[str] = []
    connections_count: Optional[int] = None
    connections: Optional[int] = None
    followers_count: Optional[int] = None
    followers: Optional[int] = None
    posts: Optional[str] = None
    activity: Optional[str] = None
    bio_links: List[str] = []
    similar_profiles: List[str] = []
    people_also_viewed: Optional[str] = None
    avatar: Optional[str] = None
    default_avatar: Optional[bool] = None
    banner_image: Optional[str] = None
    memorialized_account: Optional[bool] = None
    # Analysis fields
    profile_completeness: Optional[str] = None
    professional_credibility: Optional[str] = None
    career_progression: Optional[str] = None
    industry_relevance: Optional[str] = None


class GitHubProfile(BaseModel):
    username: Optional[str] = None
    profile_url: Optional[str] = None
    bio: Optional[str] = None
    followers: Optional[int] = None
    following: Optional[int] = None
    public_repos: Optional[int] = None
    top_repositories: List[GitHubRepository] = []
    primary_languages: List[str] = []
    contribution_stats: Dict[str, Any] = {}


class WebsiteProfile(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    key_content: List[str] = []


class CandidateAssessment(BaseModel):
    """Comprehensive candidate assessment from synthesizer agent."""
    candidate_name: str
    location: Optional[str] = None
    contact_information: Dict[str, str] = {}
    professional_summary: Optional[str] = None

    # Professional Background
    current_role: Optional[str] = None
    experience_level: Optional[str] = None
    career_progression: Optional[str] = None
    industry_experience: Optional[str] = None
    key_achievements: List[str] = []

    # Technical Profile
    primary_skills: List[str] = []
    programming_languages: List[str] = []
    github_activity: Optional[str] = None
    technical_projects: List[str] = []
    certifications: List[str] = []

    # Education & Learning
    formal_education: List[str] = []
    continuous_learning: List[str] = []
    languages: List[str] = []
    professional_development: Optional[str] = None

    # Professional Network & Credibility
    linkedin_connections: Optional[int] = None
    linkedin_followers: Optional[int] = None
    recommendations: List[str] = []
    professional_organizations: List[str] = []
    publications: List[str] = []
    speaking_engagements: List[str] = []

    # Digital Presence & Portfolio
    website_quality: Optional[str] = None
    content_creation: List[str] = []
    social_proof: Optional[str] = None
    personal_branding: Optional[str] = None

    # Cultural Fit Indicators
    volunteer_experience: List[str] = []
    interests: List[str] = []
    communication_style: Optional[str] = None
    collaboration_indicators: Optional[str] = None

    # Hiring Assessment
    overall_rating: Optional[int] = None  # 1-10 scale
    strengths: List[str] = []
    potential_concerns: List[str] = []
    role_fit_analysis: Optional[str] = None
    interview_recommendations: List[str] = []
    reference_check_priorities: List[str] = []

    # Data Quality & Completeness
    profile_completeness: Optional[str] = None
    data_sources: List[str] = []
    missing_information: List[str] = []
    authenticity_score: Optional[int] = None  # 1-10 scale

    # Red Flags & Risk Assessment
    employment_gaps: List[str] = []
    inconsistencies: List[str] = []
    limited_digital_presence: Optional[bool] = None
    other_concerns: List[str] = []


class CandidateProfile(BaseModel):
    candidate_name: str
    sources_found: List[str] = []
    linkedin: Optional[LinkedInProfile] = None
    github: Optional[GitHubProfile] = None
    website: Optional[WebsiteProfile] = None
    assessment: Optional[CandidateAssessment] = None
    enrichment_summary: str = ""
    authenticity_score: str = "medium"  # high|medium|low
    red_flags: List[str] = []
    timestamp: datetime = datetime.now()


class CandidateInput(BaseModel):
    """Input structure for candidate sourcing requests."""
    name: str
    linkedin_url: Optional[str] = None
    github_username: Optional[str] = None
    website_url: Optional[str] = None
    email: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None
