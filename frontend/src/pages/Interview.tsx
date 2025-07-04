import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, Bot, MessageSquare, ThumbsUp, ThumbsDown,
  Clock, User, AlertCircle, ChevronRight, Info, Plus, Mic, MicOff, RefreshCw,
  Pencil, Check, X
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import InterviewAssistant from '@/components/interview/InterviewAssistant';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Input } from '@/components/ui/input';
import { PageHeader } from "@/components/ui/page-header";
import { mockCandidates, mockInterviews } from '@/mocks/interviewData';
import { Note } from '@/types';
import { useAudioRecorder, arrayBufferToBase64 } from '@/hooks/useAudioRecorder';
import { supabase } from '@/lib/supabaseClient'; // adjust path if needed



// Types for suggested questions
interface SuggestedQuestion {
  id: string;
  question: string;
  category: string;
  context: string;
  tags: string[];
  aiReason: string;
  notes?: { text: string; timestamp: string }[];
}

interface MessageAIAnalysis {
  type: string;
  summary: string;
  confidence: number;
  keyPoints?: string[];
  resumeMatch?: boolean;
}

interface MessageEvent {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: string;
  category?: string;
  rating?: number;
  color?: string;
  aiAnalysis?: MessageAIAnalysis;
  quickLabels?: string[];
}

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<MessageEvent[]>([]);
  const [quickNote, setQuickNote] = useState('');
  const [quickNotes, setQuickNotes] = useState<Note[]>([]);
  const [isRefreshingQuestions, setIsRefreshingQuestions] = useState(false);
  const [suggestedLabels, setSuggestedLabels] = useState<{ messageId: string; labels: string[] } | null>(null);
  const [editingLabel, setEditingLabel] = useState<{ messageId: string; labelIndex: number; value: string } | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [questionNote, setQuestionNote] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Find the candidate from mock data
  const candidate = mockCandidates.find(c => c.id === candidateId) || mockCandidates[0];

  // Initialize messages from mock data
  // React.useEffect(() => {
  //   const initialMessages = mockInterviews[0]?.messages?.map(msg => ({
  //     ...msg,
  //     type: msg.type as 'question' | 'answer'
  //   })) || [];
  //   setMessages(initialMessages);
  // }, []);

    const userId = candidateId || '1'; 

    useEffect(() => {
      const eventSource = new EventSource(`http://localhost:8000/events/${userId}`);
    
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
      
          if (parsed.type === 'ai_message' && parsed.payload) {
            const message = parsed.payload;
            console.log(message);
            const timestamp = new Date().toLocaleTimeString();
          
            
            if (message.speaker === "interviewee" && message.audio_transcript) {
              setMessages((prev) => [
                ...prev,
                {
                  id: String(prev.length + 1),
                  type: "answer",
                  content: message.audio_transcript,
                  timestamp,
                  rating: message.rating || 1,
                  color: "#facc15",
                  aiAnalysis: {
                    type: message.confidence_score > 75 ? 'excellent' : 'concern',
                    summary: message.feedback || "Spoken response",
                    confidence: (message.confidence_score || 75) / 100,
                    keyPoints: message.keyPoints || [],
                    resumeMatch: message.resumeMatch,
                  },
                  quickLabels: message.quickLabels || [],
                },
              ]);
            } else if (message.speaker === "interviewer" && message.audio_transcript) {
              setMessages((prev) => [
                ...prev,
                {
                  id: String(prev.length + 1),
                  type: "question",
                  content: message.audio_transcript,
                  timestamp,
                  rating: message.rating || 1,
                  color: "#facc15",
                  aiAnalysis: {
                    type: message.confidence_score > 75 ? 'excellent' : 'concern',
                    summary: message.feedback || "Spoken response",
                    confidence: (message.confidence_score || 75) / 100,
                    keyPoints: message.keyPoints || [],
                    resumeMatch: message.resumeMatch,
                  },
                  quickLabels: message.quickLabels || [],
                },
              ]);
            }
            
          
            // Push interview_question as AI-suggested question
            if (message.interview_question) {
              setSuggestedQuestions((prev) => [
                ...prev,
                {
                  id: String(prev.length + 1),
                  question: message.interview_question,
                  category: "AI-suggested",
                  context: "",
                  tags: [],
                  aiReason: message.feedback || "AI-suggested follow-up",
                  notes: [],
                },
              ]);
            }
          }
          
        } catch (err) {
          console.error("Failed to parse SSE message", err);
        }
      };
    
      eventSource.onerror = (err) => {
        console.error("SSE connection error:", err);
        eventSource.close();
      };
    
      return () => {
        eventSource.close();
      };
    }, [userId]);
    


  const addMessage = (content: string, type: 'question' | 'answer') => {
    const newMessage: MessageEvent = {
      id: String(messages.length + 1),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
      category: type === 'question' ? 'technical-experience' : undefined,
      aiAnalysis: {
        type: 'baseline',
        summary: 'Processing response...',
        confidence: 0.8
      }
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const addQuickNote = (text: string) => {
    const newNote: Note = {
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setQuickNotes(prev => [...prev, newNote]);
  };

  const refreshSuggestedQuestions = () => {
    setIsRefreshingQuestions(true);
    // Simulate API call for new questions based on context
    setTimeout(() => {
      setSuggestedQuestions([
        {
          id: '5',
          question: 'How do you handle performance optimization in large React applications?',
          category: 'technical',
          context: 'Following up on scale handling discussion',
          tags: ['Performance', 'Technical Depth'],
          aiReason: 'Candidate mentioned handling 50k daily users, probe optimization approach'
        },
        {
          id: '6',
          question: 'Can you describe your experience with micro-frontend architecture challenges?',
          category: 'technical',
          context: 'Deep dive into mentioned architecture',
          tags: ['Architecture', 'Problem Solving'],
          aiReason: 'Explore challenges and solutions in mentioned micro-frontend implementation'
        }
      ]);
      setIsRefreshingQuestions(false);
    }, 1000);
  };

  // Function to generate AI suggested labels based on the answer content and analysis
  const generateSuggestedLabels = (messageId: string, content: string) => {
    // Simulate AI analysis
    setSuggestedLabels({
      messageId,
      labels: ['Technical Depth', 'Problem Solving', 'Architecture']
    });
  };

  // Function to add a label to a message
  const addLabelToMessage = (messageId: string, label: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          quickLabels: [...(msg.quickLabels || []), label]
        };
      }
      return msg;
    }));
  };

  // Function to edit a label
  const updateLabel = (messageId: string, labelIndex: number, newValue: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quickLabels) {
        const updatedLabels = [...msg.quickLabels];
        updatedLabels[labelIndex] = newValue;
        return {
          ...msg,
          quickLabels: updatedLabels
        };
      }
      return msg;
    }));
  };

  // Function to remove a label
  const removeLabel = (messageId: string, labelIndex: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quickLabels) {
        const updatedLabels = msg.quickLabels.filter((_, idx) => idx !== labelIndex);
        return {
          ...msg,
          quickLabels: updatedLabels
        };
      }
      return msg;
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900';
      case 'behavioral':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900';
      case 'leadership':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-900';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800';
    }
  };

  const addQuestionNote = (questionId: string, note: string) => {
    setSuggestedQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          notes: [...(q.notes || []), { text: note, timestamp: new Date().toLocaleTimeString() }]
        };
      }
      return q;
    }));
    setQuestionNote('');
    setSelectedQuestion(null);
  };

  const getMessageAnalysisColor = (message: any) => {
    if (message.type === 'answer') {
      const analysis = message.aiAnalysis;
      if (!analysis) return 'bg-white dark:bg-gray-800 border-gray-200';

      switch (analysis.type) {
        case 'excellent':
          return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900';
        case 'good':
          return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900';
        case 'concern':
          return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900';
        case 'mismatch':
          return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900';
        default:
          return 'bg-white dark:bg-gray-800 border-gray-200';
      }
    }
    return 'bg-gray-50 border-gray-200 dark:bg-gray-900';
  };

  const getAnalysisBadge = (analysis: any) => {
    if (!analysis) return null;

    const badges = {
      excellent: { label: 'Excellent', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      good: { label: 'Good', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      concern: { label: 'Needs Clarification', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      mismatch: { label: 'Resume Mismatch', class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
    };

    return badges[analysis.type] || null;
  };

  // --- AUDIO RECORDING LOGIC ---
  const audioBufferRef = React.useRef<ArrayBuffer[]>([]);
  const bufferTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Use the audio recorder hook
  const { start, stop } = useAudioRecorder((pcmData) => {
    audioBufferRef.current.push(pcmData);
    // Buffer is sent on timer
  });

  // Function to send buffered audio to backend
  const sendBufferedAudio = React.useCallback(async () => {
    if (audioBufferRef.current.length === 0) return;
    let totalLength = audioBufferRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioBufferRef.current) {
      combinedBuffer.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    try {
      await fetch(`http://localhost:8000/send/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mime_type: 'audio/pcm',
          data: arrayBufferToBase64(combinedBuffer.buffer),
        }),
      });
    } catch (err) {
      // Optionally handle error
    }
    audioBufferRef.current = [];
  }, [userId]);

  // Start/stop recording and timer
  useEffect(() => {
    if (isRecording) {
      start();
      bufferTimerRef.current = setInterval(sendBufferedAudio, 200);
    } else {
      stop();
      if (bufferTimerRef.current) {
        clearInterval(bufferTimerRef.current);
        bufferTimerRef.current = null;
      }
      // Send any remaining audio
      sendBufferedAudio();
      // Save session to Supabase when mic is turned off
      saveSessionToSupabase();
    }
    // Cleanup on unmount
    return () => {
      stop();
      if (bufferTimerRef.current) {
        clearInterval(bufferTimerRef.current);
        bufferTimerRef.current = null;
      }
    };
  }, [isRecording, start, stop, sendBufferedAudio]);
  // --- END AUDIO RECORDING LOGIC ---

  async function saveSessionToSupabase() {
    const dataToSave = {
      quickNotes: Array.isArray(quickNotes) ? quickNotes : [],
      messages: Array.isArray(messages) ? messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        aiSummary: msg.aiAnalysis?.summary,
        aiConfidence: msg.aiAnalysis?.confidence,
      })) : [],
    };
    const jsonString = JSON.stringify(dataToSave, null, 2);
    const file = new File([jsonString], `interview-session-${Date.now()}.json`, { type: "application/json" });

    const { data, error } = await supabase.storage
      .from('interview-sessions')
      .upload(`sessions/interview-session-${Date.now()}.json`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
    } else {
      console.log('File uploaded:', data);
    }
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <PageHeader
          title={candidate.name}
          subtitle={candidate.position}
          className="gap-4"
        >
          <Badge>{candidate.status}</Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/interviewed/1/evaluation')}>
              Skip Interview
            </Button>
            <Button onClick={() => navigate(`/interview/${candidateId}/report`)}>
              End Interview
            </Button>
          </div>
        </PageHeader>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column - Compact Profile */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{candidate.name}</CardTitle>
                    <CardDescription>{candidate.position}</CardDescription>
                  </div>
                </div>
                <HoverCard>
                  <HoverCardTrigger>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Experience</h4>
                          <p className="text-sm text-muted-foreground">{candidate.experience}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium">Education</h4>
                          <p className="text-sm text-muted-foreground">{candidate.education}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium">Skills</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium">AI Summary</h4>
                          <div className="space-y-2 mt-1">
                            <div>
                              <p className="text-sm font-medium text-green-600">Strengths</p>
                              <ul className="text-sm text-muted-foreground list-disc pl-4">
                                {candidate.aiSummary?.strengths?.map((strength, index) => (
                                  <li key={index}>{strength}</li>
                                )) || []}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-yellow-600">Considerations</p>
                              <ul className="text-sm text-muted-foreground list-disc pl-4">
                                {candidate.aiSummary?.considerations?.map((consideration, index) => (
                                  <li key={index}>{consideration}</li>
                                )) || []}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Quick Stats</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-sm font-medium">5 years</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">AI Match</p>
                      <p className="text-sm font-medium">85%</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">HR Chat Assistant</label>
                  <Card className="bg-muted">
                    <CardContent className="p-3">
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {/* AI Chat messages would go here */}
                          <p className="text-xs">Ask me anything about the candidate's background or for suggested questions.</p>
                        </div>
                      </ScrollArea>
                      <div className="mt-2 flex gap-2">
                        <Textarea placeholder="Ask AI assistant..." className="h-8 text-xs" />
                        <Button size="sm" className="h-8">
                          <Bot className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Real-time Transcript */}
        <div className="col-span-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Interview Transcript</CardTitle>
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "relative group",
                        message.type === 'question' ? 'pl-4' : 'pl-8'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "p-2 rounded-lg flex-1 border transition-colors duration-200",
                          getMessageAnalysisColor(message)
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp}
                            </span>
                            {message.type === 'answer' && (
                              <div className="flex items-center gap-2">
                                {message.aiAnalysis && getAnalysisBadge(message.aiAnalysis) && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs font-medium",
                                      getAnalysisBadge(message.aiAnalysis)?.class
                                    )}
                                  >
                                    {getAnalysisBadge(message.aiAnalysis)?.label}
                                  </Badge>
                                )}
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">AI Analysis</p>
                                        {message.aiAnalysis?.confidence && (
                                          <Badge variant="outline" className="text-xs">
                                            {Math.round(message.aiAnalysis.confidence * 100)}% confidence
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm">{message.aiAnalysis?.summary}</p>
                                      {message.aiAnalysis?.keyPoints && (
                                        <div className="space-y-1">
                                          <p className="text-xs font-medium">Key Points:</p>
                                          <ul className="text-xs text-muted-foreground list-disc pl-4">
                                            {message.aiAnalysis.keyPoints.map((point, idx) => (
                                              <li key={idx}>{point}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {message.aiAnalysis?.resumeMatch !== undefined && (
                                        <div className="flex items-center gap-2 text-xs">
                                          <Badge variant="outline" className={cn(
                                            message.aiAnalysis.resumeMatch
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          )}>
                                            {message.aiAnalysis.resumeMatch ? 'Matches Resume' : 'Resume Mismatch'}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                                <HoverCard openDelay={0} closeDelay={500}>
                                  <HoverCardTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onMouseEnter={() => generateSuggestedLabels(message.id, message.content)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent
                                    side="right"
                                    align="start"
                                    className="w-72 p-3"
                                  >
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">Suggested Labels</p>
                                      <div className="flex flex-wrap gap-2">
                                        {suggestedLabels?.messageId === message.id ? (
                                          suggestedLabels.labels.length > 0 ? (
                                            suggestedLabels.labels.map((label, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-secondary transition-colors px-2 py-1"
                                                onClick={() => addLabelToMessage(message.id, label)}
                                              >
                                                {label}
                                              </Badge>
                                            ))
                                          ) : (
                                            <p className="text-sm text-muted-foreground">No suggestions available</p>
                                          )
                                        ) : (
                                          <p className="text-sm text-muted-foreground">Loading suggestions...</p>
                                        )}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            )}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.quickLabels && message.quickLabels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.quickLabels.map((label, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  {editingLabel?.messageId === message.id && editingLabel?.labelIndex === idx ? (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        className="h-6 text-xs"
                                        value={editingLabel.value}
                                        onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            updateLabel(message.id, idx, editingLabel.value);
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => updateLabel(message.id, idx, editingLabel.value)}
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setEditingLabel(null)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <Badge variant="secondary" className="text-xs">
                                        {label}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                        onClick={() => setEditingLabel({ messageId: message.id, labelIndex: idx, value: label })}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                        onClick={() => removeLabel(message.id, idx)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="animate-pulse">●</span>
                      Recording...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Suggested Questions & Quick Notes */}
        <div className="col-span-3">
          <div className="space-y-4 h-full">
            {/* Suggested Questions */}
            <Card className="h-[40%]">
              <CardHeader className="py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Suggested Questions</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshSuggestedQuestions}
                    disabled={isRefreshingQuestions}
                    className="h-8 px-2"
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4",
                      isRefreshingQuestions && "animate-spin"
                    )} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100%-3rem)] px-4">
                  <div className="space-y-1">
                    {suggestedQuestions.map((question) => (
                      <HoverCard key={question.id}>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs font-normal"
                          >
                            <div className="line-clamp-1">
                              {question.question}
                            </div>
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent side="left" className="w-80">
                          <div className="space-y-2">
                            <p className="text-sm">{question.question}</p>
                            <div className="flex flex-wrap gap-1">
                              {question.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{question.aiReason}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Notes Section */}
            <Card className="h-[60%]">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Quick Notes</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (quickNote.trim()) {
                      setQuickNotes(prev => [...prev, {
                        text: quickNote,
                        timestamp: new Date().toLocaleTimeString()
                      }]);
                      setQuickNote('');
                    }
                  }}>
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your quick note here..."
                    className="text-sm h-20 mb-2"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                  />
                  <ScrollArea className="h-[calc(100%-7rem)]">
                    <div className="space-y-2">
                      {quickNotes.map((note, index) => (
                        <div
                          key={index}
                          className="text-sm bg-muted p-2 rounded-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {note.timestamp}
                            </span>
                          </div>
                          <p className="mt-1">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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