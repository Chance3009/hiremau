import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    GraduationCap,
    Briefcase,
    Calendar,
    Star,
    Brain,
    Target,
    LineChart,
    Sparkles,
    AlertCircle,
    Check,
    X,
    ChevronRight,
    MessageSquare,
    Filter,
    Search,
    Download,
    MoreHorizontal,
    QrCode,
    Plus,
    LayoutGrid,
    List,
    Eye,
    Upload,
    ClipboardPaste,
    ArrowLeft,
    Copy
} from 'lucide-react';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';
import { toast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { createCandidate, updateCandidate, deleteCandidate, performCandidateAction } from '@/services/candidateService';
import { getCurrentStage, getStageLabel, getStageColor, getAvailableActions, getActionLabel } from '@/lib/workflow';
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { getCandidateEvaluation, getMockEvaluationData } from '@/services/evaluationService';
import type { WorkflowAction } from '@/lib/workflow';

// Interface for the evaluation data from initial_screening_evaluation table
interface EvaluationData {
    id: string;
    candidate_id: string;
    candidate_name: string;
    position_applied: string;
    evaluation_date: string;
    resume_summary: string;
    years_of_experience: number;
    education_background: string;
    career_progression: string;
    technical_skills: string;
    software_proficiency: string;
    industry_knowledge: string;
    soft_skills_claimed: string;
    certifications: string;
    technical_competency_assessment: string;
    experience_relevance: string;
    communication_assessment: string;
    standout_qualities: string;
    potential_concerns: string;
    strengths: string;
    weaknesses: string;
    red_flags: string;
    growth_potential: string;
    cultural_fit_indicators: string;
    missing_required_skills: string;
    transferable_skills: string;
    learning_curve_assessment: string;
    recommendation: 'Reject' | 'Maybe' | 'Interview' | 'Strong Yes';
    recommendation_reasoning: string;
    interview_focus_areas: string;
    created_at: string;
    updated_at: string;
}

interface SkillMatch {
    skill: string;
    score: number;
    required: boolean;
    experience: string;
}

interface AIAnalysis {
    overallMatch: number;
    skillMatches: SkillMatch[];
    cultureFit: number;
    growthPotential: number;
    riskFactors: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }>;
    insights: Array<{
        type: 'strength' | 'weakness' | 'opportunity';
        description: string;
    }>;
    recommendedRole: string;
    similarRoles: string[];
    learningPath: Array<{
        skill: string;
        priority: 'high' | 'medium' | 'low';
        estimatedTimeToAcquire: string;
    }>;
}

interface Candidate {
    id: string;
    name: string;
    position: string;
    summary: string;
    fitScore: number;
    skills: string[];
    experience: string;
    education: string;
    email: string;
    phone: string;
    currentCompany: string;
    appliedDate: string;
    lastPosition: string;
    expectedSalary: string;
    availability: string;
    location: string;
    visaStatus: string;
    tags: string[];
    screeningNotes: string;
    aiAnalysis: AIAnalysis;
    evaluationData?: EvaluationData; // Add the evaluation data
}

type DetailLevel = 'minimal' | 'standard' | 'detailed';

const AIInsightCard = ({ analysis, evaluationData, detailLevel, candidateId, candidateName }: {
    analysis?: AIAnalysis;
    evaluationData?: EvaluationData;
    detailLevel: DetailLevel;
    candidateId?: string;
    candidateName?: string;
}) => {
    const [realEvaluationData, setRealEvaluationData] = useState<EvaluationData | null>(null);
    const [loading, setLoading] = useState(false);

    // Use evaluation data if provided, otherwise try to fetch it
    useEffect(() => {
        if (!evaluationData && candidateId) {
            fetchEvaluationData();
        }
    }, [evaluationData, candidateId]);

    const fetchEvaluationData = async () => {
        if (!candidateId) return;

        try {
            setLoading(true);
            // Try to get real evaluation data
            const evaluation = await getCandidateEvaluation(candidateId);

            if (evaluation) {
                setRealEvaluationData(evaluation);
            } else {
                // Use mock data for demonstration
                setRealEvaluationData(getMockEvaluationData(candidateId, candidateName || 'Unknown Candidate'));
            }
        } catch (error) {
            console.error('Error fetching evaluation data:', error);
            // Use mock data as fallback
            setRealEvaluationData(getMockEvaluationData(candidateId, candidateName || 'Unknown Candidate'));
        } finally {
            setLoading(false);
        }
    };

    // Use the evaluation data we have (either passed in or fetched)
    const currentEvaluationData = evaluationData || realEvaluationData;
    const hasEvaluationData = currentEvaluationData && currentEvaluationData.recommendation;
    const hasAnalysisData = analysis && analysis.overallMatch;

    // If no data is available and we're not loading, show loading state
    if (!hasEvaluationData && !hasAnalysisData && !loading) {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-muted-foreground">AI Evaluation</h3>
                </div>
                <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Evaluation in progress...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-muted-foreground animate-pulse" />
                    <h3 className="font-semibold text-muted-foreground">AI Evaluation</h3>
                </div>
                <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Loading evaluation...</p>
                </div>
            </div>
        );
    }

    // Helper function to get recommendation score
    const getRecommendationScore = (recommendation: string) => {
        switch (recommendation) {
            case 'Strong Yes': return 90;
            case 'Interview': return 75;
            case 'Maybe': return 50;
            case 'Reject': return 25;
            default: return 0;
        }
    };

    // Helper function to get recommendation color
    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'Strong Yes': return 'text-green-600';
            case 'Interview': return 'text-blue-600';
            case 'Maybe': return 'text-yellow-600';
            case 'Reject': return 'text-red-600';
            default: return 'text-muted-foreground';
        }
    };

    // If we have evaluation data, use it; otherwise fall back to analysis
    if (hasEvaluationData) {
        const score = getRecommendationScore(currentEvaluationData.recommendation);

        return (
            <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">AI Evaluation</h3>
                    </div>
                    <Badge className={`${getRecommendationColor(currentEvaluationData.recommendation)} border-0`}>
                        {currentEvaluationData.recommendation}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm font-medium">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                    </div>

                    {detailLevel !== 'minimal' && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium mb-1">Resume Summary</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {currentEvaluationData.resume_summary}
                                </p>
                            </div>

                            {detailLevel === 'detailed' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="font-medium">Experience:</span>
                                            <span className="ml-1">{currentEvaluationData.years_of_experience} years</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Education:</span>
                                            <span className="ml-1 line-clamp-1">{currentEvaluationData.education_background}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Key Strengths</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {currentEvaluationData.strengths}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Interview Focus</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {currentEvaluationData.interview_focus_areas}
                                        </p>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Fallback to analysis data if available
    if (hasAnalysisData) {
        return (
            <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">AI Analysis</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Match</span>
                            <span className="text-sm font-medium">{analysis.overallMatch}%</span>
                        </div>
                        <Progress value={analysis.overallMatch} className="h-2" />
                    </div>

                    {detailLevel !== 'minimal' && (
                        <>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium">Culture Fit:</span>
                                    <span className="ml-1">{analysis.cultureFit}%</span>
                                </div>
                                <div>
                                    <span className="font-medium">Growth Potential:</span>
                                    <span className="ml-1">{analysis.growthPotential}%</span>
                                </div>
                            </div>

                            {detailLevel === 'detailed' && (
                                <>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Top Skills</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {analysis.skillMatches.slice(0, 3).map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {skill.skill} ({skill.score}%)
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Key Insights</h4>
                                        <div className="space-y-1">
                                            {analysis.insights.slice(0, 2).map((insight, idx) => (
                                                <p key={idx} className="text-xs text-muted-foreground">
                                                    • {insight.description}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Should not reach here, but just in case
    return null;
};

const CandidateCard = ({ candidate, onAction, detailLevel }) => {
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();

    const renderDetails = () => {
        const basicInfo = (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{candidate.currentCompany}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{candidate.experience}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>{candidate.education}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Applied: {candidate.appliedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {candidate.skills?.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                </div>

                <AIInsightCard
                    analysis={candidate.aiAnalysis}
                    evaluationData={candidate.evaluationData}
                    detailLevel={detailLevel}
                    candidateId={candidate.id}
                    candidateName={candidate.name}
                />
            </div>
        );

        const standardInfo = detailLevel === 'standard' && (
            <div className="border-t pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Expected Salary:</span>
                        <p>{candidate.expectedSalary}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Availability:</span>
                        <p>{candidate.availability}</p>
                    </div>
                </div>
            </div>
        );

        const detailedInfo = detailLevel === 'detailed' && (
            <div className="border-t pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Expected Salary:</span>
                        <p>{candidate.expectedSalary}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Availability:</span>
                        <p>{candidate.availability}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p>{candidate.location}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Visa Status:</span>
                        <p>{candidate.visaStatus}</p>
                    </div>
                </div>
                <div>
                    <span className="text-muted-foreground">Screening Notes:</span>
                    <p className="mt-1">{candidate.screeningNotes}</p>
                </div>
            </div>
        );

        return (
            <>
                {basicInfo}
                {standardInfo}
                {detailedInfo}
            </>
        );
    };

    return (
        <Card className="relative hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-muted-foreground">{candidate.position}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${candidate.email}`} className="hover:text-primary">{candidate.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{candidate.phone}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center gap-2 justify-end">
                                        {candidate.aiAnalysis ? (
                                            <>
                                                <span className="text-2xl font-bold text-primary">{candidate.aiAnalysis.overallMatch}%</span>
                                                <Brain className="h-5 w-5 text-primary" />
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No AI analysis yet</span>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>AI Match Score</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {renderDetails()}

                <div className="flex justify-between items-center mt-4">
                    {onAction && (
                        <div className="flex gap-2">
                            {getAvailableActions(getCurrentStage(candidate)).map((action) => (
                                <Button
                                    key={action}
                                    size="sm"
                                    variant={action === 'reject' ? 'destructive' : 'default'}
                                    onClick={() => onAction(candidate.id, action)}
                                >
                                    {action === 'shortlist' && <Check className="h-4 w-4 mr-1" />}
                                    {action === 'reject' && <X className="h-4 w-4 mr-1" />}
                                    {action === 'start-interview' && <MessageSquare className="h-4 w-4 mr-1" />}
                                    {getActionLabel(action)}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/candidate/${candidate.id}`)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const CandidateList = ({ candidates, onAction }) => {
    const navigate = useNavigate();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Fit Score</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow
                            key={candidate.id}
                            className="group relative"
                        >
                            <TableCell className="relative">
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <div className="cursor-pointer group-hover:text-primary transition-colors">
                                            <div className="font-medium">{candidate.name}</div>
                                            <div className="text-sm text-muted-foreground group-hover:text-primary/80">{candidate.email}</div>
                                            {/* Invisible extended hit area */}
                                            <div className="absolute inset-0" />
                                        </div>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                        side="right"
                                        align="start"
                                        className="w-[400px] shadow-lg"
                                        sideOffset={-50}
                                    >
                                        <CandidateCard
                                            candidate={candidate}
                                            onAction={onAction}
                                            detailLevel="standard"
                                        />
                                    </HoverCardContent>
                                </HoverCard>
                            </TableCell>
                            <TableCell>{candidate.position}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{candidate.fitScore}%</span>
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </div>
                            </TableCell>
                            <TableCell>{candidate.experience}</TableCell>
                            <TableCell>{candidate.appliedDate}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getStageColor(getCurrentStage(candidate))}>
                                    {getStageLabel(getCurrentStage(candidate))}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {onAction && getAvailableActions(getCurrentStage(candidate)).slice(0, 2).map((action) => (
                                        <Button
                                            key={action}
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onAction(candidate.id, action)}
                                        >
                                            {action === 'shortlist' && <Check className="h-4 w-4" />}
                                            {action === 'reject' && <X className="h-4 w-4" />}
                                            {action === 'start-interview' && <MessageSquare className="h-4 w-4" />}
                                        </Button>
                                    ))}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => navigate(`/candidate/${candidate.id}`)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const RegisterDialog = () => {
    const [mode, setMode] = useState<'form' | 'qr'>('form');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            console.log('Form submitted:', formData);

            // Log FormData entries for debugging
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Create candidate with file uploads
            const result = await createCandidate(formData);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Candidate registered successfully",
                });
                // Refresh the page or trigger a re-fetch
                window.location.reload();
            } else {
                throw new Error(result.message || 'Failed to register candidate');
            }
        } catch (error) {
            console.error('Error registering candidate:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to register candidate",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Register New Candidate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <Label>Registration Mode</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={mode === 'form' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMode('form')}
                                >
                                    Manual Form
                                </Button>
                                <Button
                                    variant={mode === 'qr' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMode('qr')}
                                >
                                    QR Code
                                </Button>
                            </div>
                        </div>
                        <div className="w-[200px]">
                            <Label>Event</Label>
                            <Select value={selectedEvent || ''} onValueChange={setSelectedEvent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event1">UPM Career Fair 2025</SelectItem>
                                    <SelectItem value="event2">Tech Meetup March</SelectItem>
                                    <SelectItem value="event3">Virtual Job Fair</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {mode === 'qr' ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 border-2 border-dashed rounded-lg">
                            <QrCode className="h-16 w-16 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium">Scan QR Code</p>
                                <p className="text-sm text-muted-foreground">
                                    Point your camera at the QR code to register
                                </p>
                            </div>
                        </div>
                    ) : (
                        <CandidateIntakeForm
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const AppliedCandidates = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date');
    const [detailLevel, setDetailLevel] = useState<DetailLevel>('minimal');
    const navigate = useNavigate();
    const { activePositionId } = useRecruitment();

    // Use the new filtering hook for global position filtering
    const {
        candidates,
        loading,
        error,
        refresh: refreshCandidates,
        activeFilters
    } = useCandidateFiltering({
        additionalFilters: { stage: 'applied' },
        autoRefresh: false // Disable auto-refresh to prevent continuous calls
    });

    const handleCandidateAction = async (candidateId: string, action: WorkflowAction) => {
        try {
            // Call the backend API to perform the action
            await performCandidateAction(candidateId, action, {
                performed_by: 'user',
                notes: `Performed action: ${action}`
            });

            // Show success message
            toast({
                title: "Action Completed",
                description: `Successfully performed action: ${getActionLabel(action)}`,
            });

            // Navigate to appropriate page based on action
            if (action === 'shortlist') {
                // Navigate to screening page
                navigate('/screened');
            } else if (action === 'schedule-interview') {
                // Navigate to interview scheduling
                navigate('/interviews/schedule');
            } else {
                // Refresh the current page for other actions
                window.location.reload();
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || `Failed to perform action: ${action}`,
                variant: "destructive",
            });
        }
    };

    const handleDeleteCandidate = async (candidateId: string) => {
        try {
            await deleteCandidate(candidateId);
            refreshCandidates();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || 'Failed to delete candidate',
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Applied Candidates"
                subtitle={`Review and process new applications ${activeFilters.positionId
                    ? `• Filtered by selected position`
                    : '• Showing all positions'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Button
                        onClick={refreshCandidates}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <RegisterDialog />
                </div>
            </PageHeader>

            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-4">
                    <div className="w-[200px]">
                        <Label htmlFor="sort">Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger id="sort">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Application Date</SelectItem>
                                <SelectItem value="score">Fit Score</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[300px]">
                        <Label>Detail Level</Label>
                        <div className="flex items-center gap-1 mt-2 p-1 bg-muted rounded-lg">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "flex-1 h-8",
                                    detailLevel === "minimal" && "bg-background shadow-sm"
                                )}
                                onClick={() => setDetailLevel("minimal")}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Minimal
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "flex-1 h-8",
                                    detailLevel === "standard" && "bg-background shadow-sm"
                                )}
                                onClick={() => setDetailLevel("standard")}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Standard
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "flex-1 h-8",
                                    detailLevel === "detailed" && "bg-background shadow-sm"
                                )}
                                onClick={() => setDetailLevel("detailed")}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Detailed
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Grid
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4 mr-2" />
                        List
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map(candidate => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            variant="full"
                            onAction={handleCandidateAction}
                        />
                    ))}
                </div>
            ) : (
                <CandidateList
                    candidates={candidates}
                    onAction={handleCandidateAction}
                />
            )}
        </div>
    );
};

export default AppliedCandidates; 