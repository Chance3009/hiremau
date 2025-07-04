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
    ChevronLeft,
    LoaderCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from "@/components/ui/page-header";
import { getCandidateEvaluation, fetchCandidateById } from '@/services/candidateService';

const InterviewReport: React.FC = () => {
    const navigate = useNavigate();
    const { id: candidateId } = useParams(); // Changed from reportId to candidateId
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [evaluationData, setEvaluationData] = useState<any>(null);
    const [candidateData, setCandidateData] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!candidateId) {
                setError('No candidate ID provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch both candidate and evaluation data
                const [candidate, evaluation] = await Promise.all([
                    fetchCandidateById(candidateId),
                    getCandidateEvaluation(candidateId)
                ]);

                setCandidateData(candidate);
                setEvaluationData(evaluation);

                console.log('Loaded candidate data:', candidate);
                console.log('Loaded evaluation data:', evaluation);

            } catch (err) {
                console.error('Error loading data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [candidateId]);

    // Helper function to parse comma-separated values
    const parseCommaSeparated = (value: string | null | undefined): string[] => {
        if (!value || typeof value !== 'string') return [];
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    };

    // Helper function to get recommendation color
    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation?.toLowerCase()) {
            case 'strong yes':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'interview':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'maybe':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'reject':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <PageHeader
                        title="Loading Interview Report..."
                        subtitle="Please wait"
                        className="gap-4"
                    >
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </PageHeader>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <LoaderCircle className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading evaluation data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <PageHeader
                        title="Error Loading Report"
                        subtitle={error}
                        className="gap-4"
                    >
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </PageHeader>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Failed to Load Report</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    const evaluation = evaluationData?.evaluation;
    const candidate = candidateData;

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <PageHeader
                    title={candidate?.name || 'Interview Report'}
                    subtitle={evaluation?.position_applied || candidate?.current_position || 'Position not specified'}
                    className="gap-4"
                >
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </PageHeader>
            </div>

            <div className="flex-1 space-y-4 p-4">
                <div className="grid gap-4">
                    {/* Evaluation Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Evaluation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {evaluation?.evaluation_date
                                            ? new Date(evaluation.evaluation_date).toLocaleDateString()
                                            : 'Date not specified'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Years of Experience: {evaluation?.years_of_experience || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Recommendation Badge */}
                            <div className="flex items-center gap-2">
                                <Badge className={getRecommendationColor(evaluation?.recommendation)}>
                                    {evaluation?.recommendation || 'Pending'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Resume Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {evaluation?.resume_summary || 'No resume summary available'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Technical Skills & Experience */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Technical Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.technical_skills || 'No technical skills assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Software Proficiency</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.software_proficiency || 'No software proficiency assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Industry Knowledge</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.industry_knowledge || 'No industry knowledge assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Technical Competency</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.technical_competency_assessment || 'No technical competency assessment'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strengths & Concerns */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Assessment Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsUp className="h-4 w-4 text-green-500" />
                                        <h4 className="text-sm font-medium">Strengths</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {parseCommaSeparated(evaluation?.strengths).map((strength, index) => (
                                            <li key={index} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                {strength}
                                            </li>
                                        ))}
                                        {parseCommaSeparated(evaluation?.standout_qualities).map((quality, index) => (
                                            <li key={index + 1000} className="text-sm flex items-start gap-2">
                                                <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                {quality}
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
                                        {parseCommaSeparated(evaluation?.weaknesses).map((weakness, index) => (
                                            <li key={index} className="text-sm flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                {weakness}
                                            </li>
                                        ))}
                                        {parseCommaSeparated(evaluation?.potential_concerns).map((concern, index) => (
                                            <li key={index + 1000} className="text-sm flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                                {concern}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Separator />

                            {/* Missing Skills & Gaps */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Skill Gaps</h4>
                                <div className="space-y-2">
                                    {parseCommaSeparated(evaluation?.missing_required_skills).map((skill, index) => (
                                        <div key={index} className="p-3 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Missing: {skill}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {parseCommaSeparated(evaluation?.transferable_skills).map((skill, index) => (
                                        <div key={index + 1000} className="p-3 rounded-lg text-sm bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Transferable: {skill}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Red Flags */}
                            {evaluation?.red_flags && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-red-600">Red Flags</h4>
                                    <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                        {evaluation.red_flags}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Assessments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Additional Assessments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Communication Assessment</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.communication_assessment || 'No communication assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Cultural Fit Indicators</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.cultural_fit_indicators || 'No cultural fit assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Growth Potential</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.growth_potential || 'No growth potential assessment'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Learning Curve Assessment</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.learning_curve_assessment || 'No learning curve assessment'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Final Recommendation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Final Recommendation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Recommendation</h4>
                                <Badge className={getRecommendationColor(evaluation?.recommendation)}>
                                    {evaluation?.recommendation || 'Pending'}
                                </Badge>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Reasoning</h4>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation?.recommendation_reasoning || 'No reasoning provided'}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2">Interview Focus Areas</h4>
                                <ul className="space-y-1">
                                    {parseCommaSeparated(evaluation?.interview_focus_areas).map((area, index) => (
                                        <li key={index} className="text-sm text-muted-foreground">• {area}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InterviewReport; 