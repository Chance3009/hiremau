import { supabase } from '@/lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Candidate } from '@/types';
import { API_CONFIG } from '@/config/constants';

const API_BASE_URL = 'http://localhost:8001';

interface CandidateFilters {
    positionId?: string;
    eventId?: string;
    stage?: string;
    status?: string;
}

// Malaysian formatting utilities
export const formatMalaysianPhone = (phone: string): string => {
    if (!phone) return '';

    // Remove any existing formatting
    const cleaned = phone.replace(/\D/g, '');

    // Handle Malaysian numbers
    if (cleaned.startsWith('60')) {
        // International format: +60 12-345 6789
        const withoutCountry = cleaned.substring(2);
        if (withoutCountry.length >= 9) {
            return `+60 ${withoutCountry.substring(0, 2)}-${withoutCountry.substring(2, 5)} ${withoutCountry.substring(5)}`;
        }
    } else if (cleaned.startsWith('0')) {
        // Local format: 012-345 6789
        if (cleaned.length >= 10) {
            return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
        }
    }

    return phone; // Return original if no pattern matches
};

export const formatMalaysianCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const fetchCandidates = async (): Promise<Candidate[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
};

export const fetchCandidateById = async (candidateId: string): Promise<Candidate> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidate:', error);
        throw error;
    }
};

export const fetchCandidatesByStage = async (stage: string): Promise<Candidate[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/?stage=${stage}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidates by stage:', error);
        throw error;
    }
};

export const createCandidate = async (formData: FormData): Promise<{ success: boolean; id: string; message: string }> => {
    try {
        // Log the form data for debugging
        console.log('Form data entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await fetch(`${API_BASE_URL}/candidates/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Success response:', result);
        return {
            success: true,
            id: result.id,
            message: 'Candidate created successfully'
        };
    } catch (error) {
        console.error('Error creating candidate:', error);
        throw error;
    }
};

export const updateCandidate = async (candidateId: string, candidateData: Partial<Candidate>): Promise<Candidate> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidateData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating candidate:', error);
        throw error;
    }
};

export const performCandidateAction = async (
    candidateId: string,
    action: string,
    performedBy: string = 'user',
    notes: string = ''
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                performed_by: performedBy,
                notes: notes
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error performing candidate action:', error);
        throw error;
    }
};

export const getCandidateActions = async (candidateId: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidate actions:', error);
        return [];
    }
};

export const getStagesSummary = async (): Promise<{ success: boolean; stage_counts: Record<string, number>; total_active: number }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/stages/summary`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stages summary:', error);
        throw error;
    }
};

export const getCandidatesByStageEnhanced = async (stage: string): Promise<Candidate[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/stage/${stage}/enhanced`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching enhanced candidates by stage:', error);
        throw error;
    }
};

export interface CandidateFormData {
    name: string;
    email: string;
    phone: string;
    event_id?: string;
    job_id?: string;
    resumeFile?: File;
    stage?: string;
    status?: string;
    source?: string;
    country?: string;
    currency?: string;
    timezone?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
    overallMatch?: number;
    score?: number;
    aiSummary?: Record<string, unknown>;
    notes?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    resume_files?: Record<string, unknown>[];
}

export const getCandidatesByStage = async (stage: string): Promise<Candidate[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/?stage=${stage}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidates by stage:', error);
        throw error;
    }
};

export const deleteCandidate = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete candidate');

    } catch (error) {
        console.error('Error deleting candidate:', error);
        throw error instanceof Error ? error : new Error('Failed to delete candidate');
    }
};

// Get events for dropdown - use backend API
export const getEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/active/list`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch events');
    }
};

// Get jobs for dropdown - use backend API
export const getJobs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/active/list`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        return response.json();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch jobs');
    }
};

export async function getCandidatesAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
}

export async function getWorkflowSummary() {
    const response = await fetch(`${API_BASE_URL}/candidates/workflow/summary`);
    if (!response.ok) throw new Error('Failed to fetch workflow summary');
    return response.json();
}

export const fetchCandidatesWithEvaluation = async (stage?: string): Promise<Candidate[]> => {
    try {
        let url = `${API_BASE_URL}/candidates/`;
        if (stage) {
            url += `?stage=${stage}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const candidates = await response.json();

        // Fetch evaluation data for each candidate
        const candidatesWithEvaluation = await Promise.all(
            candidates.map(async (candidate: Candidate) => {
                try {
                    // Try to get evaluation data
                    const evaluationResponse = await fetch(`${API_BASE_URL}/candidates/${candidate.id}/evaluation`);
                    let evaluationData = null;

                    if (evaluationResponse.ok) {
                        const evalResult = await evaluationResponse.json();
                        if (evalResult.success && evalResult.evaluation) {
                            evaluationData = evalResult.evaluation;
                        }
                    }

                    // Get candidate files
                    const filesResponse = await fetch(`${API_BASE_URL}/candidates/${candidate.id}/files`);
                    let files = [];

                    if (filesResponse.ok) {
                        files = await filesResponse.json();
                    }

                    return {
                        ...candidate,
                        evaluationData,
                        files
                    };
                } catch (error) {
                    console.error(`Error fetching evaluation for candidate ${candidate.id}:`, error);
                    return {
                        ...candidate,
                        evaluationData: null,
                        files: []
                    };
                }
            })
        );

        return candidatesWithEvaluation;
    } catch (error) {
        console.error('Error fetching candidates with evaluation:', error);
        throw error;
    }
}; 