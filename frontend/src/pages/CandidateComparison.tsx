import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Check, Star, ThumbsUp, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

// Import the interfaces from FinalReview
interface TechnicalAnalysis {
  score: number;
  skills: string[];
  strengths: string[];
  areasToImprove: string[];
  projectExperience: string;
}

interface CommunicationAnalysis {
  score: number;
  strengths: string[];
  areasToImprove: string[];
  teamworkHighlights: string;
}

interface CulturalAnalysis {
  score: number;
  values: string[];
  strengths: string[];
  concerns: string[];
}

interface JobFitAnalysis {
  score: number;
  matchingSkills: string[];
  growthPotential: string;
  risks: string;
}

interface CandidateAnalysis {
  technical: TechnicalAnalysis;
  communication: CommunicationAnalysis;
  cultural: CulturalAnalysis;
  jobFit: JobFitAnalysis;
  summary: string;
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  status: string;
  rating: number;
  interviewDate: string;
  interviewer: string;
  notes: string;
  strengths: string[];
  considerations: string[];
  analysis: CandidateAnalysis;
}

// Use the same mock data from FinalReview
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    status: 'Pending Review',
    rating: 4.5,
    interviewDate: '2025-04-15',
    interviewer: 'John Doe',
    notes: 'Strong technical skills, good cultural fit',
    strengths: [
      'Deep React knowledge',
      'Good problem-solving skills',
      'Clear communication'
    ],
    considerations: [
      'Limited backend experience',
      'No experience with our specific tech stack'
    ],
    analysis: {
      technical: {
        score: 85,
        skills: ['React', 'TypeScript', 'Frontend Architecture'],
        strengths: ['Component Design', 'State Management', 'Performance Optimization'],
        areasToImprove: ['Backend Integration', 'Testing Coverage'],
        projectExperience: 'Led development of 3 major web applications'
      },
      communication: {
        score: 90,
        strengths: ['Clear Explanations', 'Active Listening', 'Technical Documentation'],
        areasToImprove: ['Public Speaking'],
        teamworkHighlights: 'Effectively collaborated in cross-functional teams'
      },
      cultural: {
        score: 88,
        values: ['Innovation', 'Collaboration', 'Continuous Learning'],
        strengths: ['Team Player', 'Mentorship Experience', 'Problem-solving Mindset'],
        concerns: ['May need guidance on company processes']
      },
      jobFit: {
        score: 87,
        matchingSkills: ['Frontend Development', 'UI/UX Implementation', 'Agile Experience'],
        growthPotential: 'High potential for technical leadership role',
        risks: 'May need support for backend tasks initially'
      },
      summary: 'Strong candidate with excellent frontend skills. Shows good potential for growth.'
    }
  },
  // ... other candidates from FinalReview ...
];

const getCandidate = (id: string) => mockCandidates.find(c => c.id === id);

const CandidateComparison = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['1', '2']);
  const [viewMode, setViewMode] = useState<'analysis' | 'interview'>('analysis');

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length < 2) {
        return [...prev, candidateId];
      }
      return [prev[1], candidateId];
    });
  };

  const isSelected = (candidateId: string) => selectedCandidates.includes(candidateId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare Candidates"
        subtitle="Compare and evaluate candidates side by side"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </PageHeader>

      {/* Candidate Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Candidates to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCandidates.map((candidate) => (
              <Button
                key={candidate.id}
                variant={isSelected(candidate.id) ? 'secondary' : 'outline'}
                className="justify-start gap-2"
                onClick={() => handleCandidateToggle(candidate.id)}
              >
                {isSelected(candidate.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
                {candidate.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <Tabs value={viewMode} className="w-full">
        <TabsList>
          <TabsTrigger value="analysis" onClick={() => setViewMode('analysis')}>
            Analysis
          </TabsTrigger>
          <TabsTrigger value="interview" onClick={() => setViewMode('interview')}>
            Interview Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedCandidates.map((candidateId) => {
              const candidate = getCandidate(candidateId);
              if (!candidate) return null;

              return (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle>{candidate.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Technical</span>
                          <span className="font-medium">{candidate.analysis.technical.score}%</span>
                        </div>
                        <Progress value={candidate.analysis.technical.score} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Communication</span>
                          <span className="font-medium">{candidate.analysis.communication.score}%</span>
                        </div>
                        <Progress value={candidate.analysis.communication.score} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cultural Fit</span>
                          <span className="font-medium">{candidate.analysis.cultural.score}%</span>
                        </div>
                        <Progress value={candidate.analysis.cultural.score} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Job Fit</span>
                          <span className="font-medium">{candidate.analysis.jobFit.score}%</span>
                        </div>
                        <Progress value={candidate.analysis.jobFit.score} />
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.analysis.technical.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Strengths</h4>
                      <ul className="space-y-1">
                        {candidate.strengths.map((strength, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Considerations */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {candidate.considerations.map((consideration, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <X className="h-4 w-4 text-yellow-500" />
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Overall Assessment</h4>
                      <p className="text-sm text-muted-foreground">{candidate.analysis.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="interview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedCandidates.map((candidateId) => {
              const candidate = getCandidate(candidateId);
              if (!candidate) return null;

              return (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle>{candidate.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Interviewed by {candidate.interviewer} on {candidate.interviewDate}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Interview Notes</h4>
                      <p className="text-sm text-muted-foreground">{candidate.notes}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {candidate.strengths.map((strength, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Considerations</h4>
                        <ul className="space-y-1">
                          {candidate.considerations.map((consideration, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <X className="h-4 w-4 text-yellow-500" />
                              {consideration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateComparison;
