
import React, { useState } from 'react';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';
import ResumeSummary from '@/components/candidate/ResumeSummary';
import CandidateCard from '@/components/candidate/CandidateCard';
import CandidateList from '@/components/candidate/CandidateList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

const CandidateIntake = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const location = useLocation();
  
  // Mock candidates list
  const candidates = [
    {
      id: '1',
      name: 'Alex Johnson',
      position: 'Frontend Developer',
      status: 'shortlist' as const,
      event: 'UPM Career Fair 2025',
      score: 85,
      date: '2025-05-20'
    },
    {
      id: '2',
      name: 'Sam Taylor',
      position: 'UX Designer',
      status: 'shortlist' as const,
      event: 'UPM Career Fair 2025',
      score: 82,
      date: '2025-05-20'
    },
    {
      id: '3',
      name: 'Morgan Smith',
      position: 'Backend Developer',
      status: 'kiv' as const,
      event: 'Tech Recruit Summit',
      score: 73,
      date: '2025-05-19'
    },
    {
      id: '4',
      name: 'Jordan Lee',
      position: 'Product Manager',
      status: 'reject' as const,
      event: 'Tech Recruit Summit',
      score: 62,
      date: '2025-05-18'
    },
    {
      id: '5',
      name: 'Taylor Wilson',
      position: 'Frontend Developer',
      status: 'new' as const,
      event: 'Engineering Talent Day',
      date: '2025-05-22'
    }
  ];
  
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
        <p className="text-muted-foreground">Register new candidates and analyze their resumes</p>
      </div>
      
      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">Register Candidate</TabsTrigger>
          <TabsTrigger value="all">All Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register" className="pt-4">
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
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          <div className="flex justify-end mb-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'card')} className="w-auto">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="card">Card View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {viewMode === 'list' ? (
            <CandidateList candidates={candidates} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} variant="full" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateIntake;
