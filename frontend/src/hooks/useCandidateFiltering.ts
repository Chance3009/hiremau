import { useEffect, useState, useCallback } from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { fetchCandidates, fetchCandidatesWithEvaluation } from '@/services/candidateService';

interface Candidate {
    id: string;
    name: string;
    email: string;
    position: string;
    stage: string;
    status: string;
    jobId?: string;
    eventId?: string;
}

interface UseCandidateFilteringOptions {
    additionalFilters?: {
        stage?: string;
        status?: string;
    };
    autoRefresh?: boolean;
}

export const useCandidateFiltering = (options: UseCandidateFilteringOptions = {}) => {
    const { activePositionId, activeEventId } = useRecruitment();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCandidates = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Only apply filters when they are actually selected (not empty)
            const filters: any = {};

            // Only add position filter if a specific position is selected
            if (activePositionId && activePositionId.trim() !== '') {
                filters.positionId = activePositionId;
            }

            // Only add event filter if a specific event is selected
            if (activeEventId && activeEventId.trim() !== '') {
                filters.eventId = activeEventId;
            }

            // Always apply additional filters (like stage)
            if (options.additionalFilters) {
                Object.assign(filters, options.additionalFilters);
            }

            console.log('Loading candidates with filters:', filters);

            // Use the evaluation-enabled fetch function for applied and final_review candidates
            const shouldFetchEvaluations = options.additionalFilters?.stage === 'applied' ||
                options.additionalFilters?.stage === 'final_review';

            let data;
            if (shouldFetchEvaluations) {
                // For applied and final_review candidates, fetch with evaluation data
                data = await fetchCandidatesWithEvaluation(filters.stage);
                // Apply other filters manually since the backend function only handles stage
                if (filters.positionId || filters.eventId) {
                    data = data.filter(candidate => {
                        if (filters.positionId && candidate.job_id !== filters.positionId) return false;
                        if (filters.eventId && candidate.event_id !== filters.eventId) return false;
                        return true;
                    });
                }
            } else {
                data = await fetchCandidates(filters);
            }

            setCandidates(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load candidates');
            console.error('Error loading candidates:', err);
        } finally {
            setLoading(false);
        }
    }, [activePositionId, activeEventId, JSON.stringify(options.additionalFilters)]);

    // Load candidates when filters change
    useEffect(() => {
        loadCandidates();
    }, [loadCandidates]);

    return {
        candidates,
        loading,
        error,
        refresh: loadCandidates,
        activeFilters: {
            positionId: activePositionId && activePositionId.trim() !== '' ? activePositionId : null,
            eventId: activeEventId && activeEventId.trim() !== '' ? activeEventId : null,
            ...options.additionalFilters
        }
    };
}; 