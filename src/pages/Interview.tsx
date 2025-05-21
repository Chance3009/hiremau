
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, MessageSquare, Check } from 'lucide-react';

const Interview = () => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    0: true,
  });
  const [notes, setNotes] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Mock candidates that would come from a backend in a real app
  const candidates = [
    {
      id: '1',
      name: 'Alex Johnson',
      position: 'Frontend Developer',
      status: 'Shortlisted',
      timestamp: '9:30 AM',
    },
    {
      id: '2',
      name: 'Sam Taylor',
      position: 'UX Designer',
      status: 'Shortlisted',
      timestamp: '10:15 AM',
    },
    {
      id: '3',
      name: 'Morgan Smith',
      position: 'Backend Developer',
      status: 'Shortlisted',
      timestamp: '11:00 AM',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Assistant</h1>
        <p className="text-muted-foreground">Conduct structured interviews with AI-suggested questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Shortlisted Candidates</CardTitle>
              <CardDescription>Select a candidate to interview</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {candidates.map((candidate) => (
                  <div 
                    key={candidate.id} 
                    className={`p-4 cursor-pointer hover:bg-muted transition-colors ${candidate.id === '1' ? 'bg-muted' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{candidate.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Alex Johnson</span>
                  {interviewComplete ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" /> Interview Completed
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">In Progress</span>
                  )}
                </CardTitle>
                <CardDescription>Frontend Developer • Shortlisted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
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
                    <span className="font-medium">Fit Score:</span>
                    <span className="text-green-600 font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => handleToggleQuestion(q.id)}
                      >
                        <h3 className="font-medium">{q.question}</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedQuestions[q.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {expandedQuestions[q.id] && (
                        <div className="mt-3 space-y-2 text-sm border-l-2 border-primary/20 pl-3">
                          <div>
                            <span className="font-medium text-xs">Context: </span>
                            <span className="text-muted-foreground">{q.context}</span>
                          </div>
                          <div>
                            <span className="font-medium text-xs">Follow-up: </span>
                            <span className="text-muted-foreground">{q.followUp}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Interview Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="interview-notes">Notes</Label>
                  <Textarea 
                    id="interview-notes" 
                    placeholder="Record your observations, answers to questions, and overall impressions..."
                    className="min-h-[200px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" disabled={interviewComplete}>Save Draft</Button>
                    <Button onClick={handleComplete} disabled={interviewComplete}>
                      <Check className="mr-2 h-4 w-4" />
                      Complete Interview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
