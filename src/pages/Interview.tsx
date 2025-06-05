import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Bot, MessageSquare, Star, ThumbsUp, Clock, User } from 'lucide-react';
import InterviewAssistant from '@/components/interview/InterviewAssistant';
import { useRecruitment } from '@/contexts/RecruitmentContext';

// Mock data
const mockCandidate = {
  id: '1',
  name: 'John Doe',
  position: 'Frontend Developer',
  event: 'UPM Career Fair 2025',
  status: 'In Interview',
  rating: 4.5,
  notes: 'Strong technical background, good communication skills.',
  resume: '/path/to/resume.pdf',
  photo: '/path/to/photo.jpg',
  experience: '5 years of frontend development experience with React and TypeScript',
  education: 'B.S. Computer Science, University of Michigan',
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
  aiSummary: {
    strengths: [
      'Strong technical background in React',
      'Proven experience with TypeScript',
      'Good problem-solving skills'
    ],
    considerations: [
      'Limited backend experience',
      'No experience with our specific tech stack'
    ],
    fitAnalysis: 'Strong potential fit for the frontend role with room to grow into full-stack development.'
  }
};

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [isRecording, setIsRecording] = useState(false);

  // Mock transcript messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'question' as const,
      content: 'Can you explain your experience with React and TypeScript?',
      timestamp: '10:30 AM',
      comment: 'Good technical depth'
    },
    {
      id: '2',
      type: 'answer' as const,
      content: 'I have 3 years of experience with React, primarily working on large-scale applications. I\'ve been using TypeScript for the past 2 years and have implemented several complex features using both technologies. For example, in my current role, I built a real-time dashboard that processes and visualizes data from multiple sources.',
      timestamp: '10:31 AM',
      rating: 4,
      comment: 'Shows practical experience'
    },
    {
      id: '3',
      type: 'question' as const,
      content: 'How do you handle state management in your React applications?',
      timestamp: '10:32 AM'
    },
    {
      id: '4',
      type: 'answer' as const,
      content: 'I prefer using a combination of React\'s built-in hooks (useState, useContext) for local state and more specialized solutions like Redux or Zustand for global state. The choice depends on the application\'s needs. For smaller apps, Context API is often sufficient.',
      timestamp: '10:33 AM',
      rating: 5,
      comment: 'Excellent understanding of state management concepts'
    }
  ]);

  // Mock suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Can you describe a challenging project you worked on?',
    'How do you approach testing in your applications?',
    'What\'s your experience with responsive design?',
    'How do you handle performance optimization?',
    'Tell me about a time you had to debug a complex issue.'
  ]);

  const [isRefreshingQuestions, setIsRefreshingQuestions] = useState(false);

  const refreshSuggestedQuestions = () => {
    setIsRefreshingQuestions(true);
    // Simulate API call
    setTimeout(() => {
      setSuggestedQuestions([
        'What\'s your approach to code reviews?',
        'How do you handle technical debt?',
        'Can you explain your experience with CI/CD?',
        'How do you stay updated with new technologies?',
        'Tell me about a time you had to lead a technical decision.'
      ]);
      setIsRefreshingQuestions(false);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{mockCandidate.name}</h1>
            <p className="text-sm text-muted-foreground">{mockCandidate.position}</p>
          </div>
          <Badge>{mockCandidate.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/interview/1/evaluation')}>
            Skip Interview
          </Button>
          <Button onClick={() => navigate('/interview/1/evaluation')}>
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Panel - Candidate Info & Quick Assistant */}
        <div className="col-span-3 space-y-4">
          {/* Candidate Profile Card */}
          <Card>
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="font-normal">
                  {mockCandidate.event}
                </Badge>
              </div>
              <div>
                <CardTitle>{mockCandidate.name}</CardTitle>
                <CardDescription>{mockCandidate.position}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Experience</h4>
                <p className="text-sm text-muted-foreground">{mockCandidate.experience}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Education</h4>
                <p className="text-sm text-muted-foreground">{mockCandidate.education}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {mockCandidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-green-600">Strengths</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      {mockCandidate.aiSummary.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Considerations</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      {mockCandidate.aiSummary.considerations.map((consideration, index) => (
                        <li key={index}>{consideration}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Assistant */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Quick Assistant
              </CardTitle>
              <CardDescription>Ask for help during the interview</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Ask Assistant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Interview Transcript */}
        <div className="col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Interview Transcript
                </CardTitle>
                <CardDescription>Real-time conversation with AI analysis</CardDescription>
              </div>
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col gap-2 ${message.type === 'question' ? '' : 'pl-8'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp}
                            </span>
                            {message.type === 'answer' && message.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{message.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                      {message.comment && (
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
                          <p className="text-xs text-muted-foreground">{message.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {isRecording && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Recording...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Suggested Questions */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Suggested Questions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isRefreshingQuestions}
                  onClick={refreshSuggestedQuestions}
                >
                  Refresh
                </Button>
              </div>
              <CardDescription>AI-powered question suggestions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-4">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 whitespace-normal text-left"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Interview;
