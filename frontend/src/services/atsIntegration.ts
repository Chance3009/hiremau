import { CandidateProfile } from '@/types/candidate';
import { JobPosting } from '@/types/job';

export interface ATSConfig {
    provider: 'workday' | 'greenhouse' | 'lever' | 'smartrecruiters';
    apiKey: string;
    apiEndpoint: string;
    organizationId: string;
}

export interface ATSCandidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    source: string;
    appliedDate: string;
    status: string;
    tags: string[];
}

export interface ATSJobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
    status: 'open' | 'closed' | 'draft';
    createdAt: string;
    updatedAt: string;
}

class ATSIntegrationService {
    private config: ATSConfig;

    constructor(config: ATSConfig) {
        this.config = config;
    }

    // Sync candidates between systems
    async syncCandidates(): Promise<{
        imported: number;
        exported: number;
        errors: string[];
    }> {
        try {
            // Implementation will vary based on ATS provider
            const response = await fetch(`${this.config.apiEndpoint}/candidates/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationId: this.config.organizationId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to sync candidates');
            }

            return await response.json();
        } catch (error) {
            console.error('Error syncing candidates:', error);
            throw error;
        }
    }

    // Import candidates from ATS
    async importCandidates(): Promise<ATSCandidate[]> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/candidates`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to import candidates');
            }

            return await response.json();
        } catch (error) {
            console.error('Error importing candidates:', error);
            throw error;
        }
    }

    // Export candidates to ATS
    async exportCandidate(candidate: CandidateProfile): Promise<ATSCandidate> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/candidates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(candidate),
            });

            if (!response.ok) {
                throw new Error('Failed to export candidate');
            }

            return await response.json();
        } catch (error) {
            console.error('Error exporting candidate:', error);
            throw error;
        }
    }

    // Sync job postings between systems
    async syncJobPostings(): Promise<{
        imported: number;
        exported: number;
        errors: string[];
    }> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/jobs/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationId: this.config.organizationId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to sync job postings');
            }

            return await response.json();
        } catch (error) {
            console.error('Error syncing job postings:', error);
            throw error;
        }
    }

    // Import job postings from ATS
    async importJobPostings(): Promise<ATSJobPosting[]> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/jobs`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to import job postings');
            }

            return await response.json();
        } catch (error) {
            console.error('Error importing job postings:', error);
            throw error;
        }
    }

    // Export job posting to ATS
    async exportJobPosting(jobPosting: JobPosting): Promise<ATSJobPosting> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/jobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobPosting),
            });

            if (!response.ok) {
                throw new Error('Failed to export job posting');
            }

            return await response.json();
        } catch (error) {
            console.error('Error exporting job posting:', error);
            throw error;
        }
    }

    // Update candidate status in ATS
    async updateCandidateStatus(
        candidateId: string,
        status: string,
        notes?: string
    ): Promise<ATSCandidate> {
        try {
            const response = await fetch(
                `${this.config.apiEndpoint}/candidates/${candidateId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status, notes }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update candidate status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating candidate status:', error);
            throw error;
        }
    }

    // Schedule interview in ATS
    async scheduleInterview(
        candidateId: string,
        interviewDetails: {
            date: string;
            time: string;
            interviewerId: string;
            type: string;
        }
    ): Promise<any> {
        try {
            const response = await fetch(
                `${this.config.apiEndpoint}/candidates/${candidateId}/interviews`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(interviewDetails),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to schedule interview');
            }

            return await response.json();
        } catch (error) {
            console.error('Error scheduling interview:', error);
            throw error;
        }
    }
}

export default ATSIntegrationService; 