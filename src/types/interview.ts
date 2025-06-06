export interface InterviewData {
    candidateId: string;
    candidateName: string;
    position: string;
    interviewDate: string;
    interviewer: string;
    technicalAssessment: {
        responses: Array<{
            question: string;
            answer: string;
            score?: number;
            notes?: string;
        }>;
        codeExamples?: Array<{
            task: string;
            solution: string;
            evaluation: {
                correctness: number;
                efficiency: number;
                style: number;
                notes: string;
            };
        }>;
    };
    behavioralAssessment: Array<{
        question: string;
        response: string;
        evaluation: {
            clarity: number;
            relevance: number;
            depth: number;
            notes: string;
        };
    }>;
    communicationSkills: {
        verbalClarity: number;
        listeningSkills: number;
        nonVerbalCues: number;
        technicalCommunication: number;
        notes: string;
    };
    culturalFitIndicators: Array<{
        aspect: string;
        observation: string;
        alignment: number;
        notes: string;
    }>;
    overallNotes: string;
    redFlags?: string[];
    highlights?: string[];
}

export interface InterviewQuestion {
    id: string;
    category: 'technical' | 'behavioral' | 'cultural';
    question: string;
    expectedPoints?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    timeAllocation?: number; // in minutes
}

export interface InterviewEvaluation {
    candidateId: string;
    interviewId: string;
    evaluatorId: string;
    technicalScore: number;
    communicationScore: number;
    culturalFitScore: number;
    overallRecommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
    notes: string;
    strengths: string[];
    areasForImprovement: string[];
    timestamp: string;
} 