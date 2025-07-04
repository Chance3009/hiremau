import React, { useState } from 'react';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';
import ResumeSummary from '@/components/candidate/ResumeSummary';
import CandidateCard from '@/components/candidate/CandidateCard';
import CandidateList from '@/components/candidate/CandidateList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { createCandidate } from '@/services/candidateService';

interface CreatedCandidate {
  id: string;
  success: boolean;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
  stage?: string;
  status?: string;
}

const CandidateIntake = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedCandidate, setLastCreatedCandidate] = useState<CreatedCandidate | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleFormSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form submitted:', formData);

      // Log FormData entries for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Create candidate with file uploads
      const candidate = await createCandidate(formData);
      setLastCreatedCandidate(candidate);

      // Get candidate name from form data
      const candidateData = JSON.parse(formData.get('candidate_data') as string);

      toast({
        title: "Success",
        description: `Candidate ${candidateData.name} registered successfully`,
      });

      // Show the summary
      setShowSummary(true);

    } catch (error) {
      console.error('Error submitting candidate:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register candidate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: 'shortlist' | 'kiv' | 'reject') => {
    // This will be implemented later when we handle workflow transitions
    const messages = {
      shortlist: "Candidate has been shortlisted for interview",
      kiv: "Candidate has been marked for further review",
      reject: "Candidate has been rejected"
    };

    toast({
      title: `Status Updated: ${status.toUpperCase()}`,
      description: messages[status],
    });

    setShowSummary(false);
    setLastCreatedCandidate(null);
  };

  const handleNotesChange = (notes: string) => {
    // This will be implemented later when we handle candidate updates
    console.log('Notes updated:', notes);
  };

  const handleNewRegistration = () => {
    setShowSummary(false);
    setLastCreatedCandidate(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Registration"
        subtitle="Register new candidates for the recruitment process"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/recruitment-pipeline')}>
            Back to Pipeline
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">Register Candidate</TabsTrigger>
          <TabsTrigger value="all">All Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <CandidateIntakeForm
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            <div>
              {showSummary && lastCreatedCandidate ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Registration Successful!</CardTitle>
                    <CardDescription>
                      Candidate has been registered and is now in the "Applied" stage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Candidate Details:</h3>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {lastCreatedCandidate.name}</p>
                        <p><strong>Email:</strong> {lastCreatedCandidate.email}</p>
                        <p><strong>Phone:</strong> {lastCreatedCandidate.phone}</p>
                        <p><strong>Stage:</strong> <span className="capitalize">{lastCreatedCandidate.stage}</span></p>
                        <p><strong>Status:</strong> <span className="capitalize">{lastCreatedCandidate.status}</span></p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <h4 className="font-medium">Next Steps:</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange('shortlist')}
                        >
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange('kiv')}
                        >
                          Keep in View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange('reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleNewRegistration}
                      >
                        Register Another Candidate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center border rounded-lg border-dashed p-12 text-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Ready to Register</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill in the candidate information to register them for the recruitment process.
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

          <CandidateList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateIntake;
