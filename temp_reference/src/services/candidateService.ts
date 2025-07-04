import { API_BASE_URL } from './config';

interface CandidateFilters {
    positionId?: string;
    eventId?: string;
    stage?: string;
    status?: string;
}

export async function fetchCandidates(filters: CandidateFilters = {}) {
    const params = new URLSearchParams();

    if (filters.positionId) params.append('position_id', filters.positionId);
    if (filters.eventId) params.append('event_id', filters.eventId);
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.status) params.append('status', filters.status);

    // Construct URL properly: no trailing slash when query params exist
    const baseUrl = `${API_BASE_URL}/candidates`;
    const url = params.toString() ? `${baseUrl}/?${params.toString()}` : `${baseUrl}/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return response.json();
}

export async function fetchCandidateById(id: string) {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch candidate');
    return response.json();
}

export async function createCandidate(data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/candidates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create candidate');
    return response.json();
}

export async function updateCandidate(id: string, data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update candidate');
    return response.json();
}

export async function deleteCandidate(id: string) {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete candidate');
    return response.json();
}

// Workflow Actions
export async function performCandidateAction(candidateId: string, action: string, performedBy: string = 'user', notes?: string) {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performed_by: performedBy, notes }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to perform action');
    }
    return response.json();
}

export async function getAvailableActions(candidateId: string) {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions/`);
    if (!response.ok) throw new Error('Failed to get available actions');
    return response.json();
}

export async function shortlistCandidate(candidateId: string, notes?: string) {
    return performCandidateAction(candidateId, 'shortlist', 'user', notes);
}

export async function rejectCandidate(candidateId: string, notes?: string) {
    return performCandidateAction(candidateId, 'reject', 'user', notes);
}

export async function moveToFinal(candidateId: string, notes?: string) {
    return performCandidateAction(candidateId, 'move-to-final', 'user', notes);
}

export async function makeOffer(candidateId: string, notes?: string) {
    return performCandidateAction(candidateId, 'make-offer', 'user', notes);
}

export async function scheduleInterview(candidateId: string, interviewData: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/schedule-interview/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to schedule interview');
    }
    return response.json();
}

// Analytics and filtering
export async function getCandidatesByStage(stage: string) {
    const response = await fetch(`${API_BASE_URL}/candidates/by-stage/${stage}/`);
    if (!response.ok) throw new Error('Failed to fetch candidates by stage');
    return response.json();
}

export async function getCandidatesAnalytics() {
    const response = await fetch(`${API_BASE_URL}/candidates/analytics/summary/`);
    if (!response.ok) throw new Error('Failed to fetch candidates analytics');
    return response.json();
}

export async function getWorkflowSummary() {
    const response = await fetch(`${API_BASE_URL}/candidates/workflow/summary/`);
    if (!response.ok) throw new Error('Failed to fetch workflow summary');
    return response.json();
} 