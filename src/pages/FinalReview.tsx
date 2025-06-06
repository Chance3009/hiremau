import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Star, ThumbsUp, X, MessageSquare, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  timestamp: string;
}

const currentUser = {
  id: '4',
  name: 'John Doe',
  role: 'Senior Developer',
  avatar: '/avatars/john.jpg'
};

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
  {
    id: '2',
    name: 'Emily Chen',
    position: 'Full Stack Developer',
    status: 'Final Round',
    rating: 4.8,
    interviewDate: '2025-04-16',
    interviewer: 'Mike Johnson',
    notes: 'Exceptional technical breadth and leadership potential',
    strengths: [
      'Full stack expertise',
      'System design skills',
      'Team leadership experience'
    ],
    considerations: [
      'Higher salary expectations',
      'Needs visa sponsorship'
    ],
    analysis: {
      technical: {
        score: 92,
        skills: ['Node.js', 'React', 'Python', 'AWS', 'MongoDB'],
        strengths: ['System Architecture', 'API Design', 'Database Optimization'],
        areasToImprove: ['GraphQL', 'Mobile Development'],
        projectExperience: 'Built and scaled multiple microservices-based applications'
      },
      communication: {
        score: 85,
        strengths: ['Technical Leadership', 'Project Planning', 'Team Mentoring'],
        areasToImprove: ['English Fluency', 'Written Documentation'],
        teamworkHighlights: 'Successfully led distributed teams of 5-7 developers'
      },
      cultural: {
        score: 95,
        values: ['Excellence', 'Mentorship', 'Innovation'],
        strengths: ['Leadership', 'Initiative', 'Knowledge Sharing'],
        concerns: ['May need relocation support']
      },
      jobFit: {
        score: 90,
        matchingSkills: ['Full Stack Development', 'System Architecture', 'Team Leadership'],
        growthPotential: 'Strong potential for technical architect role',
        risks: 'Visa process might delay start date'
      },
      summary: 'Outstanding candidate with strong technical and leadership capabilities. Visa sponsorship required but worth considering.'
    }
  },
  {
    id: '3',
    name: 'Marcus Williams',
    position: 'Frontend Developer',
    status: 'Under Review',
    rating: 3.8,
    interviewDate: '2025-04-14',
    interviewer: 'Lisa Wong',
    notes: 'Creative developer with strong design sense but some technical gaps',
    strengths: [
      'UI/UX expertise',
      'Creative problem-solving',
      'Modern design patterns'
    ],
    considerations: [
      'Limited professional experience',
      'Some knowledge gaps in core concepts'
    ],
    analysis: {
      technical: {
        score: 75,
        skills: ['React', 'CSS/SASS', 'Animation', 'Figma'],
        strengths: ['UI Components', 'Responsive Design', 'Animation'],
        areasToImprove: ['JavaScript Fundamentals', 'Performance', 'Testing'],
        projectExperience: 'Created several impressive portfolio projects and freelance work'
      },
      communication: {
        score: 82,
        strengths: ['Design Collaboration', 'Visual Communication', 'User Empathy'],
        areasToImprove: ['Technical Communication', 'Code Documentation'],
        teamworkHighlights: 'Good collaboration with designers and product managers'
      },
      cultural: {
        score: 85,
        values: ['Creativity', 'User Focus', 'Growth'],
        strengths: ['Enthusiasm', 'Design Thinking', 'Adaptability'],
        concerns: ['May need structured mentoring program']
      },
      jobFit: {
        score: 78,
        matchingSkills: ['UI Development', 'Design Implementation', 'Modern Frontend'],
        growthPotential: 'Could grow into a UI/UX developer specialist',
        risks: 'Will need support to develop core engineering practices'
      },
      summary: 'Promising junior candidate with strong design skills. Would benefit from mentoring but shows great potential in UI/UX development.'
    }
  }
];

const FinalReview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 3,
    comment: ''
  });
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([mockCandidates[0].id]);

  const handleAddReview = () => {
    if (!newReview.comment.trim()) return;

    const review: Review = {
      id: `review-${reviews.length + 1}`,
      reviewer: currentUser.name,
      rating: newReview.rating,
      comment: newReview.comment,
      timestamp: new Date().toISOString()
    };
    setReviews([...reviews, review]);
    setNewReview({ rating: 3, comment: '' });
  };

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length < 2) {
        return [...prev, candidateId];
      }
      return [prev[1], candidateId];
    });
  };

  const isSelected = (candidateId: string) => selectedForComparison.includes(candidateId);

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Final Review</h1>
          <p className="text-sm text-muted-foreground">Review and compare candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'individual' ? 'default' : 'outline'}
            onClick={() => setViewMode('individual')}
            size="sm"
          >
            <Star className="h-4 w-4 mr-2" />
            Individual Analysis
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            onClick={() => setViewMode('comparison')}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Compare Candidates
          </Button>
        </div>
      </div>

      {viewMode === 'individual' ? (
        // Individual Analysis View
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
            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>Comprehensive evaluation of candidate fit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-semibold">{selectedCandidate.analysis.technical.score}%</div>
                      <div className="text-sm text-muted-foreground">Technical</div>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-semibold">{selectedCandidate.analysis.communication.score}%</div>
                      <div className="text-sm text-muted-foreground">Communication</div>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-semibold">{selectedCandidate.analysis.cultural.score}%</div>
                      <div className="text-sm text-muted-foreground">Cultural Fit</div>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-semibold">{selectedCandidate.analysis.jobFit.score}%</div>
                      <div className="text-sm text-muted-foreground">Job Fit</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Points */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Technical Profile</h4>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.analysis.technical.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedCandidate.analysis.technical.projectExperience}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Communication & Teamwork</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidate.analysis.communication.teamworkHighlights}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Strengths</h4>
                        <ul className="space-y-1">
                          {selectedCandidate.analysis.technical.strengths.slice(0, 2).map((strength, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              {strength}
                            </li>
                          ))}
                          {selectedCandidate.analysis.communication.strengths.slice(0, 1).map((strength, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Areas to Consider</h4>
                        <ul className="space-y-1">
                          {selectedCandidate.analysis.technical.areasToImprove.slice(0, 2).map((area, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Overall Summary */}
                  <div>
                    <h3 className="font-medium mb-2">Overall Assessment</h3>
                    <p className="text-sm bg-secondary/20 p-3 rounded-lg">
                      {selectedCandidate.analysis.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Summary */}
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

            {/* Team Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Team Reviews</CardTitle>
                <CardDescription>Reviews from team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Existing Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-secondary/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{review.reviewer}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Add Your Review</h3>
                        <div className="text-sm text-muted-foreground">
                          Reviewing as {currentUser.name} ({currentUser.role})
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <RadioGroup
                          className="flex gap-4"
                          value={newReview.rating.toString()}
                          onValueChange={(value) => setNewReview({ ...newReview, rating: parseInt(value) })}
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2">
                              <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                              <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Comment</Label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Share your thoughts about the candidate..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button onClick={handleAddReview} className="w-full">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Comparison View
        <div className="space-y-6">
          {/* Candidate Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Candidates to Compare</CardTitle>
              <CardDescription>Choose up to 2 candidates to compare side by side</CardDescription>
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

          {/* Comparison Content */}
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="interview">Interview Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedForComparison.map((candidateId) => {
                  const candidate = mockCandidates.find(c => c.id === candidateId);
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
                {selectedForComparison.map((candidateId) => {
                  const candidate = mockCandidates.find(c => c.id === candidateId);
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
      )}
    </div>
  );
};

export default FinalReview;
