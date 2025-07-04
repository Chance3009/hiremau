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

export const fetchCandidates = async (filters?: CandidateFilters): Promise<Candidate[]> => {
    try {
        let url = `${API_BASE_URL}/candidates/`;

        // Add query parameters for filters
        if (filters) {
            const params = new URLSearchParams();
            if (filters.stage) params.append('stage', filters.stage);
            if (filters.status) params.append('status', filters.status);
            if (filters.positionId) params.append('job_id', filters.positionId);
            if (filters.eventId) params.append('event_id', filters.eventId);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.map(transformCandidateData);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
};

// Helper function to transform candidate data
const transformCandidateData = (candidate: any): Candidate => {
    return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        formatted_phone: formatMalaysianPhone(candidate.phone),
        current_position: candidate.current_position,
        years_experience: candidate.years_experience,
        education: candidate.education,
        stage: candidate.stage || 'applied',
        country: candidate.country || 'Malaysia',
        currency: candidate.currency || 'MYR',
        salary_expectations: candidate.salary_expectations,
        formatted_salary: candidate.salary_expectations ? formatMalaysianCurrency(candidate.salary_expectations) : undefined,
        availability: candidate.availability,
        preferred_work_type: candidate.preferred_work_type,
        source: candidate.source || 'direct',
        skills: Array.isArray(candidate.skills) ? candidate.skills : [],
        linkedin_url: candidate.linkedin_url,
        github_url: candidate.github_url,
        resume_files: Array.isArray(candidate.resume_files) ? candidate.resume_files : [],
        evaluation_data: Array.isArray(candidate.evaluation_data) ? candidate.evaluation_data : [],
        ai_analysis: Array.isArray(candidate.ai_analysis) ? candidate.ai_analysis : [],
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        evaluationData: Array.isArray(candidate.evaluation_data) ? candidate.evaluation_data :
            Array.isArray(candidate.ai_analysis) ? candidate.ai_analysis : [],
    };
};

export async function fetchCandidateById(candidateId: string): Promise<Candidate | null> {
    try {
        console.log(`Fetching candidate with ID: ${candidateId}`);

        // Use the simplified API endpoint
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('Candidate not found');
                return null;
            }
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const candidate = await response.json();
        console.log('Raw candidate data from backend:', candidate);

        // Ensure we have basic required fields
        if (!candidate || !candidate.id) {
            console.error('Invalid candidate data received:', candidate);
            throw new Error('Invalid candidate data received from server');
        }

        const transformedCandidate = transformCandidateData(candidate);
        console.log('Transformed candidate data:', transformedCandidate);

        return transformedCandidate;

    } catch (error) {
        console.error('Error fetching candidate:', error);
        throw error;
    }
}

export async function fetchCandidatesByStage(stage: string): Promise<Candidate[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates?stage=${encodeURIComponent(stage)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const candidates = await response.json();
        return candidates.map(transformCandidateData);

    } catch (error) {
        console.error('Error fetching candidates by stage:', error);
        throw error;
    }
}

export const createCandidate = async (formData: FormData): Promise<{ success: boolean; id: string; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
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

export async function updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return true;

    } catch (error) {
        console.error('Error updating candidate:', error);
        throw error;
    }
}

export async function performCandidateAction(candidateId: string, action: string, data?: any): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data || {}),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`Error performing action ${action}:`, error);
        throw error;
    }
}

export async function getCandidateActions(candidateId: string): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/actions`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const actions = await response.json();
        return actions;
    } catch (error) {
        console.error('Error fetching candidate actions:', error);
        return [];
    }
}

// Add new function for fetching evaluation data
export async function getCandidateEvaluation(candidateId: string): Promise<any> {
    try {
        console.log(`Fetching evaluation data for candidate: ${candidateId}`);

        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/evaluation`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Evaluation data received:', result);

        return result;
    } catch (error) {
        console.error('Error fetching candidate evaluation:', error);
        throw error;
    }
}

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

// Legacy Supabase methods for backward compatibility (if needed)
export async function getCandidateDetails(candidateId: string): Promise<Candidate | null> {
    try {
        const { data, error } = await supabase
            .from('candidates')
            .select(`
                *,
                initial_screening_evaluation (
                    id,
                    overall_score,
                    recommendation,
                    resume_summary,
                    experience_relevance,
                    technical_competency_assessment,
                    cultural_fit_indicators,
                    strengths,
                    weaknesses,
                    missing_required_skills,
                    standout_qualities,
                    potential_concerns,
                    recommendation_reasoning,
                    interview_focus_areas,
                    created_at
                )
            `)
            .eq('id', candidateId)
            .single();

        if (error) {
            console.error('Error fetching candidate details:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getCandidateDetails:', error);
        return null;
    }
}

export async function getCandidatesByStageFromSupabase(stage: string): Promise<Candidate[]> {
    try {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('stage', stage)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching candidates by stage:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCandidatesByStageFromSupabase:', error);
        return [];
    }
}

export async function fetchCandidateInterviewData(candidateId: string): Promise<any> {
    try {
        console.log(`Fetching interview data for candidate: ${candidateId}`);
        console.log(`API URL: ${API_BASE_URL}/candidates/${candidateId}/interview-data`);

        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/interview-data`);

        console.log(`Response status: ${response.status}`);
        console.log(`Response ok: ${response.ok}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('Candidate not found');
                return null;
            }
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const interviewData = await response.json();
        console.log('Interview data received:', interviewData);
        console.log('Interview data keys:', Object.keys(interviewData));

        return interviewData;

    } catch (error) {
        console.error('Error fetching candidate interview data:', error);
        console.error('Error details:', error.message);
        throw error;
    }
}

export async function fetchFinalReviewCandidates(): Promise<Candidate[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/final-review`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Transform the candidates data to match the expected format
        const candidates = result.candidates.map((candidate: any) => {
            return {
                ...transformCandidateData(candidate),
                evaluationData: candidate.evaluation_data ? [candidate.evaluation_data] : [] // Wrap in array to match interface
            };
        });

        return candidates;
    } catch (error) {
        console.error('Error fetching final review candidates:', error);
        throw error;
    }
} 