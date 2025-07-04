const API_BASE_URL = 'http://localhost:8001';

export interface WorkflowAction {
    id: string;
    label: string;
    description: string;
    nextStage?: string;
    requiresInput?: boolean;
    variant?: 'default' | 'destructive' | 'outline';
}

export interface StageInfo {
    id: string;
    label: string;
    description: string;
    color: string;
    actions: WorkflowAction[];
}

// Define workflow stages and their available actions
export const WORKFLOW_STAGES: Record<string, StageInfo> = {
    applied: {
        id: 'applied',
        label: 'Applied',
        description: 'Initial application received',
        color: 'blue',
        actions: [
            {
                id: 'shortlist',
                label: 'Shortlist',
                description: 'Move to screening phase',
                nextStage: 'screened',
                variant: 'default'
            },
            {
                id: 'reject',
                label: 'Reject',
                description: 'Reject application',
                nextStage: 'rejected',
                variant: 'destructive',
                requiresInput: true
            },
            {
                id: 'put-on-hold',
                label: 'Put on Hold',
                description: 'Pause application process',
                nextStage: 'on-hold',
                variant: 'outline'
            }
        ]
    },
    screened: {
        id: 'screened',
        label: 'Screened',
        description: 'Resume reviewed and screened',
        color: 'yellow',
        actions: [
            {
                id: 'schedule-interview',
                label: 'Schedule Interview',
                description: 'Schedule first interview',
                nextStage: 'interview-scheduled',
                variant: 'default'
            },
            {
                id: 'reject-after-screening',
                label: 'Reject',
                description: 'Reject after screening',
                nextStage: 'rejected',
                variant: 'destructive',
                requiresInput: true
            }
        ]
    },
    shortlisted: {
        id: 'shortlisted',
        label: 'Shortlisted',
        description: 'Candidates ready for next phase',
        color: 'green',
        actions: [
            {
                id: 'schedule-interview',
                label: 'Schedule Interview',
                description: 'Schedule first interview',
                nextStage: 'interview-scheduled',
                variant: 'default'
            },
            {
                id: 'reject',
                label: 'Reject',
                description: 'Reject candidate',
                nextStage: 'rejected',
                variant: 'destructive',
                requiresInput: true
            }
        ]
    },
    'interview-scheduled': {
        id: 'interview-scheduled',
        label: 'Interview Scheduled',
        description: 'Interview has been scheduled',
        color: 'purple',
        actions: [
            {
                id: 'start-interview',
                label: 'Start Interview',
                description: 'Begin interview session',
                nextStage: 'interviewing',
                variant: 'default'
            },
            {
                id: 'reschedule',
                label: 'Reschedule',
                description: 'Reschedule interview',
                nextStage: 'interview-scheduled',
                variant: 'outline'
            },
            {
                id: 'cancel-and-reject',
                label: 'Cancel & Reject',
                description: 'Cancel interview and reject',
                nextStage: 'rejected',
                variant: 'destructive'
            }
        ]
    },
    interviewing: {
        id: 'interviewing',
        label: 'Interviewing',
        description: 'Interview in progress',
        color: 'orange',
        actions: [
            {
                id: 'complete-interview',
                label: 'Complete Interview',
                description: 'Mark interview as completed',
                nextStage: 'interview-completed',
                variant: 'default'
            }
        ]
    },
    'interview-completed': {
        id: 'interview-completed',
        label: 'Interview Completed',
        description: 'Interview finished, awaiting review',
        color: 'green',
        actions: [
            {
                id: 'move-to-final-review',
                label: 'Move to Final Review',
                description: 'Move to decision phase',
                nextStage: 'final-review',
                variant: 'default'
            },
            {
                id: 'request-another-interview',
                label: 'Schedule Another Interview',
                description: 'Request additional interview',
                nextStage: 'additional-interview',
                variant: 'outline'
            },
            {
                id: 'reject-after-interview',
                label: 'Reject',
                description: 'Reject after interview',
                nextStage: 'rejected',
                variant: 'destructive'
            }
        ]
    },
    'final-review': {
        id: 'final-review',
        label: 'Final Review',
        description: 'Final decision making',
        color: 'indigo',
        actions: [
            {
                id: 'extend-offer',
                label: 'Extend Offer',
                description: 'Send job offer',
                nextStage: 'offer-extended',
                variant: 'default'
            },
            {
                id: 'final-reject',
                label: 'Final Reject',
                description: 'Final rejection',
                nextStage: 'rejected',
                variant: 'destructive'
            }
        ]
    },
    'offer-extended': {
        id: 'offer-extended',
        label: 'Offer Extended',
        description: 'Job offer sent to candidate',
        color: 'emerald',
        actions: [
            {
                id: 'offer-accepted',
                label: 'Offer Accepted',
                description: 'Candidate accepted offer',
                nextStage: 'hired',
                variant: 'default'
            },
            {
                id: 'offer-declined',
                label: 'Offer Declined',
                description: 'Candidate declined offer',
                nextStage: 'rejected',
                variant: 'destructive'
            },
            {
                id: 'negotiate-offer',
                label: 'Negotiate',
                description: 'Enter negotiation phase',
                nextStage: 'negotiating',
                variant: 'outline'
            }
        ]
    },
    hired: {
        id: 'hired',
        label: 'Hired',
        description: 'Successfully hired',
        color: 'green',
        actions: []
    },
    rejected: {
        id: 'rejected',
        label: 'Rejected',
        description: 'Application rejected',
        color: 'red',
        actions: []
    }
};

export const getAvailableActions = (stage: string): WorkflowAction[] => {
    const stageInfo = WORKFLOW_STAGES[stage];
    return stageInfo ? stageInfo.actions : [];
};

export const getStageInfo = (stage: string): StageInfo | null => {
    return WORKFLOW_STAGES[stage] || null;
};

export const getActionLabel = (actionId: string): string => {
    for (const stage of Object.values(WORKFLOW_STAGES)) {
        const action = stage.actions.find(a => a.id === actionId);
        if (action) return action.label;
    }
    return actionId;
};

export const getCurrentStage = (candidate: any): string => {
    return candidate.stage || candidate.currentStage || 'applied';
};

export const performWorkflowAction = async (
    candidateId: string,
    action: string,
    notes?: string
): Promise<{ success: boolean; message: string; newStage?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                performed_by: 'user',
                notes: notes || `Performed action: ${action}`
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            message: result.message || `Action ${action} completed successfully`,
            newStage: result.new_stage
        };
    } catch (error) {
        console.error('Error performing workflow action:', error);
        throw error;
    }
};

export const getCandidateActions = async (candidateId: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching candidate actions:', error);
        return [];
    }
};

export const scheduleInterview = async (
    candidateId: string,
    interviewData: {
        date: string;
        time: string;
        interviewer: string;
        room?: string;
        notes?: string;
    }
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/schedule-interview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(interviewData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error scheduling interview:', error);
        throw error;
    }
}; 