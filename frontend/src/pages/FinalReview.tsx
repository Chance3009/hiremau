import React, { useState, useEffect } from 'react';
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
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { fetchFinalReviewCandidates } from '@/services/candidateService';
import { Candidate } from '@/types';

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  timestamp: string;
}

const currentUser = {
  name: "Sarah Johnson",
  role: "Senior Recruiter"
};

const reviews: Review[] = [
  {
    id: "1",
    reviewer: "Mike Chen",
    rating: 4,
    comment: "Strong technical skills and good communication. Would be a great fit for our team.",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    reviewer: "Lisa Park",
    rating: 5,
    comment: "Excellent problem-solving abilities and cultural fit. Highly recommend for hiring.",
    timestamp: "2024-01-14T14:20:00Z"
  }
];

const FinalReview: React.FC = () => {
  const navigate = useNavigate();

  // State management for candidates
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 3,
    comment: ''
  });
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch final review candidates
  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const candidatesData = await fetchFinalReviewCandidates();
      setCandidates(candidatesData);

      // Set the first candidate as selected when candidates are loaded
      if (candidatesData.length > 0) {
        setSelectedCandidate(candidatesData[0]);
        setSelectedForComparison([candidatesData[0].id]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load candidates';
      setError(errorMessage);
      console.error('Error loading final review candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  // Set the first candidate as selected when candidates are loaded
  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0]);
      setSelectedForComparison([candidates[0].id]);
    }
  }, [candidates, selectedCandidate]);

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

  const handleFinalDecision = async (decision: string) => {
    if (!selectedCandidate) return;

    try {
      setActionLoading(decision);

      // Map decision to stage and status
      let newStage = '';
      let newStatus = '';

      switch (decision) {
        case 'offer':
          newStage = 'offer';
          newStatus = 'offer_pending';
          break;
        case 'hold':
          newStage = 'final_review';
          newStatus = 'on_hold';
          break;
        case 'reject':
          newStage = 'rejected';
          newStatus = 'rejected';
          break;
        default:
          throw new Error('Invalid decision');
      }

      // Call API to update candidate
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/candidates/${selectedCandidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: newStage,
          status: newStatus,
          updated_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update candidate: ${response.status}`);
      }

      // Show success message
      alert(`Candidate ${decision === 'offer' ? 'moved to offer stage' : decision === 'hold' ? 'put on hold' : 'rejected'} successfully!`);

      // Reload candidates to reflect changes
      await loadCandidates();

    } catch (error) {
      console.error('Error updating candidate:', error);
      alert(`Failed to ${decision} candidate. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Final Review"
        subtitle="Review and compare candidates for final decision"
      >
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'individual' | 'comparison')}>
            <TabsList>
              <TabsTrigger value="individual">
                <Users className="h-4 w-4 mr-2" />
                Individual Review
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <MessageSquare className="h-4 w-4 mr-2" />
                Compare Candidates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-red-500">Error: {error}</p>
            <Button onClick={() => {
              loadCandidates();
            }} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No candidates in final review stage</p>
          </div>
        </div>
      ) : viewMode === 'individual' ? (
        // Individual Analysis View
        <div className="grid grid-cols-12 gap-4">
          {/* Candidate List */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Candidates ({candidates.length})</CardTitle>
              <CardDescription>Review and make final decisions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`p-4 cursor-pointer hover:bg-accent/5 ${selectedCandidate?.id === candidate.id ? 'bg-accent/10' : ''
                      }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.position || 'Position not specified'}</p>
                      </div>
                      <Badge variant="secondary">{candidate.status || 'Pending'}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'No date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {candidate.evaluationData?.[0]?.recommendation
                          ? candidate.evaluationData[0].recommendation
                          : 'Not evaluated'}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Candidate Details */}
          <div className="col-span-8 space-y-4">
            {selectedCandidate && (
              <>
                {/* Initial Screening Evaluation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Final Review Assessment</CardTitle>
                    <CardDescription>Comprehensive evaluation and recommendation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidate.evaluationData?.[0] ? (
                      <div className="space-y-6">
                        {/* Score Overview */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-secondary/20 p-3 rounded-lg text-center">
                            <div className="text-2xl font-semibold text-blue-600">
                              {selectedCandidate.evaluationData[0].technical_competency_assessment ? 'Strong' : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Technical Skills</div>
                          </div>
                          <div className="bg-secondary/20 p-3 rounded-lg text-center">
                            <div className="text-2xl font-semibold text-green-600">
                              {selectedCandidate.evaluationData[0].experience_relevance ? 'Relevant' : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Experience</div>
                          </div>
                          <div className="bg-secondary/20 p-3 rounded-lg text-center">
                            <div className="text-2xl font-semibold text-purple-600">
                              {selectedCandidate.evaluationData[0].cultural_fit_indicators ? 'Good Fit' : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Cultural Fit</div>
                          </div>
                        </div>

                        <Separator />

                        {/* Resume Summary */}
                        {selectedCandidate.evaluationData[0].resume_summary && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Resume Summary</h4>
                            <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                              {selectedCandidate.evaluationData[0].resume_summary}
                            </p>
                          </div>
                        )}

                        {/* Key Points */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {/* Technical Skills */}
                            {selectedCandidate.evaluationData[0].technical_skills && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                  {selectedCandidate.evaluationData[0].technical_skills}
                                </p>
                              </div>
                            )}

                            {/* Strengths */}
                            {selectedCandidate.evaluationData[0].strengths && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                <div className="text-sm flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{selectedCandidate.evaluationData[0].strengths}</span>
                                </div>
                              </div>
                            )}

                            {/* Standout Qualities */}
                            {selectedCandidate.evaluationData[0].standout_qualities && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Standout Qualities</h4>
                                <div className="text-sm flex items-start gap-2">
                                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{selectedCandidate.evaluationData[0].standout_qualities}</span>
                                </div>
                              </div>
                            )}

                            {/* Education Background */}
                            {selectedCandidate.evaluationData[0].education_background && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Education Background</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                  {selectedCandidate.evaluationData[0].education_background}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Experience Assessment */}
                            {selectedCandidate.evaluationData[0].experience_relevance && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Experience Assessment</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                  {selectedCandidate.evaluationData[0].experience_relevance}
                                </p>
                              </div>
                            )}

                            {/* Technical Assessment */}
                            {selectedCandidate.evaluationData[0].technical_competency_assessment && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Technical Assessment</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                  {selectedCandidate.evaluationData[0].technical_competency_assessment}
                                </p>
                              </div>
                            )}

                            {/* Cultural Fit */}
                            {selectedCandidate.evaluationData[0].cultural_fit_indicators && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Cultural Fit Assessment</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                  {selectedCandidate.evaluationData[0].cultural_fit_indicators}
                                </p>
                              </div>
                            )}

                            {/* Potential Concerns */}
                            {selectedCandidate.evaluationData[0].potential_concerns && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Areas for Development</h4>
                                <div className="text-sm flex items-start gap-2">
                                  <X className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{selectedCandidate.evaluationData[0].potential_concerns}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Final Recommendation */}
                        <div className="space-y-4">
                          {selectedCandidate.evaluationData[0].recommendation && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Final Recommendation</h4>
                              <Badge variant={
                                selectedCandidate.evaluationData[0].recommendation.toLowerCase().includes('strong') ? 'default' :
                                  selectedCandidate.evaluationData[0].recommendation.toLowerCase().includes('interview') ? 'secondary' : 'destructive'
                              }>
                                {selectedCandidate.evaluationData[0].recommendation}
                              </Badge>
                            </div>
                          )}

                          {selectedCandidate.evaluationData[0].recommendation_reasoning && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Reasoning</h4>
                              <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                {selectedCandidate.evaluationData[0].recommendation_reasoning}
                              </p>
                            </div>
                          )}

                          {/* Growth Potential */}
                          {selectedCandidate.evaluationData[0].growth_potential && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Growth Potential</h4>
                              <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                                {selectedCandidate.evaluationData[0].growth_potential}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No evaluation data available for this candidate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                    <CardDescription>Basic details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Contact Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Email:</strong> {selectedCandidate.email}</p>
                          <p><strong>Phone:</strong> {selectedCandidate.formatted_phone || selectedCandidate.phone}</p>
                          <p><strong>Current Position:</strong> {selectedCandidate.current_position || 'Not specified'}</p>
                          <p><strong>Experience:</strong> {selectedCandidate.years_experience ? `${selectedCandidate.years_experience} years` : 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Preferences</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Work Type:</strong> {selectedCandidate.preferred_work_type || 'Not specified'}</p>
                          <p><strong>Salary Expectations:</strong> {selectedCandidate.formatted_salary || 'Not specified'}</p>
                          <p><strong>Availability:</strong> {selectedCandidate.availability || 'Not specified'}</p>
                          <p><strong>Source:</strong> {selectedCandidate.source || 'Not specified'}</p>
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

                {/* Final Decision Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Final Decision</CardTitle>
                    <CardDescription>Make the final hiring decision for this candidate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleFinalDecision('offer')}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'offer' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Make Offer
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleFinalDecision('hold')}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'hold' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                          ) : (
                            <Clock className="h-4 w-4 mr-2" />
                          )}
                          Put on Hold
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleFinalDecision('reject')}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'reject' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground bg-secondary/10 p-3 rounded-lg">
                        <p><strong>Note:</strong></p>
                        <ul className="mt-1 space-y-1 ml-4 list-disc">
                          <li><strong>Make Offer:</strong> Move to offer stage and initiate offer process</li>
                          <li><strong>Put on Hold:</strong> Keep candidate for future opportunities</li>
                          <li><strong>Reject:</strong> Send rejection notification and close application</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
                {candidates.map((candidate) => (
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
          <Tabs defaultValue="evaluation" className="w-full">
            <TabsList>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="evaluation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedForComparison.map((candidateId) => {
                  const candidate = candidates.find(c => c.id === candidateId);
                  if (!candidate) return null;

                  return (
                    <Card key={candidate.id}>
                      <CardHeader>
                        <CardTitle>{candidate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.position || 'Position not specified'}</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {candidate.evaluationData?.[0] ? (
                          <>
                            {/* Assessment Overview */}
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Technical Skills</span>
                                  <span className="font-medium">{candidate.evaluationData?.[0]?.technical_competency_assessment ? 'Strong' : 'N/A'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Experience</span>
                                  <span className="font-medium">{candidate.evaluationData?.[0]?.experience_relevance ? 'Relevant' : 'N/A'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Cultural Fit</span>
                                  <span className="font-medium">{candidate.evaluationData?.[0]?.cultural_fit_indicators ? 'Good Fit' : 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Skills */}
                            {candidate.evaluationData[0].technical_skills && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                                <p className="text-xs text-muted-foreground bg-secondary/10 p-2 rounded">
                                  {candidate.evaluationData[0].technical_skills}
                                </p>
                              </div>
                            )}

                            {/* Strengths */}
                            {candidate.evaluationData[0].strengths && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                <div className="text-xs flex items-start gap-2">
                                  <ThumbsUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{candidate.evaluationData[0].strengths}</span>
                                </div>
                              </div>
                            )}

                            {/* Areas for Development */}
                            {candidate.evaluationData[0].potential_concerns && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Areas for Development</h4>
                                <div className="text-xs flex items-start gap-2">
                                  <X className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{candidate.evaluationData[0].potential_concerns}</span>
                                </div>
                              </div>
                            )}

                            {/* Recommendation */}
                            {candidate.evaluationData[0].recommendation && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Recommendation</h4>
                                <Badge variant={
                                  candidate.evaluationData[0].recommendation.toLowerCase().includes('strong') ? 'default' :
                                    candidate.evaluationData[0].recommendation.toLowerCase().includes('interview') ? 'secondary' : 'destructive'
                                }>
                                  {candidate.evaluationData[0].recommendation}
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No evaluation data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedForComparison.map((candidateId) => {
                  const candidate = candidates.find(c => c.id === candidateId);
                  if (!candidate) return null;

                  return (
                    <Card key={candidate.id}>
                      <CardHeader>
                        <CardTitle>{candidate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Phone:</strong> {candidate.formatted_phone || candidate.phone}</p>
                              <p><strong>Current Position:</strong> {candidate.current_position || 'Not specified'}</p>
                              <p><strong>Experience:</strong> {candidate.years_experience ? `${candidate.years_experience} years` : 'Not specified'}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Preferences</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Work Type:</strong> {candidate.preferred_work_type || 'Not specified'}</p>
                              <p><strong>Salary Expectations:</strong> {candidate.formatted_salary || 'Not specified'}</p>
                              <p><strong>Availability:</strong> {candidate.availability || 'Not specified'}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Application Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Source:</strong> {candidate.source || 'Not specified'}</p>
                              <p><strong>Stage:</strong> {candidate.stage}</p>
                              <p><strong>Applied:</strong> {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'Not specified'}</p>
                            </div>
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
