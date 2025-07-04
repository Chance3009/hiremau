// Scheduling service for real interview scheduling management
const API_BASE_URL = 'http://localhost:8001';

export interface Interviewer {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    is_active: boolean;
    availability_pattern: Record<string, string[]>;
    created_at: string;
    updated_at: string;
}

export interface Room {
    id: string;
    name: string;
    capacity: number;
    type: 'general' | 'event' | 'virtual';
    location?: string;
    equipment: string[];
    is_active: boolean;
    event_id?: string;
    created_at: string;
    updated_at: string;
}

export interface InterviewSchedule {
    id: string;
    candidate_id: string;
    interviewer_id: string;
    room_id?: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    interview_type: 'technical' | 'hr' | 'cultural' | 'final';
    interview_mode: 'in-person' | 'virtual' | 'hybrid';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    notes?: string;
    meeting_link?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface TimeSlot {
    time: string;
    is_available: boolean;
    status: 'available' | 'booked' | 'unavailable';
}

export interface DayAvailability {
    date: string;
    day: string;
    slots: TimeSlot[];
}

export interface InterviewScheduleRequest {
    candidate_id: string;
    interviewer_id: string;
    room_id?: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
    interview_type?: string;
    interview_mode?: string;
    notes?: string;
    meeting_link?: string;
    created_by?: string;
}

// API Functions
export const fetchInterviewers = async (activeOnly: boolean = true): Promise<Interviewer[]> => {
    try {
        const params = new URLSearchParams();
        if (activeOnly) params.append('active_only', 'true');

        const response = await fetch(`${API_BASE_URL}/scheduling/interviewers?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching interviewers:', error);
        throw error;
    }
};

export const fetchRooms = async (
    activeOnly: boolean = true,
    roomType?: string,
    eventId?: string
): Promise<Room[]> => {
    try {
        const params = new URLSearchParams();
        if (activeOnly) params.append('active_only', 'true');
        if (roomType) params.append('room_type', roomType);
        if (eventId) params.append('event_id', eventId);

        const response = await fetch(`${API_BASE_URL}/scheduling/rooms?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
};

export const fetchInterviewSchedules = async (filters?: {
    candidate_id?: string;
    interviewer_id?: string;
    room_id?: string;
    scheduled_date?: string;
    status?: string;
}): Promise<InterviewSchedule[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.candidate_id) params.append('candidate_id', filters.candidate_id);
        if (filters?.interviewer_id) params.append('interviewer_id', filters.interviewer_id);
        if (filters?.room_id) params.append('room_id', filters.room_id);
        if (filters?.scheduled_date) params.append('scheduled_date', filters.scheduled_date);
        if (filters?.status) params.append('status', filters.status);

        const response = await fetch(`${API_BASE_URL}/scheduling/interviews?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching interview schedules:', error);
        throw error;
    }
};

export const createInterviewSchedule = async (schedule: InterviewScheduleRequest): Promise<InterviewSchedule> => {
    try {
        const response = await fetch(`${API_BASE_URL}/scheduling/interviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(schedule),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating interview schedule:', error);
        throw error;
    }
};

export const fetchInterviewerAvailability = async (
    interviewerId: string,
    startDate: string,
    endDate: string
): Promise<DayAvailability[]> => {
    try {
        const params = new URLSearchParams();
        params.append('start_date', startDate);
        params.append('end_date', endDate);

        const response = await fetch(`${API_BASE_URL}/scheduling/availability/interviewers/${interviewerId}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching interviewer availability:', error);
        throw error;
    }
};

export const fetchRoomAvailability = async (
    roomId: string,
    startDate: string,
    endDate: string
): Promise<DayAvailability[]> => {
    try {
        const params = new URLSearchParams();
        params.append('start_date', startDate);
        params.append('end_date', endDate);

        const response = await fetch(`${API_BASE_URL}/scheduling/availability/rooms/${roomId}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching room availability:', error);
        throw error;
    }
};

export const fetchAvailabilitySummary = async (
    startDate: string,
    endDate: string
): Promise<{
    interviewers: Interviewer[];
    rooms: Room[];
    scheduled_interviews: InterviewSchedule[];
    date_range: { start: string; end: string };
}> => {
    try {
        const params = new URLSearchParams();
        params.append('start_date', startDate);
        params.append('end_date', endDate);

        const response = await fetch(`${API_BASE_URL}/scheduling/availability/summary?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching availability summary:', error);
        throw error;
    }
};

export const updateInterviewStatus = async (
    interviewId: string,
    status: string,
    notes?: string
): Promise<InterviewSchedule> => {
    try {
        const body: any = { status };
        if (notes) body.notes = notes;

        const response = await fetch(`${API_BASE_URL}/scheduling/interviews/${interviewId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating interview status:', error);
        throw error;
    }
};

export const cancelInterview = async (interviewId: string): Promise<{ message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/scheduling/interviews/${interviewId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error cancelling interview:', error);
        throw error;
    }
};

// Utility functions
export const formatTimeSlot = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const getNextWeekDates = (): string[] => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
};

export const isTimeSlotAvailable = (
    availability: DayAvailability[],
    date: string,
    time: string
): boolean => {
    const dayAvailability = availability.find(day => day.date === date);
    if (!dayAvailability) return false;

    const timeSlot = dayAvailability.slots.find(slot => slot.time === time);
    return timeSlot?.is_available || false;
}; 