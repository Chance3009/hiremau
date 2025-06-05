// Recruitment stages in order
export const RECRUITMENT_STAGES = [
    "applied",
    "screened",
    "interviewed",
    "final-review",
    "hired"
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
    interviewed: {
        label: "Interviewed",
        description: "Review interview results and compare candidates",
        actions: ["move-to-final", "request-another-interview", "reject"]
    },
    "final-review": {
        label: "Final Review",
        description: "Make final hiring decisions",
        actions: ["make-offer", "reject"]
    },
    hired: {
        label: "Hired",
        description: "Begin onboarding process",
        actions: ["start-onboarding"]
    }
} as const;

// Path patterns that indicate we're in the recruitment pipeline
export const RECRUITMENT_PATHS = [
    "/recruitment",
    "/candidates",
    "/interviews",
    "/offers"
]; 