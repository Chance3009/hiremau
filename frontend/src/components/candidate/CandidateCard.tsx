
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentStage, getStageLabel, getStageColor, getAvailableActions, getActionLabel } from '@/lib/workflow';
import type { WorkflowAction } from '@/lib/workflow';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    status?: string;
    stage?: string;
    currentStage?: string;
    photo?: string;
    score?: number;
    event?: string;
  };
  variant?: 'compact' | 'full';
  onAction?: (candidateId: string, action: WorkflowAction) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, variant = 'compact', onAction }) => {
  const navigate = useNavigate();

  // Get current workflow stage
  const currentStage = getCurrentStage({
    currentStage: candidate.currentStage as any,
    status: candidate.status,
    stage: candidate.stage
  });
  const stageLabel = getStageLabel(currentStage);
  const stageColor = getStageColor(currentStage);
  const availableActions = getAvailableActions(currentStage);

  const handleViewProfile = () => {
    navigate(`/candidate/${candidate.id}`);
  };

  const handleScheduleInterview = () => {
    navigate(`/interview/schedule/${candidate.id}`);
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
            {candidate.photo ? (
              <img src={candidate.photo} alt={candidate.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              candidate.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.position}</p>
              </div>
              {candidate.score && (
                <div className="text-sm font-medium">
                  Score: <span className={candidate.score > 75 ? "text-green-600" : "text-amber-600"}>
                    {candidate.score}%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${stageColor}`}>
                {stageLabel}
              </span>

              {candidate.event && (
                <span className="text-xs text-muted-foreground">
                  {candidate.event}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {variant === 'full' && (
        <CardFooter className="px-4 py-2 border-t bg-muted/20">
          <div className="flex justify-between items-center w-full">
            <Button size="sm" variant="outline" onClick={handleViewProfile}>View Profile</Button>

            {onAction && (
              <div className="flex gap-2">
                {availableActions.slice(0, 2).map((action) => (
                  <Button
                    key={action}
                    size="sm"
                    variant={action === 'reject' ? 'destructive' : action === 'shortlist' || action === 'make_offer' ? 'default' : 'outline'}
                    onClick={() => onAction(candidate.id, action)}
                  >
                    {action === 'shortlist' && <Check className="h-4 w-4 mr-1" />}
                    {action === 'reject' && <X className="h-4 w-4 mr-1" />}
                    {action === 'schedule_interview' && <MessageSquare className="h-4 w-4 mr-1" />}
                    {getActionLabel(action)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateCard;
