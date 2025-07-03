import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  Square,
  Clock,
  User,
  Brain,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Minus,
  Eye,
  FileText,
  Download,
  Upload,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Phone,
  Monitor,
  Users,
  Calendar,
  MapPin,
  Timer,
  Target,
  TrendingUp,
  Award,
  Zap,
  Lightbulb,
  Flag,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';

// Enhanced Interview Types
interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral' | 'final';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  interviewer: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  questions: InterviewQuestion[];
  evaluationCriteria: EvaluationCriterion[];
  feedback?: InterviewFeedback;
  aiAnalysis?: AIAnalysis;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'cultural' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  expectedAnswer?: string;
  response?: string;
  score?: number;
  notes?: string;
  timeSpent?: number;
  skipped?: boolean;
}

interface EvaluationCriterion {
  criterion: string;
  weight: number;
  description: string;
  maxScore: number;
  currentScore?: number;
}

interface InterviewFeedback {
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  notes: string;
  decision: 'pass' | 'fail' | 'maybe';
}

interface AIAnalysis {
  sentimentAnalysis: {
    confidence: number;
    enthusiasm: number;
    nervousness: number;
  };
  keywordExtraction: string[];
  responseQuality: number;
  communicationPatterns: {
    clarity: number;
    conciseness: number;
    relevance: number;
  };
  redFlags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  suggestions: string[];
}

// Timer Component
const InterviewTimer = ({
  isRunning,
  startTime,
  duration,
  onTimeUpdate
}: {
  isRunning: boolean;
  startTime: string | null;
  duration: number;
  onTimeUpdate: (elapsed: number) => void;
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const elapsedMs = now - start;
        const elapsedMin = Math.floor(elapsedMs / 60000);
        setElapsed(elapsedMin);
        onTimeUpdate(elapsedMin);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, onTimeUpdate]);

  const remaining = duration - elapsed;
  const isOvertime = remaining < 0;
  const progress = Math.min((elapsed / duration) * 100, 100);

  return (
    <Card className={cn("border-2", isOvertime ? "border-red-200" : "border-green-200")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className={cn("h-5 w-5", isOvertime ? "text-red-600" : "text-green-600")} />
            <span className="font-medium">Interview Timer</span>
          </div>
          <Badge variant={isOvertime ? "destructive" : "default"}>
            {isOvertime ? `+${Math.abs(remaining)}min over` : `${remaining}min left`}
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress
            value={progress}
            className={cn("h-2", isOvertime && "bg-red-100")}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{elapsed}min elapsed</span>
            <span>{duration}min scheduled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Question Component
const QuestionCard = ({
  question,
  index,
  total,
  onResponse,
  onScore,
  onNext,
  onPrevious,
  isActive
}: {
  question: InterviewQuestion;
  index: number;
  total: number;
  onResponse: (response: string) => void;
  onScore: (score: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
}) => {
  const [response, setResponse] = useState(question.response || '');
  const [score, setScore] = useState(question.score || 0);
  const [notes, setNotes] = useState(question.notes || '');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Monitor className="h-4 w-4" />;
      case 'behavioral': return <Users className="h-4 w-4" />;
      case 'cultural': return <Target className="h-4 w-4" />;
      case 'experience': return <Award className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("transition-all", isActive ? "ring-2 ring-primary" : "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Question {index + 1} of {total}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <div className="flex items-center gap-1">
              {getCategoryIcon(question.category)}
              <span className="text-sm text-muted-foreground capitalize">
                {question.category}
              </span>
            </div>
          </div>
          {question.timeLimit && (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {question.timeLimit}min
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {question.expectedAnswer && (
          <div className="bg-blue-50 rounded-lg p-3">
            <Label className="text-xs font-medium text-blue-700">Expected Answer Framework</Label>
            <p className="text-sm text-blue-600 mt-1">{question.expectedAnswer}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="response">Candidate Response</Label>
          <Textarea
            id="response"
            value={response}
            onChange={(e) => {
              setResponse(e.target.value);
              onResponse(e.target.value);
            }}
            placeholder="Record the candidate's response here..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-10)</Label>
            <div className="flex items-center gap-2">
              <Select
                value={score.toString()}
                onValueChange={(value) => {
                  const newScore = parseInt(value);
                  setScore(newScore);
                  onScore(newScore);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}/10 {i >= 8 ? '(Excellent)' : i >= 6 ? '(Good)' : i >= 4 ? '(Average)' : '(Poor)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                {score >= 8 ? (
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                ) : score >= 6 ? (
                  <Star className="h-4 w-4 text-yellow-600" />
                ) : score > 0 ? (
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations..."
              className="min-h-[40px]"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={index === 0}
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResponse('');
                setScore(0);
                setNotes('');
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Flag className="h-4 w-4 mr-1" />
              Flag
            </Button>
          </div>

          <Button
            onClick={onNext}
            disabled={index === total - 1}
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// AI Analysis Component
const AIAnalysisPanel = ({ analysis }: { analysis: AIAnalysis | null }) => {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">AI analysis will appear here during the interview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Analysis */}
        <div>
          <Label className="text-sm font-medium">Sentiment Analysis</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round(analysis.sentimentAnalysis.confidence)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(analysis.sentimentAnalysis.enthusiasm)}%
              </div>
              <div className="text-xs text-muted-foreground">Enthusiasm</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {Math.round(analysis.sentimentAnalysis.nervousness)}%
              </div>
              <div className="text-xs text-muted-foreground">Nervousness</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Communication Patterns */}
        <div>
          <Label className="text-sm font-medium">Communication Quality</Label>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Clarity</span>
              <div className="flex items-center gap-2">
                <Progress value={analysis.communicationPatterns.clarity} className="w-16 h-2" />
                <span className="text-sm font-medium">{Math.round(analysis.communicationPatterns.clarity)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Conciseness</span>
              <div className="flex items-center gap-2">
                <Progress value={analysis.communicationPatterns.conciseness} className="w-16 h-2" />
                <span className="text-sm font-medium">{Math.round(analysis.communicationPatterns.conciseness)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Relevance</span>
              <div className="flex items-center gap-2">
                <Progress value={analysis.communicationPatterns.relevance} className="w-16 h-2" />
                <span className="text-sm font-medium">{Math.round(analysis.communicationPatterns.relevance)}%</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Red Flags */}
        {analysis.redFlags.length > 0 && (
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Potential Concerns
            </Label>
            <div className="space-y-2 mt-2">
              {analysis.redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className={cn(
                    "h-4 w-4 mt-0.5",
                    flag.severity === 'high' ? 'text-red-600' :
                      flag.severity === 'medium' ? 'text-orange-500' :
                        'text-yellow-500'
                  )} />
                  <div>
                    <div className="text-sm font-medium">{flag.type}</div>
                    <div className="text-xs text-muted-foreground">{flag.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              AI Suggestions
            </Label>
            <div className="space-y-1 mt-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Interview Component
const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview State
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState<'not-started' | 'in-progress' | 'paused' | 'completed'>('not-started');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<Partial<InterviewFeedback>>({});

  // Mock interview data - In real app, this would come from API
  useEffect(() => {
    // Simulate loading interview data
    const mockInterview: Interview = {
      id: id || '1',
      candidateId: 'candidate-1',
      candidateName: 'Alex Johnson',
      position: 'Senior Frontend Developer',
      type: 'video',
      status: 'scheduled',
      scheduledDate: '2024-03-20',
      scheduledTime: '14:00',
      duration: 60,
      interviewer: {
        id: 'interviewer-1',
        name: 'John Smith',
        role: 'Tech Lead',
        email: 'john.smith@company.com'
      },
      questions: [
        {
          id: 'q1',
          question: 'Tell me about yourself and your experience with React.',
          category: 'experience',
          difficulty: 'easy',
          timeLimit: 5,
          expectedAnswer: 'Should cover background, React experience, recent projects'
        },
        {
          id: 'q2',
          question: 'How would you optimize the performance of a React application?',
          category: 'technical',
          difficulty: 'medium',
          timeLimit: 10,
          expectedAnswer: 'Code splitting, memoization, virtual scrolling, bundle optimization'
        },
        {
          id: 'q3',
          question: 'Describe a time when you had to resolve a conflict with a team member.',
          category: 'behavioral',
          difficulty: 'medium',
          timeLimit: 8
        }
      ],
      evaluationCriteria: [
        { criterion: 'Technical Skills', weight: 40, description: 'Coding ability and technical knowledge', maxScore: 10 },
        { criterion: 'Communication', weight: 30, description: 'Clarity and articulation', maxScore: 10 },
        { criterion: 'Problem Solving', weight: 20, description: 'Analytical thinking', maxScore: 10 },
        { criterion: 'Cultural Fit', weight: 10, description: 'Alignment with company values', maxScore: 10 }
      ]
    };

    setInterview(mockInterview);
  }, [id]);

  // Interview Controls
  const startInterview = () => {
    setInterviewStatus('in-progress');
    setInterview(prev => prev ? { ...prev, startTime: new Date().toISOString() } : null);
    toast({
      title: "Interview Started",
      description: "Good luck! The interview is now in progress.",
    });
  };

  const pauseInterview = () => {
    setInterviewStatus('paused');
    toast({
      title: "Interview Paused",
      description: "You can resume when ready.",
    });
  };

  const completeInterview = () => {
    setInterviewStatus('completed');
    setInterview(prev => prev ? { ...prev, endTime: new Date().toISOString(), actualDuration: elapsedTime } : null);
    toast({
      title: "Interview Completed",
      description: "Please complete your evaluation and feedback.",
    });
  };

  const simulateAIAnalysis = () => {
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        sentimentAnalysis: {
          confidence: 82,
          enthusiasm: 75,
          nervousness: 25
        },
        keywordExtraction: ['React', 'JavaScript', 'TypeScript', 'Performance', 'Team collaboration'],
        responseQuality: 78,
        communicationPatterns: {
          clarity: 85,
          conciseness: 70,
          relevance: 88
        },
        redFlags: [
          {
            type: 'Vague Answer',
            severity: 'medium',
            description: 'Answer lacked specific examples'
          }
        ],
        suggestions: [
          'Ask for more specific examples',
          'Probe deeper into technical implementation',
          'Candidate seems confident - good sign'
        ]
      });
    }, 2000);
  };

  if (!interview) {
    return <div>Loading interview...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Interview: ${interview.candidateName}`}
        subtitle={`${interview.position} • ${interview.type} interview • ${interview.duration} minutes`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {interview.type}
          </Badge>
          <Badge variant={
            interviewStatus === 'completed' ? 'default' :
              interviewStatus === 'in-progress' ? 'secondary' :
                interviewStatus === 'paused' ? 'outline' : 'outline'
          }>
            {interviewStatus.replace('-', ' ')}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate('/screening')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Screening
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {interviewStatus === 'not-started' && (
                    <Button onClick={startInterview} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Interview
                    </Button>
                  )}

                  {interviewStatus === 'in-progress' && (
                    <>
                      <Button onClick={pauseInterview} variant="outline" className="gap-2">
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                      <Button onClick={completeInterview} className="gap-2">
                        <Square className="h-4 w-4" />
                        Complete
                      </Button>
                    </>
                  )}

                  {interviewStatus === 'paused' && (
                    <Button onClick={() => setInterviewStatus('in-progress')} className="gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                  )}

                  {interviewStatus === 'completed' && (
                    <Badge className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Interview Completed
                    </Badge>
                  )}
                </div>

                {/* Media Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsRecording(!isRecording);
                      if (!isRecording) simulateAIAnalysis();
                    }}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
                    )} />
                    {isRecording ? 'Recording' : 'Record'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          {interviewStatus !== 'not-started' && (
            <Tabs defaultValue="questions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                <TabsTrigger value="notes">Final Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                {interview.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    total={interview.questions.length}
                    isActive={index === currentQuestionIndex}
                    onResponse={(response) => {
                      const updatedQuestions = [...interview.questions];
                      updatedQuestions[index].response = response;
                      setInterview({ ...interview, questions: updatedQuestions });
                    }}
                    onScore={(score) => {
                      const updatedQuestions = [...interview.questions];
                      updatedQuestions[index].score = score;
                      setInterview({ ...interview, questions: updatedQuestions });
                    }}
                    onNext={() => setCurrentQuestionIndex(Math.min(currentQuestionIndex + 1, interview.questions.length - 1))}
                    onPrevious={() => setCurrentQuestionIndex(Math.max(currentQuestionIndex - 1, 0))}
                  />
                ))}
              </TabsContent>

              <TabsContent value="evaluation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluation Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {interview.evaluationCriteria.map((criterion, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">{criterion.criterion}</Label>
                            <p className="text-sm text-muted-foreground">{criterion.description}</p>
                          </div>
                          <Badge variant="outline">Weight: {criterion.weight}%</Badge>
                        </div>
                        <Select
                          value={criterion.currentScore?.toString() || ""}
                          onValueChange={(value) => {
                            const updatedCriteria = [...interview.evaluationCriteria];
                            updatedCriteria[index].currentScore = parseInt(value);
                            setInterview({ ...interview, evaluationCriteria: updatedCriteria });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select score" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: criterion.maxScore + 1 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}/{criterion.maxScore}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Final Feedback & Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Strengths</Label>
                        <Textarea
                          placeholder="Key strengths observed..."
                          value={overallFeedback.strengths?.join('\n') || ''}
                          onChange={(e) => setOverallFeedback({
                            ...overallFeedback,
                            strengths: e.target.value.split('\n').filter(s => s.trim())
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Areas for Improvement</Label>
                        <Textarea
                          placeholder="Areas that need development..."
                          value={overallFeedback.weaknesses?.join('\n') || ''}
                          onChange={(e) => setOverallFeedback({
                            ...overallFeedback,
                            weaknesses: e.target.value.split('\n').filter(s => s.trim())
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Overall Recommendation</Label>
                      <Textarea
                        placeholder="Your overall assessment and recommendation..."
                        value={overallFeedback.recommendations || ''}
                        onChange={(e) => setOverallFeedback({
                          ...overallFeedback,
                          recommendations: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Final Decision</Label>
                      <Select
                        value={overallFeedback.decision || ""}
                        onValueChange={(value: 'pass' | 'fail' | 'maybe') =>
                          setOverallFeedback({ ...overallFeedback, decision: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pass">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Pass - Recommend for next stage
                            </div>
                          </SelectItem>
                          <SelectItem value="maybe">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              Maybe - Requires discussion
                            </div>
                          </SelectItem>
                          <SelectItem value="fail">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              Fail - Do not proceed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button className="flex-1" disabled={!overallFeedback.decision}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Final Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
          {interviewStatus !== 'not-started' && (
            <InterviewTimer
              isRunning={interviewStatus === 'in-progress'}
              startTime={interview.startTime || null}
              duration={interview.duration}
              onTimeUpdate={setElapsedTime}
            />
          )}

          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{interview.candidateName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Position</Label>
                <p className="text-sm">{interview.position}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Interview Type</Label>
                <Badge variant="outline" className="capitalize">
                  {interview.type}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Scheduled</Label>
                <p className="text-sm">
                  {interview.scheduledDate} at {interview.scheduledTime}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {isRecording && (
            <AIAnalysisPanel analysis={aiAnalysis} />
          )}

          {/* Progress Overview */}
          {interviewStatus !== 'not-started' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions Answered</span>
                    <span>{interview.questions.filter(q => q.response).length}/{interview.questions.length}</span>
                  </div>
                  <Progress
                    value={(interview.questions.filter(q => q.response).length / interview.questions.length) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions Scored</span>
                    <span>{interview.questions.filter(q => q.score !== undefined).length}/{interview.questions.length}</span>
                  </div>
                  <Progress
                    value={(interview.questions.filter(q => q.score !== undefined).length / interview.questions.length) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Score</span>
                    <span>
                      {interview.questions.filter(q => q.score !== undefined).length > 0
                        ? Math.round(
                          interview.questions
                            .filter(q => q.score !== undefined)
                            .reduce((sum, q) => sum + (q.score || 0), 0) /
                          interview.questions.filter(q => q.score !== undefined).length
                        )
                        : 0
                      }/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
