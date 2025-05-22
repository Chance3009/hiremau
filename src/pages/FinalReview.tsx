import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Download, Send, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CandidateComparison from '@/components/candidate/CandidateComparison';

const FinalReview = () => {
  const [sendingEmails, setSendingEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Mock candidates data that would come from a backend in a real app
  const candidates = [
    {
      id: '1',
      name: 'Alex Johnson',
      position: 'Frontend Developer',
      status: 'shortlist',
      interviewScore: 87,
      interviewNotes: 'Strong technical skills, excellent cultural fit.',
      fitScore: 85,
      skills: ["React", "TypeScript", "Node.js", "CSS"],
      experience: [
        "Senior Frontend Developer at TechCorp (3 years)",
        "Web Developer at StartupXYZ (2 years)"
      ],
      education: ["B.S. Computer Science, State University (2019)"]
    },
    {
      id: '2',
      name: 'Sam Taylor',
      position: 'UX Designer',
      status: 'shortlist',
      interviewScore: 82,
      interviewNotes: 'Great portfolio, good communication skills.',
      fitScore: 78,
      skills: ["Figma", "UI Design", "User Research", "HTML/CSS"],
      experience: [
        "UX Designer at DesignCo (2 years)",
        "UI Designer at CreativeLabs (1 year)"
      ],
      education: ["B.F.A. Design, Art Institute (2020)"]
    },
    {
      id: '3',
      name: 'Morgan Smith',
      position: 'Backend Developer',
      status: 'kiv',
      interviewScore: 73,
      interviewNotes: 'Good technical knowledge but limited experience.',
      fitScore: 68,
      skills: ["Node.js", "Express", "MongoDB", "AWS"],
      experience: [
        "Junior Backend Developer at TechStart (1 year)"
      ],
      education: ["B.S. Computer Engineering, Tech University (2022)"]
    },
    {
      id: '4',
      name: 'Jordan Lee',
      position: 'Product Manager',
      status: 'reject',
      interviewScore: 62,
      interviewNotes: 'Not enough relevant experience.',
      fitScore: 55,
      skills: ["Product Strategy", "Agile", "User Stories", "Market Research"],
      experience: [
        "Assistant Product Manager at ProductCo (1 year)",
        "Business Analyst at CorpTech (1 year)"
      ],
      education: ["MBA, Business School (2021)"]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlist':
        return 'bg-recruit-shortlist text-recruit-shortlistText';
      case 'kiv':
        return 'bg-recruit-kiv text-recruit-kivText';
      case 'reject':
        return 'bg-recruit-reject text-recruit-rejectText';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlist':
        return <Check className="h-4 w-4" />;
      case 'kiv':
        return <Clock className="h-4 w-4" />;
      case 'reject':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleSendEmails = () => {
    setSendingEmails(true);
    
    // Simulate API call
    setTimeout(() => {
      setSendingEmails(false);
      toast({
        title: "Status Emails Sent",
        description: "All candidates have been notified of their status.",
      });
    }, 2000);
  };

  const handleExport = () => {
    toast({
      title: "Data Exported",
      description: "Candidate data has been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Final Review</h1>
        <p className="text-muted-foreground">Review candidate statuses and take final actions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Candidate List</TabsTrigger>
          <TabsTrigger value="compare">Compare Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Event Summary</CardTitle>
                  <CardDescription>Tech Career Fair 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">CANDIDATE BREAKDOWN</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total Candidates</span>
                          <span className="font-medium">74</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shortlisted</span>
                          <span className="font-medium text-green-600">28 (38%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Keep in View</span>
                          <span className="font-medium text-amber-600">31 (42%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejected</span>
                          <span className="font-medium text-red-600">15 (20%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">POSITION BREAKDOWN</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Frontend Developer</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backend Developer</span>
                          <span className="font-medium">18</span>
                        </div>
                        <div className="flex justify-between">
                          <span>UX Designer</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Product Manager</span>
                          <span className="font-medium">11</span>
                        </div>
                        <div className="flex justify-between">
                          <span>QA Engineer</span>
                          <span className="font-medium">9</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <Button className="w-full" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All Data (CSV)
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled={sendingEmails}
                        onClick={handleSendEmails}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sendingEmails ? 'Sending...' : 'Send Status Emails'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Review</CardTitle>
                  <CardDescription>Review and finalize candidate statuses</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{candidate.name}</h3>
                              <span 
                                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(candidate.status)}`}
                              >
                                {getStatusIcon(candidate.status)}
                                {candidate.status === 'shortlist' 
                                  ? 'Shortlisted' 
                                  : candidate.status === 'kiv' 
                                    ? 'Keep in View' 
                                    : 'Rejected'
                                }
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">Interview Score</div>
                            <div className="text-lg font-bold">{candidate.interviewScore}%</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Interview Notes: </span>
                            <span className="text-muted-foreground">{candidate.interviewNotes}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-sm font-medium">Fit Score:</span>
                            <span className="text-sm">{candidate.fitScore}%</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => window.location.href = `/candidate/${candidate.id}`}>View Details</Button>
                            <Button size="sm">
                              Change Status
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="compare">
          <CandidateComparison candidates={candidates} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinalReview;
