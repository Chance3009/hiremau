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

export interface Candidate {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  currentCompany: string;
  skills: string[];
  experience: string;
  education: string;
  status: string;
  eventId: string;
  positionId: string;
  screeningScore: number;
  aiMatch: number;
  availability: string[];
  preferredTime: string;
  appliedDate: string;
  lastPosition: string;
  expectedSalary: string;
  location: string;
  visaStatus: string;
  tags: string[];
  screeningNotes: string;
  aiAnalysis: AIAnalysis;
  aiSummary: AISummary;
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