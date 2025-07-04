import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Star, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { getCandidateEvaluation, getMockEvaluationData, triggerCandidateEvaluation, EvaluationData } from '@/services/evaluationService';
import { toast } from '@/components/ui/use-toast';

interface EvaluationCardProps {
    candidateId: string;
    candidateName: string;
    detailLevel?: 'minimal' | 'standard' | 'detailed';
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
    candidateId,
    candidateName,
    detailLevel = 'standard'
}) => {
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        fetchEvaluation();
    }, [candidateId]);

    const fetchEvaluation = async () => {
        try {
            setLoading(true);
            const evaluationData = await getCandidateEvaluation(candidateId);

            if (evaluationData) {
                setEvaluation(evaluationData);
            } else {
                // Use mock data for demonstration
                setEvaluation(getMockEvaluationData(candidateId, candidateName));
            }
        } catch (error) {
            console.error('Error fetching evaluation:', error);
            // Use mock data as fallback
            setEvaluation(getMockEvaluationData(candidateId, candidateName));
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerEvaluation = async () => {
        try {
            setTriggering(true);
            const result = await triggerCandidateEvaluation(candidateId);

            if (result.success) {
                toast({
                    title: "Evaluation Triggered",
                    description: result.message,
                });
                // Refresh evaluation data after a short delay
                setTimeout(() => {
                    fetchEvaluation();
                }, 2000);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to trigger evaluation",
                variant: "destructive",
            });
        } finally {
            setTriggering(false);
        }
    };

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'Strong Yes': return 'bg-green-100 text-green-800';
            case 'Interview': return 'bg-blue-100 text-blue-800';
            case 'Maybe': return 'bg-yellow-100 text-yellow-800';
            case 'Reject': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRecommendationScore = (recommendation: string) => {
        switch (recommendation) {
            case 'Strong Yes': return 90;
            case 'Interview': return 75;
            case 'Maybe': return 50;
            case 'Reject': return 25;
            default: return 0;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Evaluation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading evaluation...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!evaluation) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Evaluation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">No evaluation data available</p>
                        <Button onClick={handleTriggerEvaluation} disabled={triggering}>
                            {triggering ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Triggering...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Trigger Evaluation
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const score = getRecommendationScore(evaluation.recommendation);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Evaluation
                    </div>
                    <Badge className={getRecommendationColor(evaluation.recommendation)}>
                        {evaluation.recommendation}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Overall Score */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm font-medium">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                    </div>

                    {/* Resume Summary */}
                    <div>
                        <h4 className="font-medium mb-2">Resume Summary</h4>
                        <p className="text-sm text-muted-foreground">{evaluation.resume_summary}</p>
                    </div>

                    {detailLevel !== 'minimal' && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-medium mb-1">Experience</h5>
                                        <p className="text-sm text-muted-foreground">{evaluation.years_of_experience} years</p>
                                    </div>
                                    <div>
                                        <h5 className="font-medium mb-1">Education</h5>
                                        <p className="text-sm text-muted-foreground">{evaluation.education_background}</p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Technical Skills</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.technical_skills}</p>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Standout Qualities</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.standout_qualities}</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="assessment" className="space-y-4">
                                <div>
                                    <h5 className="font-medium mb-1">Strengths</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.strengths}</p>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Areas for Development</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.weaknesses}</p>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Growth Potential</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.growth_potential}</p>
                                </div>

                                {evaluation.red_flags && evaluation.red_flags !== "None identified" && (
                                    <div>
                                        <h5 className="font-medium mb-1 text-red-600">Red Flags</h5>
                                        <p className="text-sm text-red-600">{evaluation.red_flags}</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="recommendation" className="space-y-4">
                                <div>
                                    <h5 className="font-medium mb-1">Recommendation Reasoning</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.recommendation_reasoning}</p>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Interview Focus Areas</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.interview_focus_areas}</p>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-1">Missing Skills</h5>
                                    <p className="text-sm text-muted-foreground">{evaluation.missing_required_skills}</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={fetchEvaluation}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleTriggerEvaluation} disabled={triggering}>
                            {triggering ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Re-evaluating...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Re-evaluate
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EvaluationCard; 