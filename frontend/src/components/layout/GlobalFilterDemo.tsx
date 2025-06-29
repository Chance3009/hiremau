import React from 'react';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Globe, Users, Filter } from 'lucide-react';

export const GlobalFilterDemo: React.FC = () => {
    const { activeEventId, activePositionId } = useRecruitment();

    const hasPositionFilter = activePositionId && activePositionId.trim() !== '';
    const hasEventFilter = activeEventId && activeEventId.trim() !== '';
    const hasAnyFilter = hasPositionFilter || hasEventFilter;

    return (
        <Card className={`border-dashed border-2 ${hasAnyFilter ? 'border-primary/40 bg-primary/10' : 'border-muted/40 bg-muted/5'}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Filter className="h-4 w-4" />
                    Global Filter Status
                    {hasAnyFilter && (
                        <Badge variant="default" className="text-xs">
                            Active
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Event Filter:</span>
                    </div>
                    <Badge variant={hasEventFilter ? "default" : "secondary"}>
                        {hasEventFilter ? "Filtered" : "All Events"}
                    </Badge>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Position Filter:</span>
                    </div>
                    <Badge variant={hasPositionFilter ? "default" : "secondary"}>
                        {hasPositionFilter ? "Specific Position" : "All Positions"}
                    </Badge>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>
                            {hasPositionFilter
                                ? "Candidates filtered by selected position across all pages"
                                : hasEventFilter
                                    ? "Candidates filtered by selected event across all pages"
                                    : "Showing all candidates from all positions and events"
                            }
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 