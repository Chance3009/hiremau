import { API_BASE_URL } from './config';

interface InterviewFilters {
    candidateId?: string;
    status?: string;
    interviewerId?: string;
    date?: string;
    type?: string;
}

export async function fetchInterviews(filters: InterviewFilters = {}) {
    const params = new URLSearchParams();

    if (filters.candidateId) params.append('candidate_id', filters.candidateId);
    if (filters.status) params.append('status', filters.status);
    if (filters.interviewerId) params.append('interviewer_id', filters.interviewerId);
    if (filters.date) params.append('date', filters.date);
    if (filters.type) params.append('type', filters.type);

    // Construct URL properly for FastAPI
    const baseUrl = `${API_BASE_URL}/interviews`;
    const url = params.toString() ? `${baseUrl}/?${params.toString()}` : `${baseUrl}/`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch interviews');
    return response.json();
}

export async function fetchInterviewById(id: string) {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch interview');
    return response.json();
}

export async function createInterview(data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/interviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create interview');
    return response.json();
}

export async function updateInterview(id: string, data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update interview');
    return response.json();
}

export async function deleteInterview(id: string) {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete interview');
    return response.json();
} 