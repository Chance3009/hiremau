import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Plus, ChevronRight, X, Check, LayoutGrid, List, Mail, Phone, Calendar, Building2, GraduationCap, Briefcase, Star, Eye, Brain, Sparkles, Target, LineChart, AlertCircle, Upload, ClipboardPaste, ArrowLeft, Download, Copy, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { createCandidate, updateCandidate, deleteCandidate, performCandidateAction } from '@/services/candidateService';
import { getCurrentStage, getStageLabel, getStageColor, getAvailableActions, getActionLabel } from '@/lib/workflow';
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import type { WorkflowAction } from '@/lib/workflow';

// Enhanced mock data with AI analysis fields
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
}

type DetailLevel = 'minimal' | 'standard' | 'detailed';

const AIInsightCard = ({ analysis, detailLevel }: { analysis: AIAnalysis; detailLevel: DetailLevel }) => {
    // Helper function to get AI summary
    const getAISummary = () => {
        const strengths = analysis.insights.filter(i => i.type === 'strength');
        const opportunities = analysis.insights.filter(i => i.type === 'opportunity');
        return `${strengths[0]?.description || ''}. ${opportunities[0]?.description || ''}`;
    };

    if (detailLevel === 'minimal') {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Match</h3>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm font-semibold text-primary">{analysis.overallMatch}%</span>
                    </div>
                    <Progress value={analysis.overallMatch} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{getAISummary()}</p>
                </div>
            </div>
        );
    }

    if (detailLevel === 'standard') {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Analysis</h3>
                </div>

                <div className="space-y-4">
                    {/* Overall Match */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Match</span>
                            <span className="text-sm font-semibold text-primary">{analysis.overallMatch}%</span>
                        </div>
                        <Progress value={analysis.overallMatch} className="h-2" />
                    </div>

                    {/* Culture & Growth */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Culture Fit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={analysis.cultureFit} className="h-2" />
                                <span className="text-sm font-medium">{analysis.cultureFit}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <LineChart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Growth Potential</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={analysis.growthPotential} className="h-2" />
                                <span className="text-sm font-medium">{analysis.growthPotential}%</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                        <div className="space-y-2">
                            {analysis.insights.map((insight, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">{insight.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Factors */}
                    {analysis.riskFactors.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Potential Concerns</h4>
                            <div className="space-y-2">
                                {analysis.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${risk.severity === 'high' ? 'text-destructive' :
                                            risk.severity === 'medium' ? 'text-yellow-500' :
                                                'text-muted-foreground'
                                            }`} />
                                        <span className="text-sm">{risk.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detailed view
    return (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Detailed Skills Analysis</h3>
            </div>

            <div className="space-y-4">
                {/* Overall Match */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm font-semibold text-primary">{analysis.overallMatch}%</span>
                    </div>
                    <Progress value={analysis.overallMatch} className="h-2" />
                </div>

                {/* Detailed Skill Matches */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Skills Breakdown</h4>
                    <div className="space-y-3">
                        {analysis.skillMatches.map((skill) => (
                            <div key={skill.skill} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{skill.skill}</span>
                                        {skill.required && (
                                            <Badge variant="secondary" className="text-xs">Required</Badge>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{skill.score}%</span>
                                </div>
                                <Progress value={skill.score} className="h-1.5" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{skill.experience} experience</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Development Areas */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Recommended Development</h4>
                    <div className="space-y-2">
                        {analysis.learningPath.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-sm font-medium">{item.skill}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{item.priority} priority</Badge>
                                        <span className="text-xs text-muted-foreground">Est. {item.estimatedTimeToAcquire}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
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
                    {candidate.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                </div>

                <AIInsightCard analysis={candidate.aiAnalysis} detailLevel={detailLevel} />
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
                                        <span className="text-2xl font-bold text-primary">{candidate.aiAnalysis.overallMatch}%</span>
                                        <Brain className="h-5 w-5 text-primary" />
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
                        <CandidateIntakeForm onSubmit={(data) => {
                            console.log('Form submitted:', data);
                            toast({
                                title: "Candidate registered",
                                description: "The candidate has been successfully registered.",
                            });
                        }} />
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
            await performCandidateAction(candidateId, action, 'user', `Performed action: ${action}`);

            // Refresh the candidates list using the hook
            refreshCandidates();

            // Show success message
            toast({
                title: "Action Completed",
                description: `Successfully performed action: ${getActionLabel(action)}`,
            });
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