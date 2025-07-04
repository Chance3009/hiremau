// Workflow utility functions for stage mapping and action handling

// Updated to match database constraint exactly
export type WorkflowStage = 'applied' | 'screened' | 'interview' | 'shortlisted' | 'final_review' | 'offer' | 'hired' | 'rejected' | 'declined' | 'onboarded';
export type WorkflowAction = 'shortlist' | 'reject' | 'schedule_interview' | 'move_to_shortlisted' | 'move_to_final' | 'make_offer' | 'hire' | 'mark_declined' | 'complete_onboarding';

// Stage configuration matching the database constraint
export const STAGE_CONFIG = {
    applied: {
        label: 'Applied',
        description: 'New applications for screening',
        color: 'bg-blue-100 text-blue-700',
        actions: ['shortlist', 'reject'] as WorkflowAction[]
    },
    screened: {
        label: 'Screened',
        description: 'Candidates ready for interview scheduling',
        color: 'bg-yellow-100 text-yellow-700',
        actions: ['schedule_interview', 'move_to_shortlisted', 'reject'] as WorkflowAction[]
    },
    interview: {
        label: 'Interview',
        description: 'Candidates scheduled for interviews',
        color: 'bg-purple-100 text-purple-700',
        actions: ['move_to_final', 'reject'] as WorkflowAction[]
    },
    shortlisted: {
        label: 'Shortlisted',
        description: 'Top candidates for final review',
        color: 'bg-green-100 text-green-700',
        actions: ['schedule_interview', 'move_to_final', 'reject'] as WorkflowAction[]
    },
    final_review: {
        label: 'Final Review',
        description: 'Final hiring decisions',
        color: 'bg-orange-100 text-orange-700',
        actions: ['make_offer', 'reject'] as WorkflowAction[]
    },
    offer: {
        label: 'Offer',
        description: 'Offer extended to candidate',
        color: 'bg-indigo-100 text-indigo-700',
        actions: ['hire', 'mark_declined', 'reject'] as WorkflowAction[]
    },
    hired: {
        label: 'Hired',
        description: 'Candidate accepted offer',
        color: 'bg-emerald-100 text-emerald-700',
        actions: ['complete_onboarding'] as WorkflowAction[]
    },
    rejected: {
        label: 'Rejected',
        description: 'Candidate rejected',
        color: 'bg-red-100 text-red-700',
        actions: [] as WorkflowAction[]
    },
    declined: {
        label: 'Declined',
        description: 'Candidate declined offer',
        color: 'bg-gray-100 text-gray-700',
        actions: [] as WorkflowAction[]
    },
    onboarded: {
        label: 'Onboarded',
        description: 'Candidate onboarded',
        color: 'bg-teal-100 text-teal-700',
        actions: [] as WorkflowAction[]
    }
};

// Action labels for UI display
export const ACTION_LABELS = {
    'shortlist': 'Shortlist',
    'reject': 'Reject',
    'schedule_interview': 'Schedule Interview',
    'move_to_shortlisted': 'Move to Shortlisted',
    'move_to_final': 'Move to Final Review',
    'make_offer': 'Make Offer',
    'hire': 'Hire',
    'mark_declined': 'Mark Declined',
    'complete_onboarding': 'Complete Onboarding'
};

// Get stage info
export function getStageInfo(stage: WorkflowStage) {
    return STAGE_CONFIG[stage] || STAGE_CONFIG.applied;
}

// Get stage color
export function getStageColor(stage: WorkflowStage): string {
    return getStageInfo(stage).color;
}

// Get stage label
export function getStageLabel(stage: WorkflowStage): string {
    return getStageInfo(stage).label;
}

// Get available actions for a stage
export function getAvailableActions(stage: WorkflowStage): WorkflowAction[] {
    return getStageInfo(stage).actions;
}

// Get action label
export function getActionLabel(action: WorkflowAction): string {
    return ACTION_LABELS[action] || action;
}

// Map legacy status to current stage (for backward compatibility)
export function mapStatusToStage(status: string): WorkflowStage {
    switch (status) {
        case 'new':
        case 'applied':
            return 'applied';
        case 'screening':
        case 'screened':
            return 'screened';
        case 'interview-scheduled':
        case 'interviewing':
        case 'interview':
            return 'interview';
        case 'shortlisted':
            return 'shortlisted';
        case 'final-review':
        case 'final_review':
            return 'final_review';
        case 'offer-made':
        case 'offer':
            return 'offer';
        case 'hired':
            return 'hired';
        case 'rejected':
            return 'rejected';
        case 'declined':
            return 'declined';
        case 'onboarded':
            return 'onboarded';
        default:
            return 'applied';
    }
}

// Get the current stage for display (prefers currentStage over status)
export function getCurrentStage(candidate: { currentStage?: WorkflowStage; status?: string; stage?: string }): WorkflowStage {
    // First check if candidate has a stage field (from backend)
    if (candidate.stage) {
        return candidate.stage as WorkflowStage;
    }
    // Fallback to currentStage or status mapping
    return candidate.currentStage || mapStatusToStage(candidate.status || 'applied');
}

// Check if an action is available for a candidate
export function isActionAvailable(candidate: { currentStage?: WorkflowStage; status?: string; stage?: string }, action: WorkflowAction): boolean {
    const stage = getCurrentStage(candidate);
    return getAvailableActions(stage).includes(action);
} 