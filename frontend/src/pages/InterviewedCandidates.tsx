import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useRecruitment } from '@/contexts/RecruitmentContext';

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
        additionalFilters: { stage: 'interviewed' },
        autoRefresh: false // Disable auto-refresh to prevent continuous calls
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Interviewed Candidates"
                subtitle={`Review interview results and make final decisions ${activeFilters.positionId
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
                                    ? 'No interviewed candidates found for the selected position.'
                                    : 'No interviewed candidates found. Try selecting a specific position or check other stages.'
                                }
                            </p>
                            <Button onClick={() => navigate('/applied')} variant="outline">
                                View Applied Candidates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Candidates list */}
            {!loading && !error && candidates.length > 0 && (
                <div className="grid gap-4">
                    {candidates.map((candidate) => (
                        <Card key={candidate.id} className="cursor-pointer hover:bg-accent/5">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                                        <p className="text-muted-foreground">{candidate.position}</p>
                                    </div>
                                    <Badge variant="secondary">Interviewed</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        {candidate.email}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                                    >
                                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewedCandidates; 