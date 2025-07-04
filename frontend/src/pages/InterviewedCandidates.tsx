import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChevronRight, Download, RefreshCw, VideoIcon, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { performCandidateAction } from '@/services/candidateService';
import { toast } from '@/components/ui/use-toast';
import { getActionLabel } from '@/lib/workflow';

const InterviewedCandidates = () => {
    const navigate = useNavigate();
    const { activePositionId } = useRecruitment();
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');

    // Use the new filtering hook for global position filtering
    const {
        candidates,
        loading,
        error,
        refresh: refreshCandidates,
        activeFilters
    } = useCandidateFiltering({
        additionalFilters: { stage: 'interview' },
        autoRefresh: false // Disable auto-refresh to prevent continuous calls
    });

    const handleCandidateAction = async (candidateId: string, action: string) => {
        try {
            await performCandidateAction(candidateId, action, {
                performed_by: 'user',
                notes: `Performed action: ${action}`
            });

            toast({
                title: "Action Completed",
                description: `Successfully performed action: ${getActionLabel(action)}`,
            });

            // Navigate based on action
            if (action === 'move_to_final') {
                navigate('/final-review');
            } else {
                refreshCandidates();
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || `Failed to perform action: ${action}`,
                variant: "destructive",
            });
        }
    };

    const startInterview = (candidateId: string) => {
        navigate(`/interview/${candidateId}`);
    };

    const markAsInterviewed = async (candidateId: string) => {
        try {
            // For now, we'll move them to final review since there's no "interviewed" stage
            await handleCandidateAction(candidateId, 'move_to_final');
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || 'Failed to mark as interviewed',
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Interview Scheduled"
                subtitle={`Candidates scheduled for interviews and ready to be interviewed ${activeFilters.positionId
                    ? `• Filtered by position`
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
                    <Button onClick={() => navigate('/interviews/schedule')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                    </Button>
                </div>
            </PageHeader>

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
            {!loading && !error && candidates.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">
                                {activeFilters.positionId
                                    ? 'No candidates scheduled for interviews for the selected position.'
                                    : 'No candidates scheduled for interviews. Schedule interviews from the screened candidates page.'
                                }
                            </p>
                            <Button onClick={() => navigate('/screened')} variant="outline">
                                View Screened Candidates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Candidates list */}
            {!loading && !error && candidates.length > 0 && (
                <div className="grid gap-4">
                    {candidates.map((candidate) => {
                        // Extract evaluation data
                        const evaluationData = candidate?.evaluationData || candidate?.evaluation_data;
                        const hasEvaluation = evaluationData && Array.isArray(evaluationData) && evaluationData.length > 0;
                        const evaluation = hasEvaluation ? evaluationData[0] : null;
                        
                        // Format additional information
                        const formatExperience = () => {
                            if (candidate.years_experience) {
                                return `${candidate.years_experience} years`;
                            }
                            return candidate.experience || 'Not specified';
                        };
                        
                        const formatSalary = () => {
                            if (candidate.formatted_salary) {
                                return candidate.formatted_salary;
                            }
                            if (candidate.salary_expectations) {
                                return `RM ${candidate.salary_expectations.toLocaleString()}`;
                            }
                            return null;
                        };
                        
                        return (
                            <Card key={candidate.id} className="cursor-pointer hover:bg-accent/5">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-lg truncate">{candidate.name}</CardTitle>
                                                <Badge variant="secondary">Interview Scheduled</Badge>
                                                {evaluation?.recommendation && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {evaluation.recommendation}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {candidate.current_position || candidate.position || 'Position not specified'}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                <span>{formatExperience()}</span>
                                                {formatSalary() && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{formatSalary()}</span>
                                                    </>
                                                )}
                                                {candidate.education && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{candidate.education}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Contact Information */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground">{candidate.email}</span>
                                                {candidate.formatted_phone && (
                                                    <span className="text-muted-foreground">{candidate.formatted_phone}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Skills */}
                                        {candidate.skills && candidate.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {candidate.skills.slice(0, 5).map((skill, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {candidate.skills.length > 5 && (
                                                    <span className="text-xs text-muted-foreground self-center">
                                                        +{candidate.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Evaluation Summary */}
                                        {hasEvaluation && evaluation && (
                                            <div className="bg-muted/30 rounded-lg p-3 text-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-700">AI Evaluation Complete</span>
                                                </div>
                                                {evaluation.recommendation_reasoning && (
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        {evaluation.recommendation_reasoning.length > 150
                                                            ? `${evaluation.recommendation_reasoning.substring(0, 150)}...`
                                                            : evaluation.recommendation_reasoning}
                                                    </p>
                                                )}
                                                {evaluation.strengths && (
                                                    <div className="mt-2">
                                                        <span className="text-green-600 font-medium text-xs">Key Strengths: </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {evaluation.strengths.split(',').slice(0, 2).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => startInterview(candidate.id)}
                                                className="flex-1"
                                            >
                                                <VideoIcon className="h-4 w-4 mr-2" />
                                                Start Interview
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCandidateAction(candidate.id, 'move_to_final')}
                                                className="flex-1"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Complete Interview
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/candidate/${candidate.id}`)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InterviewedCandidates; 