
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    status: 'shortlist' | 'kiv' | 'reject' | 'new';
    photo?: string;
    score?: number;
    event?: string;
  };
  variant?: 'compact' | 'full';
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, variant = 'compact' }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlist':
        return 'bg-green-100 text-green-700';
      case 'kiv':
        return 'bg-amber-100 text-amber-700';
      case 'reject':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'shortlist':
        return 'Shortlisted';
      case 'kiv':
        return 'Keep in View';
      case 'reject':
        return 'Rejected';
      default:
        return 'New';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlist':
        return <Check className="h-3 w-3 mr-1" />;
      case 'kiv':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'reject':
        return <X className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
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
            
            <div className="mt-2 flex items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${getStatusColor(candidate.status)}`}>
                {getStatusIcon(candidate.status)}
                {getStatusText(candidate.status)}
              </span>
              
              {candidate.event && (
                <span className="text-xs text-muted-foreground ml-2">
                  {candidate.event}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      {variant === 'full' && (
        <CardFooter className="px-4 py-2 border-t bg-muted/20 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleViewProfile}>View Profile</Button>
          {candidate.status === 'shortlist' && (
            <Button size="sm" onClick={handleScheduleInterview}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Interview
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateCard;
