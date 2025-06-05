export const RECRUITMENT_STAGES = [
    "job-posting",
    "application-review",
    "screening",
    "interviews",
    "offer",
    "onboarding"
] as const;

export type RecruitmentStage = typeof RECRUITMENT_STAGES[number];

// Path patterns that indicate we're in the recruitment pipeline
export const RECRUITMENT_PATHS = [
    "/recruitment",
    "/positions",
    "/candidates",
    "/interviews",
    "/offers"
]; 