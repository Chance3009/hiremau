import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X, Grid, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Candidate {
  id: string;
  name: string;
  position: string;
  skills: string[];
  experience: string[];
  education: string[];
  score: number;
  interviewScore?: number;
  interviewNotes?: string;
  resumeUrl?: string;
}

interface CandidateComparisonProps {
  candidates: Candidate[];
  onSelect?: (candidateIds: string[]) => void;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  candidates,
  onSelect
}) => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'resume' | 'interview'>('resume');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [showResume, setShowResume] = useState<string | null>(null);

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        // Limit to 3 candidates max for side-by-side comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), candidateId];
        }
        return [...prev, candidateId];
      }
    });
  };

  const selectedCandidateData = candidates.filter(c =>
    selectedCandidates.includes(c.id)
  );

  // Determine common skills among selected candidates
  const commonSkills = selectedCandidateData.length > 1
    ? selectedCandidateData.reduce((acc, candidate, index) => {
      if (index === 0) return candidate.skills;
      return acc.filter(skill => candidate.skills.includes(skill));
    }, selectedCandidateData[0]?.skills || [])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Candidate Comparison</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Select Candidates
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                {candidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => toggleCandidate(candidate.id)}
                  >
                    <span>{candidate.name}</span>
                    {selectedCandidates.includes(candidate.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="border rounded-md overflow-hidden">
            <Button
              variant={comparisonMode === 'resume' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setComparisonMode('resume')}
            >
              Resume
            </Button>
            <Button
              variant={comparisonMode === 'interview' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setComparisonMode('interview')}
            >
              Interview
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              className="rounded-none"
              onClick={() => setViewMode('split')}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedCandidateData.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Select candidates to compare their qualifications side by side
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid'
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        )}>
          {selectedCandidateData.map(candidate => (
            <Card key={candidate.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => toggleCandidate(candidate.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{candidate.name}</CardTitle>
                <div className="text-sm text-muted-foreground">{candidate.position}</div>
              </CardHeader>

              <CardContent className="space-y-4">
                {comparisonMode === 'resume' ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Skills</h3>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill, i) => (
                          <span
                            key={i}
                            className={cn(
                              "px-2 py-0.5 rounded-md text-xs",
                              commonSkills.includes(skill)
                                ? "bg-green-100 text-green-800"
                                : "bg-secondary text-secondary-foreground"
                            )}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Experience</h3>
                      <ul className="text-xs space-y-1">
                        {candidate.experience.map((exp, i) => (
                          <li key={i}>{exp}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Education</h3>
                      <ul className="text-xs space-y-1">
                        {candidate.education.map((edu, i) => (
                          <li key={i}>{edu}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Fit Score</h3>
                      <div className="text-lg font-bold">{candidate.score}%</div>
                    </div>

                    {candidate.resumeUrl && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowResume(candidate.id)}
                      >
                        View Full Resume
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Interview Score</h3>
                      <div className="text-lg font-bold">
                        {candidate.interviewScore ? `${candidate.interviewScore}%` : 'Not interviewed'}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Interview Notes</h3>
                      <div className="text-xs">
                        {candidate.interviewNotes || 'No interview notes available'}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-[90vh]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resume Viewer</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowResume(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(90vh-8rem)]">
                <iframe
                  src={selectedCandidateData.find(c => c.id === showResume)?.resumeUrl}
                  className="w-full h-full"
                  title="Resume Viewer"
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateComparison;
