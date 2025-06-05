import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  Calendar,
  Clock,
  Search,
  Bot,
  Building2,
  Users,
  Briefcase,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CandidateList from '@/components/candidate/CandidateList';
import CandidateCard from '@/components/candidate/CandidateCard';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ContextFilter from '@/components/layout/ContextFilter';
import InterviewAssistant from '@/components/interview/InterviewAssistant';
import InterviewTranscript from '@/components/interview/InterviewTranscript';
import InterviewChatbot from '@/components/interview/InterviewChatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
  const { candidateId } = useParams();
  const location = useLocation();
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    0: true,
  });
  const [notes, setNotes] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(candidateId || '1');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [activeTab, setActiveTab] = useState(candidateId ? 'conduct' : 'upcoming');
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('recruitment');

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
      content: 'I have 3 years of experience with React, primarily working on large-scale applications. I\'ve been using TypeScript for the past 2 years and have implemented several complex type systems.',
      timestamp: '10:31 AM',
      aiAnalysis: {
        authenticity: 95,
        contradictions: [],
        keyInsights: [
          'Demonstrated experience with React',
          'TypeScript proficiency',
          'Focus on large-scale applications'
        ]
      }
    }
  ]);

  // Mock suggested questions
  const suggestedQuestions = [
    {
      id: '1',
      question: "How do you approach state management in large applications?",
      context: "Position requires experience with complex state management",
      relevance: 95
    },
    {
      id: '2',
      question: "Can you describe a challenging technical problem you solved?",
      context: "Testing problem-solving abilities",
      relevance: 90
    },
    {
      id: '3',
      question: "How do you handle API error states in React applications?",
      context: "Frontend error handling experience required",
      relevance: 85
    }
  ];

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

  // Effect to handle route changes
  useEffect(() => {
    if (candidateId) {
      setActiveCandidateId(candidateId);
      setActiveTab('conduct');
    }
  }, [candidateId]);

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

  const handleAddComment = (messageId: string, comment: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, comment } : msg
    ));
  };

  const handleRequestAiAnalysis = async (messageId: string) => {
    // In a real implementation, this would call your backend API
    console.log('Requesting AI analysis for message:', messageId);
  };

  const handleAskAssistant = async (message: string) => {
    // In a real implementation, this would call your RAG-based backend
    console.log('Asking assistant:', message);
  };

  const handleAddQuestion = (question: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'question' as const,
      content: question,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="section-spacing">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {candidateId ? 'Interview Schedule' : 'Interview Assistant'}
          </h1>
          <p className="page-subtitle">
            {candidateId
              ? 'Schedule an interview with the candidate'
              : 'Conduct structured interviews with AI assistance'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="shrink-0">
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="conduct">Conduct Interview</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="flex-1 pt-4 min-h-0">
          <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center shrink-0">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search interviews..." className="pl-8" />
              </div>
            </div>

            {viewMode === 'list' ? (
              <Card className="flex-1 min-h-0">
                <CardHeader className="shrink-0">
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Interviews scheduled for the next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
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
          </div>
        </TabsContent>

        <TabsContent value="conduct" className="flex-1 pt-4 min-h-0">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-14rem)]">
            {/* Left Panel - Candidate Info & Assistant */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* Candidate Quick Profile */}
              <Card className="flex-[0_0_auto]">
                <CardHeader className="card-padding pb-2">
                  <CardTitle className="card-header-md">Candidate</CardTitle>
                </CardHeader>
                <CardContent className="card-padding pt-0">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold mb-2">
                      {activeCandidate?.name.charAt(0)}
                    </div>
                    <h2 className="font-semibold">{activeCandidate?.name}</h2>
                    <p className="text-sm text-muted-foreground">{activeCandidate?.position}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600 font-medium">{activeCandidate?.score}% </span>
                      <span className="text-muted-foreground">match</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.href = `/candidate/${activeCandidateId}`}
                    >
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Assistant */}
              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="card-padding pb-2 flex-[0_0_auto]">
                  <CardTitle className="card-header-md flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0">
                  <InterviewChatbot onSendMessage={handleAskAssistant} />
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - Interview Transcript */}
            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full flex flex-col">
                <CardHeader className="card-padding pb-2 border-b flex-[0_0_auto]">
                  <CardTitle className="card-header-md">Interview Transcript</CardTitle>
                  <CardDescription>Real-time conversation with AI analysis</CardDescription>
                </CardHeader>
                <CardContent className="card-padding pt-4 flex-1 overflow-auto">
                  <InterviewTranscript
                    messages={messages}
                    onAddComment={handleAddComment}
                    onRequestAiAnalysis={handleRequestAiAnalysis}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Questions & Notes */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* Suggested Questions */}
              <Card className="flex-[3_3_0%] flex flex-col min-h-0">
                <CardHeader className="card-padding pb-2 flex-[0_0_auto] flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="card-header-md">Suggested Questions</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestedQuestions(!showSuggestedQuestions)}
                  >
                    {showSuggestedQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-2">
                      {suggestedQuestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-3 bg-muted rounded-lg space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{suggestion.question}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddQuestion(suggestion.question)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{suggestion.context}</span>
                            <span className="font-medium text-primary">
                              {suggestion.relevance}% match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Notes */}
              <Card className="flex-[2_2_0%] flex flex-col min-h-0">
                <CardHeader className="card-padding pb-2 flex-[0_0_auto]">
                  <CardTitle className="card-header-md">Quick Notes</CardTitle>
                </CardHeader>
                <CardContent className="card-padding pt-0 flex-1 flex flex-col min-h-0">
                  <Textarea
                    className="flex-1 min-h-0 resize-none"
                    placeholder="Take quick notes during the interview..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setNotes('')}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleComplete}>
                      {interviewComplete ? 'Completed' : 'Complete Interview'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 pt-4 min-h-0">
          <Card className="h-full">
            <CardHeader className="shrink-0">
              <CardTitle>Completed Interviews</CardTitle>
              <CardDescription>View and manage interview results</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)] overflow-auto">
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
