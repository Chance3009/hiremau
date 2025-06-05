import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, X, Grid, Columns, Star, Clock, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

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
  candidates
}) => {
  const [comparisonMode, setComparisonMode] = useState<'resume' | 'interview'>('resume');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');

  // Memoize common skills computation
  const commonSkills = useMemo(() => {
    if (candidates.length <= 1) return [];
    return candidates.reduce((acc, candidate, index) => {
      if (index === 0) return candidate.skills;
      return acc.filter(skill => candidate.skills.includes(skill));
    }, candidates[0]?.skills || []);
  }, [candidates]);

  const renderSkillBadge = (skill: string) => (
    <span
      key={skill}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        commonSkills.includes(skill)
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {skill}
    </span>
  );

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">No Candidates Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select candidates above to compare their qualifications side by side
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Comparing {candidates.length} Candidates</h2>
          <p className="text-sm text-muted-foreground">
            {commonSkills.length > 0 && `${commonSkills.length} common skills found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="border rounded-md overflow-hidden">
            <Button
              variant={comparisonMode === 'resume' ? 'default' : 'ghost'}
              className="rounded-none px-3"
              onClick={() => setComparisonMode('resume')}
            >
              Resume
            </Button>
            <Button
              variant={comparisonMode === 'interview' ? 'default' : 'ghost'}
              className="rounded-none px-3"
              onClick={() => setComparisonMode('interview')}
            >
              Interview
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="rounded-none px-3"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              className="rounded-none px-3"
              onClick={() => setViewMode('split')}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'grid'
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 lg:grid-cols-2"
      )}>
        {candidates.map(candidate => (
          <Card key={candidate.id} className="relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold tracking-tight">{candidate.score}%</div>
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            <CardHeader className="p-6">
              <CardTitle className="text-lg font-semibold">{candidate.name}</CardTitle>
              <CardDescription>{candidate.position}</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-6">
              {comparisonMode === 'resume' ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Briefcase className="h-4 w-4" />
                        Experience
                      </div>
                      <ul className="space-y-2 text-sm">
                        {candidate.experience.map((exp, i) => (
                          <li key={i} className="text-muted-foreground">{exp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4" />
                        Education
                      </div>
                      <ul className="space-y-2 text-sm">
                        {candidate.education.map((edu, i) => (
                          <li key={i} className="text-muted-foreground">{edu}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Star className="h-4 w-4" />
                        Skills
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.map(skill => renderSkillBadge(skill))}
                      </div>
                    </div>
                  </div>

                  {candidate.resumeUrl && (
                    <Button variant="outline" className="w-full">
                      View Full Resume
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Star className="h-4 w-4" />
                        Interview Score
                      </div>
                      <span className="text-xl font-bold">
                        {candidate.interviewScore ? `${candidate.interviewScore}%` : 'N/A'}
                      </span>
                    </div>
                    {candidate.interviewScore && (
                      <Progress value={candidate.interviewScore} className="h-2" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Interview Notes
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {candidate.interviewNotes || 'No interview notes available'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CandidateComparison;
