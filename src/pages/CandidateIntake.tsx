
import React, { useState } from 'react';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';
import ResumeSummary from '@/components/candidate/ResumeSummary';
import { toast } from '@/hooks/use-toast';

const CandidateIntake = () => {
  const [showSummary, setShowSummary] = useState(false);
  
  const handleFormSubmit = (data: any) => {
    console.log('Candidate data submitted:', data);
    // In a real app, this would process the resume, send to API, etc.
    setShowSummary(true);
    toast({
      title: "Resume Processed",
      description: "Candidate information has been analyzed.",
    });
  };
  
  const handleStatusChange = (status: 'shortlist' | 'kiv' | 'reject') => {
    const messages = {
      shortlist: "Candidate has been shortlisted for interview",
      kiv: "Candidate has been marked for further review",
      reject: "Candidate has been rejected"
    };
    
    toast({
      title: `Status Updated: ${status.toUpperCase()}`,
      description: messages[status],
    });
    
    // Reset the form after a decision is made
    setShowSummary(false);
  };
  
  const handleNotesChange = (notes: string) => {
    // This would update the candidate record in a real app
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Intake</h1>
        <p className="text-muted-foreground">Register new candidates and analyze their resumes.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CandidateIntakeForm onSubmit={handleFormSubmit} />
        </div>
        
        <div>
          {showSummary ? (
            <ResumeSummary 
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg border-dashed p-12 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No Resume Processed</h3>
                <p className="text-sm text-muted-foreground">
                  Submit candidate information to see the resume analysis and AI evaluation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateIntake;
