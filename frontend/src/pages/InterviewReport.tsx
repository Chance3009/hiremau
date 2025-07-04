import React, { useEffect, useState } from 'react';
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
import { PageHeader } from "@/components/ui/page-header";
import { mockInterviewReports, mockCandidates } from '@/mocks/interviewData';
import { fetchInterviews, createInterview, updateInterview, deleteInterview } from '@/services/interviewService';
import { supabase } from '@/lib/supabaseClient';

const InterviewReport: React.FC = () => {
    const navigate = useNavigate();
    const { reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState(null);
    const [summary, setSummary] = useState(null);

    // Get the report from mock data
    const report = mockInterviewReports.find(r => r.id === reportId) || mockInterviewReports[0];
    const candidate = mockCandidates.find(c => c.id === report.candidateId);

    // Function to fetch session JSON from Supabase
    async function fetchSessionJsonFromSupabase(filePath: string) {
        const { data, error } = await supabase
            .storage
            .from('interview-sessions')
            .createSignedUrl(filePath, 60);

        if (error || !data?.signedUrl) {
            throw new Error('Could not get signed file URL');
        }

        const response = await fetch(data.signedUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const jsonData = await response.json();
        return jsonData;
    }

    useEffect(() => {
        const loadInterviewData = async () => {
            try {
                setLoading(true);
                
                // 1. Fetch session data from Supabase
                const filePath = `sessions/interview-session-${reportId}.json`;
                const sessionData = await fetchSessionJsonFromSupabase(filePath);
                setSessionData(sessionData);
                
                // 2. Get AI summary using the endpoint from main.py
                const response = await fetch('http://localhost:8010/summarize_interview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sessionData),
                });
                
                const result = await response.json();
                if (result.summary) {
                    setSummary(result.summary);
                } else if (result.error) {
                    setError(result.error);
                }
                
            } catch (err) {
                setError(err.message || 'Failed to load interview data');
            } finally {
                setLoading(false);
            }
        };

        loadInterviewData();
    }, [reportId]);

    // Display loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div>Loading interview report...</div>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <PageHeader
                    title={candidate?.name || 'Interview Report'}
                    subtitle={candidate?.position}
                    className="gap-4"
                >
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </PageHeader>
            </div>

            <div className="flex-1 space-y-4 p-4">
                <div className="grid gap-4">
                    {/* AI Summary */}
                    {summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">AI Interview Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-wrap">{summary}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Session Data (for debugging) */}
                    {sessionData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">Session Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(sessionData, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}

                    {/* Interview Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Interview Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{report.date} ({report.duration} minutes)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{report.interviewer.name} ({report.interviewer.role})</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Labels */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Quick Labels</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {report.quickLabels.map((label, index) => (
                                    <Badge key={index} variant="secondary">{label}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Quick Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-4">
                                    {report.quickNotes.map((note, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                                            <div className="space-y-1">
                                                <p className="text-sm">{note.text}</p>
                                                <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* AI Analysis */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-medium">AI Analysis</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Confidence: {(report.aiAnalysis.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Overall Score */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Overall Score</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${report.aiAnalysis.overallScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{report.aiAnalysis.overallScore}%</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Strengths & Concerns */}
                            <div className="grid gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsUp className="h-4 w-4 text-green-500" />
                                        <h4 className="text-sm font-medium">Strengths</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {report.aiAnalysis.strengths.map((strength, index) => (
                                            <li key={index} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsDown className="h-4 w-4 text-yellow-500" />
                                        <h4 className="text-sm font-medium">Areas of Concern</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {report.aiAnalysis.concerns.map((concern, index) => (
                                            <li key={index} className="text-sm flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                {concern}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Separator />

                            {/* Key Highlights */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Key Highlights</h4>
                                <div className="space-y-2">
                                    {report.aiAnalysis.keyHighlights.map((highlight, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "p-3 rounded-lg text-sm",
                                                highlight.type === 'positive'
                                                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                                    : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{highlight.point}</span>
                                                <span className="text-xs opacity-70">
                                                    {(highlight.confidence * 100).toFixed(0)}% confidence
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Resume Matches */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Resume Match Analysis</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <h5 className="text-sm font-medium">Matching Claims</h5>
                                        </div>
                                        <ul className="space-y-1">
                                            {report.aiAnalysis.resumeMatches.matching.map((match, index) => (
                                                <li key={index} className="text-sm text-muted-foreground">• {match}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {report.aiAnalysis.resumeMatches.discrepancies.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                <h5 className="text-sm font-medium">Discrepancies</h5>
                                            </div>
                                            <ul className="space-y-1">
                                                {report.aiAnalysis.resumeMatches.discrepancies.map((discrepancy, index) => (
                                                    <li key={index} className="text-sm text-muted-foreground">• {discrepancy}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InterviewReport; 