import { API_BASE_URL } from './config';

interface EventFilters {
    status?: string;
    date?: string;
    location?: string;
}

export async function fetchEvents(filters: EventFilters = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.location) params.append('location', filters.location);

    // Construct URL properly for FastAPI
    const baseUrl = `${API_BASE_URL}/events`;
    const url = params.toString() ? `${baseUrl}/?${params.toString()}` : `${baseUrl}/`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
}

export async function fetchEventById(id: string) {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
}

export async function createEvent(data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
}

export async function updateEvent(id: string, data: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
}

export async function deleteEvent(id: string) {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
} 