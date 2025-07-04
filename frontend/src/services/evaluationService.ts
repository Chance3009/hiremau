import { API_CONFIG } from '@/config/constants';

const API_BASE_URL = 'http://localhost:8001';

export interface EvaluationData {
    id: string;
    candidate_id: string;
    candidate_name: string;
    position_applied: string;
    evaluation_date: string;
    resume_summary: string;
    years_of_experience: number;
    education_background: string;
    career_progression: string;
    technical_skills: string;
    software_proficiency: string;
    industry_knowledge: string;
    soft_skills_claimed: string;
    certifications: string;
    technical_competency_assessment: string;
    experience_relevance: string;
    communication_assessment: string;
    standout_qualities: string;
    potential_concerns: string;
    strengths: string;
    weaknesses: string;
    red_flags: string;
    growth_potential: string;
    cultural_fit_indicators: string;
    missing_required_skills: string;
    transferable_skills: string;
    learning_curve_assessment: string;
    recommendation: 'Reject' | 'Maybe' | 'Interview' | 'Strong Yes';
    recommendation_reasoning: string;
    interview_focus_areas: string;
    created_at: string;
    updated_at: string;
}

export interface CandidateFile {
    id: string;
    candidate_id: string;
    file_type: string;
    file_url: string;
    extracted_text?: string;
    uploaded_at: string;
    file_name: string;
    file_size: number;
    file_category: string;
}

export interface EvaluationStatus {
    candidate_id: string;
    has_evaluation: boolean;
    evaluation_date?: string;
    recommendation?: string;
    last_updated?: string;
    status?: string;
}

export interface EvaluationResponse {
    success: boolean;
    message: string;
    data?: EvaluationData | null;
}

export const getCandidateEvaluation = async (candidateId: string): Promise<EvaluationData | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/evaluation`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.evaluation) {
            return data.evaluation;
        }

        return null;
    } catch (error) {
        console.error('Error fetching candidate evaluation:', error);
        return null;
    }
};

export const getCandidateFiles = async (candidateId: string): Promise<CandidateFile[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/files`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching candidate files:', error);
        return [];
    }
};

export const triggerCandidateEvaluation = async (candidateId: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/trigger-evaluation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error triggering candidate evaluation:', error);
        throw error;
    }
};

// Mock evaluation data for testing when backend is not available
export const getMockEvaluationData = (candidateId: string, candidateName: string): EvaluationData => {
    return {
        id: `eval-${candidateId}`,
        candidate_id: candidateId,
        candidate_name: candidateName,
        position_applied: "Software Engineer",
        evaluation_date: new Date().toISOString(),
        resume_summary: "Experienced software engineer with 5+ years in full-stack development. Strong background in React, Node.js, and cloud technologies. Demonstrated leadership in previous roles.",
        years_of_experience: 5,
        education_background: "Bachelor's in Computer Science from reputable university",
        career_progression: "Steady progression from junior to senior developer roles",
        technical_skills: "React, Node.js, TypeScript, AWS, Docker, PostgreSQL",
        software_proficiency: "Expert in JavaScript ecosystem, proficient in cloud platforms",
        industry_knowledge: "Strong understanding of modern web development practices",
        soft_skills_claimed: "Leadership, communication, problem-solving, team collaboration",
        certifications: "AWS Certified Developer, React Professional Certificate",
        technical_competency_assessment: "Strong technical foundation with modern technologies",
        experience_relevance: "Highly relevant experience for the target role",
        communication_assessment: "Clear and professional communication style evident in resume",
        standout_qualities: "Leadership experience, open-source contributions, continuous learning",
        potential_concerns: "May be overqualified for some positions",
        strengths: "Technical expertise, leadership experience, proven track record",
        weaknesses: "Limited experience with specific industry domain",
        red_flags: "None identified",
        growth_potential: "High potential for senior technical roles",
        cultural_fit_indicators: "Values align with company culture based on background",
        missing_required_skills: "Minor gaps in specific frameworks that can be quickly learned",
        transferable_skills: "Strong analytical and problem-solving skills",
        learning_curve_assessment: "Fast learner with ability to adapt to new technologies",
        recommendation: "Interview",
        recommendation_reasoning: "Strong technical candidate with relevant experience. Recommend technical interview to assess depth of knowledge and cultural fit.",
        interview_focus_areas: "Technical depth, leadership experience, problem-solving approach, cultural alignment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

export const getEvaluationStatus = async (candidateId: string): Promise<EvaluationStatus> => {
    try {
        const response = await fetch(`${API_BASE_URL}/evaluation/status/${candidateId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching evaluation status:', error);
        throw error;
    }
};

export const triggerEvaluation = async (
    candidateId: string,
    resumeUrl: string,
    candidateName: string,
    positionApplied: string = ''
): Promise<EvaluationResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/evaluation/trigger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                candidate_id: candidateId,
                resume_url: resumeUrl,
                candidate_name: candidateName,
                position_applied: positionApplied,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error triggering evaluation:', error);
        throw error;
    }
};

export const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation?.toLowerCase()) {
        case 'strong yes':
            return 'text-green-600 bg-green-50';
        case 'interview':
            return 'text-blue-600 bg-blue-50';
        case 'maybe':
            return 'text-yellow-600 bg-yellow-50';
        case 'reject':
            return 'text-red-600 bg-red-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

export const getRecommendationIcon = (recommendation: string): string => {
    switch (recommendation?.toLowerCase()) {
        case 'strong yes':
            return '🌟';
        case 'interview':
            return '💼';
        case 'maybe':
            return '🤔';
        case 'reject':
            return '❌';
        default:
            return '⏳';
    }
}; 