
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, Clock, X, MessageSquare, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CandidateListProps {
  candidates: Array<{
    id: string;
    name: string;
    position: string;
    status: 'shortlist' | 'kiv' | 'reject' | 'new';
    event?: string;
    score?: number;
    date?: string;
  }>;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates }) => {
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
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.position}</TableCell>
              <TableCell>{candidate.event || '-'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(candidate.status)}`}>
                  {getStatusIcon(candidate.status)}
                  {getStatusText(candidate.status)}
                </span>
              </TableCell>
              <TableCell>{candidate.score ? `${candidate.score}%` : '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/candidate/${candidate.id}`)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  {candidate.status === 'shortlist' && (
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/interview/schedule/${candidate.id}`)}>
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Interview</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateList;
