import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import JobOpeningForm from './JobOpeningForm';

interface JobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        department: string;
        location: string;
        description: string;
        requirements: string[];
        salary: {
            min: string;
            max: string;
            currency: string;
            period: string;
        };
        employmentType: string;
        experienceLevel: string;
        benefits: string[];
    }) => void;
    initialData?: any;
    mode?: 'create' | 'edit';
}

const JobModal: React.FC<JobModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode = 'create'
}) => {
    const handleSubmit = (data: any) => {
        onSubmit(data);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create Job Opening' : 'Edit Job Opening'}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <JobOpeningForm
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        initialData={initialData}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JobModal; 