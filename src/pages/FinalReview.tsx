import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Star, ThumbsUp, X } from 'lucide-react';

const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Frontend Developer',
    event: 'UPM Career Fair 2025',
    status: 'Pending Review',
    rating: 4.5,
    interviewDate: '2025-04-15',
    interviewer: 'Sarah Chen',
    notes: 'Strong technical skills, good cultural fit',
    strengths: [
      'Deep React knowledge',
      'Good problem-solving skills',
      'Clear communication'
    ],
    considerations: [
      'Limited backend experience',
      'No experience with our specific tech stack'
    ]
  },
  // Add more mock candidates here
];

const FinalReview: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Final Review</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button size="sm">
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Candidate List */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
            <CardDescription>Review and make final decisions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {mockCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 cursor-pointer hover:bg-accent/5 ${selectedCandidate.id === candidate.id ? 'bg-accent/10' : ''
                    }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                    <Badge variant="secondary">{candidate.status}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {candidate.interviewDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {candidate.rating}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Candidate Details */}
        <div className="col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Summary</CardTitle>
              <CardDescription>
                Interviewed by {selectedCandidate.interviewer} on {selectedCandidate.interviewDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Overall Notes</h3>
                  <p className="text-muted-foreground">{selectedCandidate.notes}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Considerations</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.considerations.map((consideration, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <X className="h-4 w-4 text-yellow-500" />
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Assessment</CardTitle>
              <CardDescription>Evaluation of technical skills and experience</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add technical assessment details here */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cultural Fit</CardTitle>
              <CardDescription>Evaluation of soft skills and team compatibility</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add cultural fit assessment details here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;
