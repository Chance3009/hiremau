import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import {
    Brain,
    CheckCircle2,
    AlertCircle,
    Star,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Clock,
    User,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - in real app, this would come from your state/context/API
const mockInterviewReport = {
    candidate: {
        name: 'John Doe',
        position: 'Frontend Developer',
        date: '2024-03-20',
        duration: '45 minutes',
    },
    quickLabels: [
        'Strong Technical Skills',
        'Good Communication',
        'Leadership Experience',
        'Needs Clarification on Testing',
    ],
    quickNotes: [
        {
            text: 'Shows strong understanding of React architecture',
            timestamp: '10:32 AM'
        },
        {
            text: 'Limited experience with testing frameworks',
            timestamp: '10:45 AM'
        },
    ],
    aiAnalysis: {
        overallScore: 85,
        confidence: 0.92,
        strengths: [
            'Deep technical knowledge in React and TypeScript',
            'Excellent problem-solving approach',
            'Strong team leadership experience',
        ],
        concerns: [
            'Limited testing experience',
            'Some gaps in cloud architecture knowledge',
        ],
        keyHighlights: [
            {
                type: 'positive',
                point: 'Led a team of 5 developers in previous role',
                confidence: 0.95,
            },
            {
                type: 'positive',
                point: 'Implemented complex state management solutions',
                confidence: 0.88,
            },
            {
                type: 'concern',
                point: 'Limited experience with integration testing',
                confidence: 0.85,
            },
        ],
        resumeMatches: {
            matching: [
                'React experience',
                'Team leadership',
                'Project management',
            ],
            discrepancies: [
                'Years of cloud experience',
            ],
        },
    },
    transcriptHighlights: [
        {
            question: 'Can you describe your experience with large-scale React applications?',
            answer: 'Led development of customer dashboard serving 50,000 daily users using React and TypeScript...',
            analysis: {
                type: 'positive',
                summary: 'Strong technical leadership with proven scale experience',
                confidence: 0.95,
            },
        },
        {
            question: 'How do you handle testing in your applications?',
            answer: 'We mainly used basic unit tests, but I haven\'t worked much with integration testing.',
            analysis: {
                type: 'concern',
                summary: 'Limited testing experience for senior role requirements',
                confidence: 0.88,
            },
        },
    ],
};

const InterviewReport = () => {
    const navigate = useNavigate();
    const { candidateId } = useParams();
    const { setCurrentStage } = useRecruitment();

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Interview Report</h1>
                        <p className="text-muted-foreground">
                            {mockInterviewReport.candidate.name} - {mockInterviewReport.candidate.position}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/candidates')}>
                        Back to Candidates
                    </Button>
                    <Button onClick={() => {
                        setCurrentStage('final-review');
                        navigate('/final-review');
                    }}>
                        Proceed to Final Review
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Quick Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Date</span>
                                <span className="font-medium">{mockInterviewReport.candidate.date}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Duration</span>
                                <span className="font-medium">{mockInterviewReport.candidate.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">AI Score</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-medium">
                                        {mockInterviewReport.aiAnalysis.overallScore}%
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {Math.round(mockInterviewReport.aiAnalysis.confidence * 100)}% confidence
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-2">Quick Labels</h3>
                            <div className="flex flex-wrap gap-2">
                                {mockInterviewReport.quickLabels.map((label, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-2">Resume Match</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-medium text-green-600 mb-1">Matching Points</p>
                                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                                        {mockInterviewReport.aiAnalysis.resumeMatches.matching.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-red-600 mb-1">Discrepancies</p>
                                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                                        {mockInterviewReport.aiAnalysis.resumeMatches.discrepancies.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Middle Column - AI Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                Strengths
                            </h3>
                            <ul className="space-y-1">
                                {mockInterviewReport.aiAnalysis.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                Areas of Concern
                            </h3>
                            <ul className="space-y-1">
                                {mockInterviewReport.aiAnalysis.concerns.map((concern, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        {concern}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-2">Key Highlights</h3>
                            <div className="space-y-2">
                                {mockInterviewReport.aiAnalysis.keyHighlights.map((highlight, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "p-3 rounded-lg border",
                                            highlight.type === 'positive'
                                                ? "bg-green-50 border-green-100"
                                                : "bg-red-50 border-red-100"
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            {highlight.type === 'positive' ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-sm">{highlight.point}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {Math.round(highlight.confidence * 100)}% confidence
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Notes & Transcript */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notes & Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Quick Notes</h3>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-2">
                                    {mockInterviewReport.quickNotes.map((note, idx) => (
                                        <div key={idx} className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm">{note.text}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{note.timestamp}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-2">Key Moments</h3>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {mockInterviewReport.transcriptHighlights.map((highlight, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="bg-muted p-3 rounded-lg">
                                                <p className="text-sm font-medium">{highlight.question}</p>
                                                <p className="text-sm mt-2">{highlight.answer}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            highlight.analysis.type === 'positive'
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-700"
                                                        )}
                                                    >
                                                        {highlight.analysis.type === 'positive' ? 'Strong Response' : 'Needs Follow-up'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {Math.round(highlight.analysis.confidence * 100)}% confidence
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InterviewReport; 