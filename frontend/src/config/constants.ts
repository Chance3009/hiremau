// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
    ENDPOINTS: {
        CANDIDATES: '/candidates',
        EVENTS: '/events',
        JOBS: '/jobs',
        INTERVIEWS: '/interviews',
        EVALUATIONS: '/evaluations'
    }
} as const;

// Recruitment stages in order
export const RECRUITMENT_STAGES = [
    "applied",
    "screened",
    "interview",
    "final-review",
    "shortlisted"
] as const;

export type RecruitmentStage = typeof RECRUITMENT_STAGES[number];

// Stage descriptions and metadata
export const STAGE_CONFIG = {
    applied: {
        label: "Applied",
        description: "Review applications and initial candidate assessment",
        actions: ["shortlist", "reject", "view-profile", "analyze-resume"]
    },
    screened: {
        label: "Screened",
        description: "Schedule or conduct interviews",
        actions: ["schedule-interview", "start-interview", "reject"]
    },
    interview: {
        label: "Interview",
        description: "Review interview results and compare candidates",
        actions: ["move-to-final", "request-another-interview", "reject"]
    },
    "final-review": {
        label: "Final Review",
        description: "Make final hiring decisions",
        actions: ["make-offer", "reject"]
    },
    shortlisted: {
        label: "Shortlisted",
        description: "Candidates ready for final offer",
        actions: ["make-offer", "compare-candidates", "reject"]
    }
} as const;

// Path patterns that indicate we're in the recruitment pipeline
export const RECRUITMENT_PATHS = [
    "/recruitment",
    "/candidates",
    "/interviews",
    "/interview",
    "/offers"
]; 