import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calendar,
    Clock,
    Users,
    Video,
    Phone,
    MapPin,
    Play,
    Settings,
    Search,
    Filter,
    Plus,
    RefreshCw,
    User,
    Building,
    ChevronRight,
    Timer,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Copy,
    Bell,
    BellOff,
    Mic,
    Monitor,
    Target,
    Brain,
    Star,
    TrendingUp,
    Award,
    Activity,
    FileText,
    Download,
    Mail,
    MessageSquare,
    Zap,
    Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';

// Enhanced Interview Types
interface InterviewSession {
    id: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral' | 'final';
    status: 'upcoming' | 'ready' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    interviewer: {
        id: string;
        name: string;
        role: string;
        avatar?: string;
    };
    room?: {
        id: string;
        name: string;
        type: 'physical' | 'virtual';
        link?: string;
    };
    preparation?: {
        resumeReviewed: boolean;
        questionsGenerated: boolean;
        backgroundChecked: boolean;
        materialsReady: boolean;
    };
    aiInsights?: {
        resumeScore: number;
        keySkills: string[];
        experienceLevel: string;
        culturalFitPrediction: number;
        suggestedQuestions: string[];
        potentialConcerns: string[];
    };
    timeUntilStart?: number; // minutes
    priority: 'high' | 'medium' | 'low';
}

interface InterviewMetrics {
    today: {
        total: number;
        completed: number;
        inProgress: number;
        upcoming: number;
        cancelled: number;
    };
    week: {
        scheduled: number;
        completionRate: number;
        averageScore: number;
        noShowRate: number;
    };
    interviewerLoad: Array<{
        id: string;
        name: string;
        todayCount: number;
        weekCount: number;
        averageRating: number;
    }>;
}

// Mock data - In real app, this would come from APIs
const mockInterviews: InterviewSession[] = [
    {
        id: 'int-1',
        candidateId: 'cand-1',
        candidateName: 'Alex Johnson',
        candidateEmail: 'alex.johnson@email.com',
        position: 'Senior Frontend Developer',
        type: 'video',
        status: 'ready',
        scheduledDate: '2024-03-20',
        scheduledTime: '14:00',
        duration: 60,
        interviewer: {
            id: 'int-john',
            name: 'John Smith',
            role: 'Tech Lead'
        },
        room: {
            id: 'zoom-1',
            name: 'Zoom Room A',
            type: 'virtual',
            link: 'https://zoom.us/j/123456789'
        },
        preparation: {
            resumeReviewed: true,
            questionsGenerated: true,
            backgroundChecked: true,
            materialsReady: true
        },
        aiInsights: {
            resumeScore: 87,
            keySkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
            experienceLevel: 'Senior',
            culturalFitPrediction: 82,
            suggestedQuestions: [
                'Tell me about your experience with React performance optimization',
                'How do you handle state management in large applications?'
            ],
            potentialConcerns: ['Limited backend experience']
        },
        timeUntilStart: 15,
        priority: 'high'
    },
    {
        id: 'int-2',
        candidateId: 'cand-2',
        candidateName: 'Sarah Chen',
        candidateEmail: 'sarah.chen@email.com',
        position: 'UX Designer',
        type: 'video',
        status: 'upcoming',
        scheduledDate: '2024-03-20',
        scheduledTime: '15:30',
        duration: 45,
        interviewer: {
            id: 'int-emily',
            name: 'Emily Davis',
            role: 'Design Lead'
        },
        room: {
            id: 'teams-1',
            name: 'Teams Room B',
            type: 'virtual',
            link: 'https://teams.microsoft.com/l/meetup-join/123'
        },
        preparation: {
            resumeReviewed: true,
            questionsGenerated: false,
            backgroundChecked: false,
            materialsReady: false
        },
        aiInsights: {
            resumeScore: 92,
            keySkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
            experienceLevel: 'Mid-level',
            culturalFitPrediction: 89,
            suggestedQuestions: [
                'Walk me through your design process',
                'How do you collaborate with engineering teams?'
            ],
            potentialConcerns: []
        },
        timeUntilStart: 105,
        priority: 'medium'
    },
    {
        id: 'int-3',
        candidateId: 'cand-3',
        candidateName: 'Marcus Williams',
        candidateEmail: 'marcus.williams@email.com',
        position: 'Backend Developer',
        type: 'in-person',
        status: 'in-progress',
        scheduledDate: '2024-03-20',
        scheduledTime: '13:30',
        duration: 75,
        interviewer: {
            id: 'int-mike',
            name: 'Mike Johnson',
            role: 'Senior Engineer'
        },
        room: {
            id: 'conf-a',
            name: 'Conference Room A',
            type: 'physical'
        },
        preparation: {
            resumeReviewed: true,
            questionsGenerated: true,
            backgroundChecked: true,
            materialsReady: true
        },
        timeUntilStart: -20, // Started 20 minutes ago
        priority: 'high'
    }
];

const mockMetrics: InterviewMetrics = {
    today: {
        total: 8,
        completed: 3,
        inProgress: 1,
        upcoming: 3,
        cancelled: 1
    },
    week: {
        scheduled: 45,
        completionRate: 0.89,
        averageScore: 7.2,
        noShowRate: 0.06
    },
    interviewerLoad: [
        { id: 'int-john', name: 'John Smith', todayCount: 3, weekCount: 12, averageRating: 8.4 },
        { id: 'int-emily', name: 'Emily Davis', todayCount: 2, weekCount: 8, averageRating: 8.7 },
        { id: 'int-mike', name: 'Mike Johnson', todayCount: 2, weekCount: 10, averageRating: 8.1 }
    ]
};

// Components
const InterviewCard = ({ interview, onStart, onView, onEdit }: {
    interview: InterviewSession;
    onStart: (id: string) => void;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'bg-green-100 text-green-700 border-green-200';
            case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'no-show': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'phone': return <Phone className="h-4 w-4" />;
            case 'in-person': return <MapPin className="h-4 w-4" />;
            case 'technical': return <Monitor className="h-4 w-4" />;
            case 'behavioral': return <Users className="h-4 w-4" />;
            case 'final': return <Award className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-300';
        }
    };

    const formatTimeUntil = (minutes: number) => {
        if (minutes < 0) {
            const elapsed = Math.abs(minutes);
            if (elapsed < 60) return `${elapsed}m ago`;
            return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m ago`;
        }
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const isStartingSoon = interview.timeUntilStart !== undefined && interview.timeUntilStart > 0 && interview.timeUntilStart <= 30;
    const canStart = interview.status === 'ready' || (interview.status === 'upcoming' && isStartingSoon);

    return (
        <Card className={cn("border-l-4 hover:shadow-md transition-shadow", getPriorityColor(interview.priority))}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {getTypeIcon(interview.type)}
                            <Badge variant="outline" className={getStatusColor(interview.status)}>
                                {interview.status.replace('-', ' ')}
                            </Badge>
                        </div>
                        {interview.timeUntilStart !== undefined && (
                            <Badge variant={isStartingSoon ? "destructive" : "outline"}>
                                <Timer className="h-3 w-3 mr-1" />
                                {formatTimeUntil(interview.timeUntilStart)}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onView(interview.id)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(interview.id)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                    <p className="text-muted-foreground">{interview.position}</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.scheduledTime} ({interview.duration}min)</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.interviewer.name}</span>
                        </div>
                        {interview.room && (
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{interview.room.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights */}
                {interview.aiInsights && (
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">AI Insights</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-blue-600">Resume Score:</span>
                                <span className="font-medium ml-1">{interview.aiInsights.resumeScore}%</span>
                            </div>
                            <div>
                                <span className="text-blue-600">Culture Fit:</span>
                                <span className="font-medium ml-1">{interview.aiInsights.culturalFitPrediction}%</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-blue-600 text-xs">Key Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {interview.aiInsights.keySkills.slice(0, 3).map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preparation Status */}
                {interview.preparation && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Preparation Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    interview.preparation.resumeReviewed ? "bg-green-500" : "bg-red-500"
                                )} />
                                <span className="text-xs">Resume Reviewed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    interview.preparation.questionsGenerated ? "bg-green-500" : "bg-red-500"
                                )} />
                                <span className="text-xs">Questions Ready</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    interview.preparation.backgroundChecked ? "bg-green-500" : "bg-red-500"
                                )} />
                                <span className="text-xs">Background Checked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    interview.preparation.materialsReady ? "bg-green-500" : "bg-red-500"
                                )} />
                                <span className="text-xs">Materials Ready</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-2">
                        {interview.room?.link && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={interview.room.link} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-1" />
                                    Join Room
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Contact
                        </Button>
                    </div>

                    {canStart && (
                        <Button onClick={() => onStart(interview.id)} className="gap-2">
                            <Play className="h-4 w-4" />
                            Start Interview
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const MetricsOverview = ({ metrics }: { metrics: InterviewMetrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Interviews</p>
                            <p className="text-2xl font-bold">{metrics.today.total}</p>
                            <p className="text-xs text-muted-foreground">
                                {metrics.today.completed} completed, {metrics.today.upcoming} upcoming
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <p className="text-2xl font-bold">{Math.round(metrics.week.completionRate * 100)}%</p>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="text-2xl font-bold">{metrics.week.averageScore}/10</p>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">No-Show Rate</p>
                            <p className="text-2xl font-bold">{Math.round(metrics.week.noShowRate * 100)}%</p>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const InterviewLobby = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<InterviewSession[]>(mockInterviews);
    const [metrics, setMetrics] = useState<InterviewMetrics>(mockMetrics);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('time');

    // Filter interviews
    const filteredInterviews = interviews.filter(interview => {
        const matchesStatus = selectedStatus === 'all' || interview.status === selectedStatus;
        const matchesType = selectedType === 'all' || interview.type === selectedType;
        const matchesSearch = interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            interview.position.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    // Sort interviews
    const sortedInterviews = [...filteredInterviews].sort((a, b) => {
        switch (sortBy) {
            case 'time':
                return (a.timeUntilStart || 0) - (b.timeUntilStart || 0);
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'name':
                return a.candidateName.localeCompare(b.candidateName);
            default:
                return 0;
        }
    });

    const handleStartInterview = (interviewId: string) => {
        navigate(`/interview/${interviewId}`);
    };

    const handleViewInterview = (interviewId: string) => {
        navigate(`/candidate/${interviewId}`);
    };

    const handleEditInterview = (interviewId: string) => {
        toast({
            title: "Edit Interview",
            description: "Interview editing functionality would open here.",
        });
    };

    const handleScheduleNew = () => {
        navigate('/interviews/schedule');
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Interview Lobby"
                subtitle="Manage and monitor all interview sessions"
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={handleScheduleNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                    </Button>
                </div>
            </PageHeader>

            {/* Metrics Overview */}
            <MetricsOverview metrics={metrics} />

            {/* Tabs */}
            <Tabs defaultValue="today" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="today">Today's Interviews</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 max-w-sm">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search candidates or positions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div className="w-[140px]">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-[140px]">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="phone">Phone</SelectItem>
                                            <SelectItem value="in-person">In-Person</SelectItem>
                                            <SelectItem value="technical">Technical</SelectItem>
                                            <SelectItem value="behavioral">Behavioral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-[140px]">
                                    <Label htmlFor="sort">Sort By</Label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger id="sort">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="time">Start Time</SelectItem>
                                            <SelectItem value="priority">Priority</SelectItem>
                                            <SelectItem value="name">Candidate Name</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interview Cards */}
                    {sortedInterviews.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery ? 'Try adjusting your search criteria.' : 'No interviews scheduled for today.'}
                                </p>
                                <Button onClick={handleScheduleNew}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule Interview
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {sortedInterviews.map(interview => (
                                <InterviewCard
                                    key={interview.id}
                                    interview={interview}
                                    onStart={handleStartInterview}
                                    onView={handleViewInterview}
                                    onEdit={handleEditInterview}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Upcoming Interviews</h3>
                            <p className="text-muted-foreground">View and manage future interview sessions</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Completed Interviews</h3>
                            <p className="text-muted-foreground">Review interview results and feedback</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Interviewer Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {metrics.interviewerLoad.map(interviewer => (
                                        <div key={interviewer.id} className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{interviewer.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {interviewer.todayCount} today, {interviewer.weekCount} this week
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                    <span className="font-medium">{interviewer.averageRating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Interview Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">{metrics.week.scheduled}</div>
                                        <div className="text-sm text-muted-foreground">Interviews This Week</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{Math.round(metrics.week.completionRate * 100)}%</div>
                                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InterviewLobby; 