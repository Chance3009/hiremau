// Workflow utility functions for stage mapping and action handling

export type WorkflowStage = 'applied' | 'screened' | 'interviewed' | 'final-review' | 'shortlisted';
export type WorkflowAction = 'shortlist' | 'reject' | 'schedule-interview' | 'start-interview' | 'move-to-final' | 'make-offer';

// Stage configuration matching the backend
export const STAGE_CONFIG = {
    applied: {
        label: 'Applied',
        description: 'New applications for screening',
        color: 'bg-blue-100 text-blue-700',
        actions: ['shortlist', 'reject'] as WorkflowAction[]
    },
    screened: {
        label: 'Screened',
        description: 'Schedule or conduct interviews',
        color: 'bg-yellow-100 text-yellow-700',
        actions: ['schedule-interview', 'start-interview', 'reject'] as WorkflowAction[]
    },
    interviewed: {
        label: 'Interviewed',
        description: 'Review interview results',
        color: 'bg-purple-100 text-purple-700',
        actions: ['move-to-final', 'reject'] as WorkflowAction[]
    },
    'final-review': {
        label: 'Final Review',
        description: 'Make final hiring decisions',
        color: 'bg-orange-100 text-orange-700',
        actions: ['make-offer', 'reject'] as WorkflowAction[]
    },
    shortlisted: {
        label: 'Shortlisted',
        description: 'Ready for offer',
        color: 'bg-green-100 text-green-700',
        actions: ['make-offer'] as WorkflowAction[]
    }
};

// Action labels for UI display
export const ACTION_LABELS = {
    'shortlist': 'Shortlist',
    'reject': 'Reject',
    'schedule-interview': 'Schedule Interview',
    'start-interview': 'Start Interview',
    'move-to-final': 'Move to Final Review',
    'make-offer': 'Make Offer'
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
        case 'shortlist':
        case 'screened':
            return 'screened';
        case 'interview-scheduled':
        case 'interviewing':
        case 'interviewed':
            return 'interviewed';
        case 'final-review':
            return 'final-review';
        case 'offer-made':
        case 'shortlisted':
            return 'shortlisted';
        default:
            return 'applied';
    }
}

// Get the current stage for display (prefers currentStage over status)
export function getCurrentStage(candidate: { currentStage?: WorkflowStage; status?: string }): WorkflowStage {
    return candidate.currentStage || mapStatusToStage(candidate.status || 'applied');
}

// Check if an action is available for a candidate
export function isActionAvailable(candidate: { currentStage?: WorkflowStage; status?: string }, action: WorkflowAction): boolean {
    const stage = getCurrentStage(candidate);
    return getAvailableActions(stage).includes(action);
} 