import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Plus, ChevronRight, X, Check, LayoutGrid, List, Mail, Phone, Calendar, Building2, GraduationCap, Briefcase, Star, Eye, Brain, Sparkles, Target, LineChart, AlertCircle, Upload, ClipboardPaste, ArrowLeft, Download, Copy } from 'lucide-react';
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
    source: string;
    lastPosition: string;
    expectedSalary: string;
    availability: string;
    location: string;
    visaStatus: string;
    tags: string[];
    screeningNotes: string;
    aiAnalysis: AIAnalysis;
}

// Mock data with AI analysis
const mockCandidates: Candidate[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        position: 'Frontend Developer',
        summary: 'Experienced frontend developer with 5 years of React experience',
        fitScore: 85,
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: '5 years',
        education: 'B.S. Computer Science',
        email: 'alex.j@example.com',
        phone: '+1 234-567-8900',
        currentCompany: 'TechCorp Inc.',
        appliedDate: '2024-03-15',
        source: 'LinkedIn',
        lastPosition: 'Senior Frontend Developer',
        expectedSalary: '$120,000',
        availability: 'In 2 months',
        location: 'San Francisco, CA',
        visaStatus: 'Citizen',
        tags: ['Remote OK', 'Senior Level'],
        screeningNotes: 'Strong technical background, good communication skills',
        aiAnalysis: {
            overallMatch: 85,
            skillMatches: [
                { skill: 'React', score: 95, required: true, experience: '5 years' },
                { skill: 'TypeScript', score: 88, required: true, experience: '3 years' },
                { skill: 'Node.js', score: 75, required: false, experience: '2 years' }
            ],
            cultureFit: 90,
            growthPotential: 85,
            riskFactors: [
                {
                    type: 'retention',
                    severity: 'low',
                    description: 'Multiple long-term positions in past roles'
                }
            ],
            insights: [
                {
                    type: 'strength',
                    description: 'Strong expertise in modern frontend technologies'
                },
                {
                    type: 'opportunity',
                    description: 'Potential for technical leadership role'
                }
            ],
            recommendedRole: 'Senior Frontend Developer',
            similarRoles: ['Frontend Tech Lead', 'Full Stack Developer'],
            learningPath: [
                {
                    skill: 'System Design',
                    priority: 'high',
                    estimatedTimeToAcquire: '3 months'
                }
            ]
        }
    },
    // Add more mock candidates...
];

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

const CandidateCard = ({ candidate, onMove, detailLevel }) => {
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
                    <div className="text-right space-y-1">
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
                        <Badge variant="secondary">{candidate.source}</Badge>
                    </div>
                </div>

                {renderDetails()}

                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onMove(candidate.id, 'reject')}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onMove(candidate.id, 'shortlist')}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Shortlist
                        </Button>
                    </div>
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

const CandidateList = ({ candidates, onMove, detailLevel }) => {
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
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
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
                                            onMove={onMove}
                                            detailLevel={detailLevel}
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
                                <Badge variant="secondary">{candidate.source}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">New</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onMove(candidate.id, 'reject')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onMove(candidate.id, 'shortlist')}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
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

    const handleCopyLink = () => {
        // In a real app, this would copy the registration link
        toast({
            title: "Link Copied",
            description: "Registration link copied to clipboard",
        });
    };

    const handleDownloadQR = () => {
        // In a real app, this would download the QR code image
        toast({
            title: "QR Code Downloaded",
            description: "QR code image saved to your device",
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Candidate
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-2">
                    <DialogTitle>Register New Candidate</DialogTitle>
                    <Tabs value={mode} onValueChange={(value) => setMode(value as 'form' | 'qr')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">
                                <Mail className="h-4 w-4 mr-2" />
                                Manual Form
                            </TabsTrigger>
                            <TabsTrigger value="qr">
                                <QrCode className="h-4 w-4 mr-2" />
                                QR Code
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2">
                    {mode === 'qr' ? (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <Label className="text-sm">Event (Optional)</Label>
                                <Select value={selectedEvent || undefined} onValueChange={setSelectedEvent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select event or leave empty for general application" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Application</SelectItem>
                                        <SelectItem value="tech-meetup">Tech Meetup 2024</SelectItem>
                                        <SelectItem value="career-fair">Career Fair 2024</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Select an event to generate a specific QR code for that event, or leave empty for a general application
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="h-64 w-64 border rounded-md flex items-center justify-center bg-muted/50">
                                    {selectedEvent ? (
                                        <div className="text-center p-4">
                                            <QrCode className="h-40 w-40 mx-auto mb-2" />
                                            <p className="text-sm font-medium">
                                                {selectedEvent === 'general' ? 'General Application' : selectedEvent}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <p className="text-sm text-muted-foreground">Select an event to generate a QR code</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Quick Application Process</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Scan QR code with your phone</li>
                                            <li>• Fill out the mobile-friendly form</li>
                                            <li>• Submit your application instantly</li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={!selectedEvent}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link
                                        </Button>
                                        <Button size="sm" onClick={handleDownloadQR} disabled={!selectedEvent}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download QR
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CandidateIntakeForm />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const AppliedCandidates = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date');
    const [filterSource, setFilterSource] = useState('all');
    const [detailLevel, setDetailLevel] = useState<DetailLevel>('minimal');
    const navigate = useNavigate();

    const handleMoveCandidate = (candidateId: string, status: 'reject' | 'shortlist') => {
        // Implement the logic to move candidates between stages
        console.log(`Moving candidate ${candidateId} to ${status}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Applied Candidates</h2>
                    <p className="text-sm text-muted-foreground">Review and process new applications</p>
                </div>
                <RegisterDialog />
            </div>

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
                    <div className="w-[200px]">
                        <Label htmlFor="source">Source</Label>
                        <Select value={filterSource} onValueChange={setFilterSource}>
                            <SelectTrigger id="source">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[200px]">
                        <Label htmlFor="details">Detail Level</Label>
                        <Select value={detailLevel} onValueChange={(value: DetailLevel) => setDetailLevel(value)}>
                            <SelectTrigger id="details">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minimal">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        <span>Minimal</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="standard">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        <span>Standard</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="detailed">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        <span>Detailed</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
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
                    {mockCandidates.map(candidate => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onMove={handleMoveCandidate}
                            detailLevel={detailLevel}
                        />
                    ))}
                </div>
            ) : (
                <CandidateList
                    candidates={mockCandidates}
                    onMove={handleMoveCandidate}
                    detailLevel={detailLevel}
                />
            )}
        </div>
    );
};

export default AppliedCandidates; 