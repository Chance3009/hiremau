
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, MessageSquare, Check, Calendar, Clock, Search } from 'lucide-react';
import CandidateList from '@/components/candidate/CandidateList';
import CandidateCard from '@/components/candidate/CandidateCard';
import { useNavigate } from 'react-router-dom';
import ContextFilter from '@/components/layout/ContextFilter';
import InterviewAssistant from '@/components/interview/InterviewAssistant';

// Mock data for events and positions
const mockEvents = [
  { id: '1', name: 'UPM Career Fair 2025' },
  { id: '2', name: 'Tech Recruit Summit' },
  { id: '3', name: 'Engineering Talent Day' }
];

const mockPositions = [
  { id: '1', name: 'Frontend Developer' },
  { id: '2', name: 'UX Designer' },
  { id: '3', name: 'Backend Developer' },
  { id: '4', name: 'Product Manager' },
];

const Interview = () => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    0: true,
  });
  const [notes, setNotes] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState('1');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock candidates that would come from a backend in a real app
  const candidates = [
    {
      id: '1',
      name: 'Alex Johnson',
      position: 'Frontend Developer',
      status: 'shortlist' as const,
      event: 'UPM Career Fair 2025',
      score: 85,
      timestamp: '2025-05-25 10:30 AM',
    },
    {
      id: '2',
      name: 'Sam Taylor',
      position: 'UX Designer',
      status: 'shortlist' as const,
      event: 'UPM Career Fair 2025',
      score: 82,
      timestamp: '2025-05-25 11:15 AM',
    },
    {
      id: '3',
      name: 'Morgan Smith',
      position: 'Backend Developer',
      status: 'shortlist' as const,
      event: 'Tech Recruit Summit',
      score: 78,
      timestamp: '2025-05-26 09:30 AM',
    },
  ];

  // Mock suggested questions
  const suggestedQuestions = [
    {
      id: '0',
      question: "Can you explain your experience with React and TypeScript?",
      context: "Candidate listed 3 years of React experience but didn't specify TypeScript proficiency level.",
      followUp: "Ask about specific projects where they used TypeScript with React."
    },
    {
      id: '1',
      question: "How do you approach state management in large applications?",
      context: "Position requires experience with complex state management.",
      followUp: "Listen for mentions of Redux, Context API, or other state management libraries."
    },
    {
      id: '2',
      question: "Describe a challenging bug you encountered and how you solved it.",
      context: "Tests problem-solving abilities and technical debugging skills.",
      followUp: "Note their debugging methodology and tools used."
    },
    {
      id: '3',
      question: "How do you stay updated with frontend technologies?",
      context: "The team values continuous learning and technology awareness.",
      followUp: "Look for specific learning resources they mention."
    },
  ];

  const handleToggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleComplete = () => {
    setInterviewComplete(true);
  };
  
  const handleScheduleInterview = () => {
    navigate('/interview/schedule');
  };
  
  const startInterview = (candidateId: string) => {
    setActiveCandidateId(candidateId);
    setActiveTab('conduct');
  };

  const activeCandidate = candidates.find(c => c.id === activeCandidateId);
  
  const handleSuggestionUse = (suggestion: string) => {
    // Add the suggestion to notes
    setNotes(prev => prev ? `${prev}\n\nQ: ${suggestion}` : `Q: ${suggestion}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Assistant</h1>
        <p className="text-muted-foreground">Conduct structured interviews with AI-suggested questions.</p>
      </div>

      <ContextFilter 
        events={mockEvents}
        positions={mockPositions}
        activeEvent={activeEvent}
        setActiveEvent={setActiveEvent}
        activePosition={activePosition}
        setActivePosition={setActivePosition}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={activeTab !== 'conduct'}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="conduct">Conduct Interview</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search interviews..." className="pl-8" />
            </div>
            
            <Button onClick={handleScheduleInterview}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
          
          {viewMode === 'list' ? (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Interviews scheduled for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {candidates.map((candidate) => (
                    <div 
                      key={candidate.id} 
                      className="p-4 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => startInterview(candidate.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-0.5" />
                            <span>{candidate.timestamp}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={(e) => { 
                          e.stopPropagation(); 
                          startInterview(candidate.id);
                        }}>
                          Start Interview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} onClick={() => startInterview(candidate.id)} className="cursor-pointer">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-0.5" />
                            <span>{candidate.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation();
                          startInterview(candidate.id);
                        }}>
                          Start Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="conduct" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Candidate Profile</CardTitle>
                <CardDescription>{activeCandidate?.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col items-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold mb-2">
                      {activeCandidate?.name.charAt(0)}
                    </div>
                    <h2 className="font-semibold text-lg">{activeCandidate?.name}</h2>
                    <p className="text-muted-foreground">{activeCandidate?.position}</p>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex gap-2">
                      <span className="font-medium">Experience:</span>
                      <span>5 years</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Key Skills:</span>
                      <span>React, TypeScript, Node.js, CSS</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Education:</span>
                      <span>B.S. Computer Science, State University</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Event:</span>
                      <span>{activeCandidate?.event}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Fit Score:</span>
                      <span className="text-green-600 font-medium">{activeCandidate?.score}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => window.location.href = `/candidate/${activeCandidateId}`}
                    >
                      View Full Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Suggested Questions
                  </CardTitle>
                  <CardDescription>AI-recommended questions based on candidate resume and job requirements</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {suggestedQuestions.map((q) => (
                      <div key={q.id} className="p-4">
                        <div 
                          className="flex justify-between cursor-pointer"
                          onClick={() => handleToggleQuestion(q.id)}
                        >
                          <div className="font-medium">{q.question}</div>
                          <Button variant="ghost" size="sm" className="p-0 h-5 w-5">
                            {expandedQuestions[q.id] ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        
                        {expandedQuestions[q.id] && (
                          <div className="mt-2 space-y-2">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Context:</span> {q.context}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Follow-up:</span> {q.followUp}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 gap-6">
                <InterviewAssistant 
                  candidateName={activeCandidate?.name || ''}
                  position={activeCandidate?.position || ''}
                  onSuggestionUse={handleSuggestionUse}
                />
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Interview Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      className="min-h-[150px]" 
                      placeholder="Take notes during the interview..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNotes('')}>
                        Clear
                      </Button>
                      <Button onClick={handleComplete} disabled={interviewComplete}>
                        <Check className="mr-2 h-4 w-4" />
                        {interviewComplete ? 'Interview Completed' : 'Complete Interview'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Interviews</CardTitle>
              <CardDescription>View and manage interview results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No completed interviews yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Interview;
