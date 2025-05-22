
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, User, MessageSquare, Calendar, ChevronLeft } from 'lucide-react';
import ResumeSummary from '@/components/candidate/ResumeSummary';

const CandidateView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  
  // Mock candidate data - in a real app, this would come from an API call
  const candidate = {
    id: candidateId || '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    status: 'shortlist',
    event: 'UPM Career Fair 2025',
    score: 85,
    skills: ["React", "TypeScript", "CSS", "Node.js", "Git"],
    experience: [
      "Senior Frontend Developer at TechCorp (3 years)",
      "Web Developer at StartupXYZ (2 years)"
    ],
    education: ["B.S. Computer Science, State University (2019)"],
    isAIGenerated: true,
  };
  
  const handleStatusChange = (status: 'shortlist' | 'kiv' | 'reject') => {
    // In a real app, this would update the candidate's status via an API call
    console.log(`Changing status to ${status} for candidate ${candidateId}`);
  };
  
  const handleNotesChange = (notes: string) => {
    console.log(`Updating notes for candidate ${candidateId}:`, notes);
  };
  
  const handleScheduleInterview = () => {
    navigate(`/interview/schedule/${candidateId}`);
  };
  
  const handleStartInterview = () => {
    navigate('/interview', { state: { candidateId, startInterview: true } });
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
        <span className="text-muted-foreground">{candidate.position}</span>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">
            <User className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="resume">
            <FileText className="h-4 w-4 mr-2" />
            Full Resume
          </TabsTrigger>
          <TabsTrigger value="interviews">
            <MessageSquare className="h-4 w-4 mr-2" />
            Interviews
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="pt-4">
          <ResumeSummary 
            candidate={{
              name: candidate.name,
              position: candidate.position,
              skills: candidate.skills,
              experience: candidate.experience,
              education: candidate.education,
              fitScore: candidate.score,
              isAIGenerated: candidate.isAIGenerated,
            }}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
          />
        </TabsContent>
        
        <TabsContent value="resume" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Original Resume</CardTitle>
              <CardDescription>View the candidate's full resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-6 min-h-[600px] bg-white">
                {/* In a real app, this would be a PDF viewer or formatted resume */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                    <p className="text-muted-foreground">Frontend Developer</p>
                    <p className="text-sm">contact@example.com | (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <div className="space-y-3 mt-2">
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Senior Frontend Developer, TechCorp</span>
                          <span className="text-sm">2022 - Present</span>
                        </div>
                        <p className="text-sm mt-1">Led the development of responsive web applications using React and TypeScript. Implemented state management with Redux and optimized performance.</p>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Web Developer, StartupXYZ</span>
                          <span className="text-sm">2020 - 2022</span>
                        </div>
                        <p className="text-sm mt-1">Developed and maintained client websites. Collaborated with designers to implement UI/UX improvements.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Education</h3>
                    <div className="mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">B.S. Computer Science, State University</span>
                        <span className="text-sm">Graduated 2019</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.skills.map((skill, i) => (
                        <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>View past interviews and schedule new ones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Upcoming Interviews</h3>
                <div className="text-muted-foreground text-sm mb-4">No upcoming interviews scheduled</div>
                <Button onClick={handleScheduleInterview}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button className="ml-2" onClick={handleStartInterview}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Interview Now
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Past Interviews</h3>
                <div className="text-muted-foreground text-sm">No past interviews found</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateView;
