// Position Types
export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
}

// Candidate Types
export interface SkillMatch {
  skill: string;
  score: number;
  required: boolean;
  experience: string;
}

export interface RiskFactor {
  type: string;
  severity: string;
  description: string;
}

export interface Insight {
  type: string;
  description: string;
}

export interface LearningPath {
  skill: string;
  priority: string;
  estimatedTimeToAcquire: string;
}

export interface AIAnalysis {
  overallMatch: number;
  skillMatches: SkillMatch[];
  cultureFit: number;
  growthPotential: number;
  riskFactors: RiskFactor[];
  insights: Insight[];
  recommendedRole: string;
  similarRoles: string[];
  learningPath: LearningPath[];
}

export interface AISummary {
  strengths: string[];
  considerations: string[];
  fitAnalysis: string;
}

export interface EvaluationData {
  communication_assessment?: string;
  experience_relevance?: string;
  education_background?: string;
  red_flags?: string;
  technical_competency_assessment?: string;
  strengths?: string;
  missing_required_skills?: string;
  interview_focus_areas?: string;
  cultural_fit_indicators?: string;
  standout_qualities?: string;
  potential_concerns?: string;
  recommendation_reasoning?: string;
  recommendation?: string;
  technical_skills?: string;
  career_progression?: string;
  resume_summary?: string;
  weaknesses?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  formatted_phone?: string;
  current_position?: string;
  years_experience?: number;
  education: string;
  stage: 'applied' | 'screening' | 'screened' | 'interviewed' | 'final-review' | 'shortlisted';
  status: string;
  country?: string;
  currency?: string;
  timezone?: string;
  salary_expectations?: number;
  formatted_salary?: string;
  availability?: string;
  preferred_work_type?: string;
  source?: string;
  skills: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  notes?: string;
  event_id?: string;
  job_id?: string;
  resume_files?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    uploaded_at: string;
  }>;
  candidate_files?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    uploaded_at: string;
  }>;
  evaluation_data?: EvaluationData[];
  evaluationData?: EvaluationData[];
  ai_analysis?: AIAnalysis[];
  created_at?: string;
  updated_at?: string;

  // Legacy fields for backward compatibility
  position?: string;
  currentCompany?: string;
  experience?: string;
  eventId?: string;
  positionId?: string;
  screeningScore?: number;
  aiMatch?: number;
  preferredTime?: string;
  appliedDate?: string;
  lastPosition?: string;
  expectedSalary?: string;
  location?: string;
  visaStatus?: string;
  tags?: string[];
  screeningNotes?: string;
  aiAnalysis?: AIAnalysis;
  aiSummary?: AISummary;

  // Workflow fields
  currentStage?: 'applied' | 'screened' | 'interviewed' | 'final-review' | 'shortlisted';
  stageHistory?: StageTransition[];
  lastActionDate?: string;
  assignedRecruiter?: string;
}

export interface StageTransition {
  candidateId: string;
  fromStage: string;
  toStage: string;
  action: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

// Interview Types
export interface Interviewer {
  id: string;
  name: string;
  role: string;
}

export interface Note {
  text: string;
  timestamp: string;
}

export interface InterviewMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: string;
  category?: string;
  rating?: number;
  color?: string;
  aiAnalysis?: {
    type: string;
    summary: string;
    confidence: number;
    keyPoints?: string[];
    resumeMatch?: boolean;
  };
  quickLabels?: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  eventId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  interviewer: Interviewer;
  room: string;
  notes: Note[];
  messages?: InterviewMessage[];
}

// Interview Report Types
export interface KeyHighlight {
  type: string;
  point: string;
  confidence: number;
}

export interface ResumeMatches {
  matching: string[];
  discrepancies: string[];
}

export interface ReportAIAnalysis {
  overallScore: number;
  confidence: number;
  strengths: string[];
  concerns: string[];
  keyHighlights: KeyHighlight[];
  resumeMatches: ResumeMatches;
}

export interface InterviewReport {
  id: string;
  interviewId: string;
  candidateId: string;
  interviewer: Interviewer;
  date: string;
  duration: number;
  quickLabels: string[];
  quickNotes: Note[];
  aiAnalysis: ReportAIAnalysis;
} 