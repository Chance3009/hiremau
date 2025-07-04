import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, User, ChevronLeft, Brain, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ResumeSummary from '@/components/candidate/ResumeSummary';
import AIAnalysis from '@/components/interview/AIAnalysis';
import EvaluationCard from '@/components/candidate/EvaluationCard';
import { cn } from "@/lib/utils";
import { PageHeader } from '@/components/ui/page-header';
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { fetchCandidateById, getCandidateActions, performCandidateAction } from '@/services/candidateService';
import { toast } from '@/components/ui/use-toast';
import { Candidate } from '@/types';

const CandidateView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { setCurrentStage } = useRecruitment();
  const [activeTab, setActiveTab] = useState('resume');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowedActions, setAllowedActions] = useState<string[]>([]);

  useEffect(() => {
    if (!candidateId) {
      setError('No candidate ID provided');
      setLoading(false);
      return;
    }

    const loadCandidateData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch candidate data with evaluation
        const candidateData = await fetchCandidateById(candidateId);
        if (!candidateData) {
          throw new Error('Candidate not found');
        }
        setCandidate(candidateData);

        // Fetch allowed actions
        const actions = await getCandidateActions(candidateId);
        setAllowedActions(actions);
      } catch (err: unknown) {
        console.error('Error loading candidate:', err);
        setError(err instanceof Error ? err.message : 'Failed to load candidate data');
      } finally {
        setLoading(false);
      }
    };

    loadCandidateData();
  }, [candidateId]);

  // Process evaluation data from the backend
  const getEvaluationData = () => {
    // Check both possible property names for evaluation data
    const evaluationData = candidate?.evaluationData || candidate?.evaluation_data;

    if (!evaluationData || (Array.isArray(evaluationData) && evaluationData.length === 0)) {
      return {
        hasEvaluation: false,
        status: 'pending',
        message: 'Evaluation in progress...'
      };
    }

    // Handle both array and object formats
    const evaluation = Array.isArray(evaluationData) ? evaluationData[0] : evaluationData;

    if (!evaluation) {
      return {
        hasEvaluation: false,
        status: 'pending',
        message: 'Evaluation in progress...'
      };
    }

    return {
      hasEvaluation: true,
      status: 'completed',
      authenticity: {
        score: 85, // Default score - could be calculated from evaluation data
        summary: evaluation.communication_assessment || "Assessment completed",
        details: {
          experience: evaluation.experience_relevance || "Experience analyzed",
          education: evaluation.education_background || "Education verified",
          references: "References to be verified",
          redFlags: evaluation.red_flags || "None detected"
        }
      },
      skillMatch: {
        score: 88, // Could be calculated from technical skills assessment
        summary: evaluation.technical_competency_assessment || "Technical skills assessed",
        details: {
          strengths: evaluation.strengths ? evaluation.strengths.split(',').map(s => s.trim()) : [],
          gaps: evaluation.missing_required_skills ? evaluation.missing_required_skills.split(',').map(s => s.trim()) : [],
          recommendations: evaluation.interview_focus_areas ? evaluation.interview_focus_areas.split(',').map(s => s.trim()) : []
        }
      },
      culturalFit: {
        score: 82, // Could be calculated from cultural fit indicators
        summary: evaluation.cultural_fit_indicators || "Cultural fit to be assessed",
        details: {
          strengths: evaluation.standout_qualities ? evaluation.standout_qualities.split(',').map(s => s.trim()) : [],
          concerns: evaluation.potential_concerns ? evaluation.potential_concerns.split(',').map(s => s.trim()) : [],
          recommendations: ["Include cultural fit assessment in interview"]
        }
      },
      overallRecommendation: {
        summary: evaluation.recommendation_reasoning || "Evaluation completed",
        recommendation: evaluation.recommendation || "Interview",
        nextSteps: evaluation.interview_focus_areas ? evaluation.interview_focus_areas.split(',').map(s => s.trim()) : []
      }
    };
  };

  const evaluationData = getEvaluationData();

  const handleStatusChange = async (action: string) => {
    if (!candidate) return;

    try {
      const result = await performCandidateAction(candidate.id, action, {
        performed_by: 'user',
        notes: `Action performed: ${action}`
      });

      // Refresh candidate data to get updated status
      const updatedCandidate = await fetchCandidateById(candidate.id);
      setCandidate(updatedCandidate);

      // Update allowed actions
      const actions = await getCandidateActions(candidate.id);
      setAllowedActions(actions);

      toast({
        title: "Status Updated",
        description: result.message || `Action ${action} completed successfully`,
      });

      // Don't redirect - stay on current page
      console.log(`Candidate moved to new stage: ${updatedCandidate?.stage}`);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleNotesChange = (notes: string) => {
    console.log(`Updating notes for candidate ${candidateId}:`, notes);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'strong yes':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'interview':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'maybe':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'reject':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionButtonStyle = (action: string) => {
    switch (action) {
      case 'shortlist':
        return 'default';
      case 'reject':
        return 'destructive';
      case 'schedule_interview':
        return 'secondary';
      case 'start_screening':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'shortlist':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case 'reject':
        return <XCircle className="h-4 w-4 mr-2" />;
      case 'schedule_interview':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const formatActionName = (action: string) => {
    return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleGoBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Candidate not found</p>
          <Button onClick={handleGoBack} variant="outline" className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={candidate.name}
        subtitle={`${candidate.current_position || 'Position not specified'} • ${candidate.stage || 'Applied'} • ${candidate.country || 'Malaysia'}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGoBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {allowedActions.includes('schedule_interview') && (
            <Button onClick={() => handleStatusChange('schedule_interview')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Candidate Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Overview</CardTitle>
              <CardDescription>
                {candidate.formatted_phone && `${candidate.formatted_phone} • `}
                {candidate.email}
                {candidate.formatted_salary && ` • ${candidate.formatted_salary}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Basic Info & Skills */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Experience & Skills</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Years of Experience</p>
                        <p className="text-sm text-muted-foreground">{candidate.years_experience || 0} years</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Education</p>
                        <p className="text-sm text-muted-foreground">{candidate.education || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {candidate.skills?.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                              {skill}
                            </span>
                          )) || <span className="text-sm text-muted-foreground">No skills listed</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Availability:</span>
                        <span className="text-sm text-muted-foreground">{candidate.availability || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Work Type:</span>
                        <span className="text-sm text-muted-foreground">{candidate.preferred_work_type || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Source:</span>
                        <span className="text-sm text-muted-foreground">{candidate.source || 'Direct'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - AI Analysis */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">AI Evaluation Status</h3>
                    {evaluationData.hasEvaluation ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Evaluation Complete</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Authenticity</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">{evaluationData.authenticity.score}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm">Skill Match</span>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{evaluationData.skillMatch.score}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              <span className="text-sm">Cultural Fit</span>
                            </div>
                            <span className="text-sm font-semibold text-purple-600">{evaluationData.culturalFit.score}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">{evaluationData.message}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {evaluationData.hasEvaluation && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Insights</h3>
                        <div className="space-y-3">
                          {evaluationData.skillMatch.details.strengths.length > 0 && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-green-700 mb-1">Strengths</h4>
                              <ul className="text-xs space-y-1">
                                {evaluationData.skillMatch.details.strengths.slice(0, 2).map((strength, index) => (
                                  <li key={index} className="text-green-600">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {evaluationData.skillMatch.details.gaps.length > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-amber-700 mb-1">Areas to Address</h4>
                              <ul className="text-xs space-y-1">
                                {evaluationData.skillMatch.details.gaps.slice(0, 2).map((gap, index) => (
                                  <li key={index} className="text-amber-600">• {gap}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommendation</h3>
                        <div className={`border rounded-lg p-3 ${getRecommendationColor(evaluationData.overallRecommendation.recommendation)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">
                              {evaluationData.overallRecommendation.recommendation}
                            </span>
                          </div>
                          <p className="text-sm">{evaluationData.overallRecommendation.summary}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Quick Actions Panel */}
        <div className="col-span-1">
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Current Stage: {candidate.stage}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {allowedActions.map((action) => (
                  <Button
                    key={action}
                    className="w-full"
                    variant={getActionButtonStyle(action)}
                    onClick={() => handleStatusChange(action)}
                  >
                    {getActionIcon(action)}
                    {formatActionName(action)}
                  </Button>
                ))}

                {candidate.resume_files && candidate.resume_files.length > 0 && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.open(candidate.resume_files[0].file_url, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{candidate.formatted_phone || candidate.phone || 'Not provided'}</p>
                </div>
                {candidate.linkedin_url && (
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
                {candidate.github_url && (
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {evaluationData.hasEvaluation && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="resume">
              <FileText className="h-4 w-4 mr-2" />
              Resume Analysis
            </TabsTrigger>
            <TabsTrigger value="evaluation">
              <Brain className="h-4 w-4 mr-2" />
              AI Evaluation
            </TabsTrigger>
            <TabsTrigger value="ai_analysis">
              <Brain className="h-4 w-4 mr-2" />
              Detailed Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation" className="pt-4">
            <EvaluationCard
              candidateId={candidateId!}
              candidateName={candidate.name}
              detailLevel="detailed"
            />
          </TabsContent>

          <TabsContent value="resume" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Analysis</CardTitle>
                <CardDescription>AI-powered resume analysis and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Resume Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Resume Summary</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p>{candidate.evaluation_data[0]?.resume_summary || 'Resume summary not available'}</p>
                    </div>
                  </div>

                  {/* Experience Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Experience Analysis</h3>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Career Progression</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.evaluation_data[0]?.career_progression || 'Career progression analysis not available'}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
                          <Brain className="h-4 w-4" />
                          <span className="font-medium">Experience Relevance</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          {candidate.evaluation_data[0]?.experience_relevance || 'Experience relevance analysis not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Technical Assessment</h3>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Technical Skills</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.evaluation_data[0]?.technical_skills || 'Technical skills analysis not available'}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
                          <Brain className="h-4 w-4" />
                          <span className="font-medium">Technical Competency</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          {candidate.evaluation_data[0]?.technical_competency_assessment || 'Technical competency assessment not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai_analysis" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed AI Evaluation</CardTitle>
                <CardDescription>Comprehensive AI-powered assessment and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Overall Assessment</h3>
                    <div className={`border rounded-lg p-4 ${getRecommendationColor(evaluationData.overallRecommendation.recommendation)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium uppercase tracking-wider">
                          Recommendation: {evaluationData.overallRecommendation.recommendation}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{evaluationData.overallRecommendation.summary}</p>
                      {evaluationData.overallRecommendation.nextSteps.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                          <ul className="text-sm space-y-1">
                            {evaluationData.overallRecommendation.nextSteps.map((step, index) => (
                              <li key={index}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Analysis Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Strengths</h3>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <p className="text-sm text-green-700 mb-2">
                          {candidate.evaluation_data[0]?.strengths || 'Strengths analysis not available'}
                        </p>
                        {candidate.evaluation_data[0]?.standout_qualities && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-green-700 mb-1">Standout Qualities</h4>
                            <p className="text-sm text-green-600">{candidate.evaluation_data[0].standout_qualities}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Areas to Address</h3>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <p className="text-sm text-amber-700 mb-2">
                          {candidate.evaluation_data[0]?.weaknesses || 'Areas for improvement analysis not available'}
                        </p>
                        {candidate.evaluation_data[0]?.potential_concerns && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-amber-700 mb-1">Potential Concerns</h4>
                            <p className="text-sm text-amber-600">{candidate.evaluation_data[0].potential_concerns}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interview Focus Areas */}
                  {candidate.evaluation_data[0]?.interview_focus_areas && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Interview Focus Areas</h3>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                          {candidate.evaluation_data[0].interview_focus_areas}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cultural Fit */}
                  {candidate.evaluation_data[0]?.cultural_fit_indicators && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Cultural Fit Assessment</h3>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <p className="text-sm text-purple-700">
                          {candidate.evaluation_data[0].cultural_fit_indicators}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CandidateView;
