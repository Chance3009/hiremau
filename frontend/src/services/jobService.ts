import { API_BASE_URL } from './config';

interface JobFilters {
    status?: string;
    department?: string;
    location?: string;
    priority?: string;
}

export async function fetchJobs(filters: JobFilters = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.department) params.append('department', filters.department);
    if (filters.location) params.append('location', filters.location);
    if (filters.priority) params.append('priority', filters.priority);

    // Construct URL properly for FastAPI
    const baseUrl = `${API_BASE_URL}/jobs`;
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
}

export async function fetchJobById(id: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
}

export async function createJob(data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
}

export async function updateJob(id: string, data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
}

export async function deleteJob(id: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
} 