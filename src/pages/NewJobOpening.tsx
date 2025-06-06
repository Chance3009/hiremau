import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobOpeningForm from '@/components/job/JobOpeningForm';

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
        <div className="container mx-auto p-6 max-w-4xl">
            <JobOpeningForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    );
};

export default NewJobOpening;
