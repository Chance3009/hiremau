import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobOpeningForm from '@/components/job/JobOpeningForm';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export const NewJobOpening: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = (data: {
        title: string;
        department: string;
        location: string;
        description: string;
        requirements: string[];
    }) => {
        // TODO: Implement job opening creation
        console.log('Creating job opening:', data);
        navigate('/job-openings');
    };

    const handleCancel = () => {
        navigate('/job-openings');
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Job Opening"
                subtitle="Define a new position and its requirements"
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/jobs')}>
                        Back to Jobs
                    </Button>
                </div>
            </PageHeader>
            <div className="container mx-auto p-6 max-w-4xl">
                <JobOpeningForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        </div>
    );
};

export default NewJobOpening;
