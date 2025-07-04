import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Star, Mail, Phone, Building2, Calendar, LayoutGrid, List, Check, X, ChevronRight, RefreshCw, Download, Users, TrendingUp, Award, Clock, MapPin, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { performCandidateAction } from '@/services/candidateService';
import { getCurrentStage, getStageLabel, getStageColor, getAvailableActions, getActionLabel } from '@/lib/workflow';
import type { WorkflowAction } from '@/lib/workflow';
import { toast } from '@/components/ui/use-toast';

// Enhanced candidate interface for shortlisted stage
interface ShortlistedCandidate {
    id: string;
    name: string;
    position: string;
    matchScore: number;
    currentCompany: string;
    email: string;
    phone: string;
    interviewScore: number;
    shortlistedDate: string;
    status: string;
    skills: string[];
    experience: string;
    education: string;
    expectedSalary: string;
    location: string;
    availability: string;
    finalInterviewDate?: string;
    offerStatus?: 'pending' | 'sent' | 'negotiating' | 'accepted' | 'declined';
    decisionDeadline?: string;
    summary: string;
    cultureFit: number;
    technicalScore: number;
    overallRating: number;
    references: Array<{
        name: string;
        company: string;
        relationship: string;
        contactStatus: 'pending' | 'contacted' | 'received';
    }>;
}

const CandidateCard = ({ candidate, onAction, isSelected, onSelect }: {
    candidate: ShortlistedCandidate,
    onAction: (id: string, action: WorkflowAction) => void,
    isSelected?: boolean,
    onSelect?: (id: string) => void
}) => {
    const navigate = useNavigate();

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getOfferStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'negotiating': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'declined': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Card className="relative hover:shadow-md transition-shadow">
            {onSelect && (
                <div className="absolute top-4 right-4 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(candidate.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{candidate.name}</h3>
                            <p className="text-muted-foreground">{candidate.position}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>{candidate.currentCompany}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <Badge
                                variant="outline"
                                className={candidate.offerStatus ? getOfferStatusColor(candidate.offerStatus) : ''}
                            >
                                {candidate.offerStatus ? candidate.offerStatus.replace('-', ' ') : 'Ready for Offer'}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{candidate.overallRating}/5</span>
                            </div>
                        </div>
                    </div>

                    {/* Score metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Brain className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground">AI Match</span>
                            </div>
                            <div className={cn("text-lg font-bold", getScoreColor(candidate.matchScore))}>
                                {candidate.matchScore}%
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">Interview</span>
                            </div>
                            <div className={cn("text-lg font-bold", getScoreColor(candidate.interviewScore))}>
                                {candidate.interviewScore}%
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">Culture</span>
                            </div>
                            <div className={cn("text-lg font-bold", getScoreColor(candidate.cultureFit))}>
                                {candidate.cultureFit}%
                            </div>
                        </div>
                    </div>

                    {/* Contact information */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${candidate.email}`} className="hover:text-primary truncate">
                                    {candidate.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{candidate.phone}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{candidate.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span>{candidate.expectedSalary}</span>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 4).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 4} more
                            </Badge>
                        )}
                    </div>

                    {/* Decision deadline warning */}
                    {candidate.decisionDeadline && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Decision deadline: {candidate.decisionDeadline}</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex gap-2">
                            {getAvailableActions(getCurrentStage(candidate)).map((action) => (
                                <Button
                                    key={action}
                                    size="sm"
                                    variant={action === 'reject' ? 'destructive' : 'default'}
                                    onClick={() => onAction(candidate.id, action)}
                                >
                                    {action === 'make-offer' && <Check className="h-4 w-4 mr-1" />}
                                    {action === 'reject' && <X className="h-4 w-4 mr-1" />}
                                    {getActionLabel(action)}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Shortlisted: {candidate.shortlistedDate}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ShortlistedCandidates = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('overallRating');
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'offered' | 'negotiating'>('all');

    // Use the new filtering hook for shortlisted candidates
    const {
        candidates,
        loading,
        error,
        refresh: refreshCandidates,
        activeFilters
    } = useCandidateFiltering({
        additionalFilters: { stage: 'shortlisted' },
        autoRefresh: false
    });

    const handleCandidateAction = async (candidateId: string, action: WorkflowAction) => {
        try {
            await performCandidateAction(candidateId, action, 'user', `Performed action: ${action}`);
            refreshCandidates();
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

    const handleBulkAction = async () => {
        if (!bulkAction || selectedCandidates.length === 0) return;

        try {
            await Promise.all(
                selectedCandidates.map(candidateId =>
                    performCandidateAction(candidateId, bulkAction as WorkflowAction, 'user', `Bulk action: ${bulkAction}`)
                )
            );
            toast({
                title: "Success",
                description: `${selectedCandidates.length} candidate(s) ${getActionLabel(bulkAction as WorkflowAction).toLowerCase()} successfully`,
            });
            setSelectedCandidates([]);
            setBulkAction('');
            refreshCandidates();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to perform bulk action",
                variant: "destructive",
            });
        }
    };

    const handleSelectCandidate = (candidateId: string) => {
        setSelectedCandidates(prev =>
            prev.includes(candidateId)
                ? prev.filter(id => id !== candidateId)
                : [...prev, candidateId]
        );
    };

    const handleSelectAll = () => {
        if (selectedCandidates.length === candidates.length) {
            setSelectedCandidates([]);
        } else {
            setSelectedCandidates(candidates.map(c => c.id));
        }
    };

    // Filter candidates based on offer status
    const filteredCandidates = candidates.filter(candidate => {
        if (filterStatus === 'all') return true;
        return candidate.offerStatus === filterStatus ||
            (filterStatus === 'pending' && !candidate.offerStatus);
    });

    // Sort candidates
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        switch (sortBy) {
            case 'overallRating':
                return b.overallRating - a.overallRating;
            case 'matchScore':
                return b.matchScore - a.matchScore;
            case 'interviewScore':
                return b.interviewScore - a.interviewScore;
            case 'shortlistedDate':
                return new Date(b.shortlistedDate).getTime() - new Date(a.shortlistedDate).getTime();
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Shortlisted Candidates"
                subtitle={`Final review and offer management ${activeFilters.positionId
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
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button onClick={() => navigate('/final-review')}>
                        <Users className="h-4 w-4 mr-2" />
                        Final Review
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Shortlisted</p>
                                <p className="text-2xl font-bold">{candidates.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Offers</p>
                                <p className="text-2xl font-bold">
                                    {candidates.filter(c => !c.offerStatus || c.offerStatus === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Offers Sent</p>
                                <p className="text-2xl font-bold">
                                    {candidates.filter(c => c.offerStatus === 'sent' || c.offerStatus === 'negotiating').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                                <p className="text-2xl font-bold">
                                    {candidates.length > 0
                                        ? (candidates.reduce((sum, c) => sum + c.overallRating, 0) / candidates.length).toFixed(1)
                                        : '0.0'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Actions Bar */}
            {selectedCandidates.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                    {selectedCandidates.length} candidate(s) selected
                                </span>
                                <Select value={bulkAction} onValueChange={setBulkAction}>
                                    <SelectTrigger className="w-[200px] bg-white">
                                        <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="make-offer">Send Offers</SelectItem>
                                        <SelectItem value="reject">Reject All</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    size="sm"
                                >
                                    Apply Action
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCandidates([])}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="select-all"
                            checked={selectedCandidates.length === sortedCandidates.length && sortedCandidates.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="select-all" className="text-sm">
                            Select All ({sortedCandidates.length})
                        </Label>
                    </div>
                    <div className="w-[160px]">
                        <Label htmlFor="filter">Filter Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger id="filter">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Candidates</SelectItem>
                                <SelectItem value="pending">Pending Offers</SelectItem>
                                <SelectItem value="offered">Offers Sent</SelectItem>
                                <SelectItem value="negotiating">Negotiating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[160px]">
                        <Label htmlFor="sort">Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger id="sort">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="overallRating">Overall Rating</SelectItem>
                                <SelectItem value="matchScore">AI Match Score</SelectItem>
                                <SelectItem value="interviewScore">Interview Score</SelectItem>
                                <SelectItem value="shortlistedDate">Shortlisted Date</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
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

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading candidates...</span>
                </div>
            )}

            {/* Error state */}
            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={refreshCandidates} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && sortedCandidates.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">
                                {filterStatus !== 'all'
                                    ? `No candidates found with ${filterStatus} offer status.`
                                    : activeFilters.positionId
                                        ? 'No shortlisted candidates found for the selected position.'
                                        : 'No shortlisted candidates found. Move candidates from final review to get started.'
                                }
                            </p>
                            <Button onClick={() => navigate('/final-review')} variant="outline">
                                View Final Review
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Candidates grid/list */}
            {!loading && !error && sortedCandidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCandidates.map(candidate => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onAction={handleCandidateAction}
                            isSelected={selectedCandidates.includes(candidate.id)}
                            onSelect={handleSelectCandidate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShortlistedCandidates; 