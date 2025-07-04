import React from 'react';
import { Brain, Target, LineChart, AlertCircle, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { type Candidate } from '@/mocks/candidateData';

type DetailLevel = 'minimal' | 'standard' | 'detailed';

interface AIInsightCardProps {
    analysis?: Candidate['aiAnalysis'];
    detailLevel: DetailLevel;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ analysis, detailLevel }) => {
    if (!analysis) {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">AI Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">No AI analysis available yet.</p>
            </div>
        );
    }

    // Helper function to get AI summary
    const getAISummary = () => {
        const strengths = analysis.insights?.filter(i => i.type === 'strength') || [];
        const opportunities = analysis.insights?.filter(i => i.type === 'opportunity') || [];
        return `${strengths[0]?.description || ''}. ${opportunities[0]?.description || ''}`;
    };

    if (detailLevel === 'minimal') {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Match</h3>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm font-semibold text-primary">{analysis.overallMatch}%</span>
                    </div>
                    <Progress value={analysis.overallMatch} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{getAISummary()}</p>
                </div>
            </div>
        );
    }

    if (detailLevel === 'standard') {
        return (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Analysis</h3>
                </div>

                <div className="space-y-4">
                    {/* Overall Match */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Match</span>
                            <span className="text-sm font-semibold text-primary">{analysis.overallMatch}%</span>
                        </div>
                        <Progress value={analysis.overallMatch} className="h-2" />
                    </div>

                    {/* Culture & Growth */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Culture Fit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={analysis.cultureFit} className="h-2" />
                                <span className="text-sm font-medium">{analysis.cultureFit}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <LineChart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Growth Potential</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={analysis.growthPotential} className="h-2" />
                                <span className="text-sm font-medium">{analysis.growthPotential}%</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {analysis.insights?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                            <div className="space-y-2">
                                {analysis.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm">{insight.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Factors */}
                    {analysis.riskFactors?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Potential Concerns</h4>
                            <div className="space-y-2">
                                {analysis.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${risk.severity === 'high' ? 'text-destructive' :
                                            risk.severity === 'medium' ? 'text-yellow-500' :
                                                'text-muted-foreground'
                                            }`} />
                                        <span className="text-sm">{risk.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detailed view
    return (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Detailed Skills Analysis</h3>
            </div>

            <div className="space-y-4">
                {/* Skill Matches */}
                {analysis.skillMatches?.length > 0 && (
                    <div className="space-y-3">
                        {analysis.skillMatches.map((skill, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{skill.skill}</span>
                                        {skill.required && (
                                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Required</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{skill.score}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Progress value={skill.score} className="h-2 flex-1" />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{skill.experience}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Learning Path */}
                {analysis.learningPath?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Recommended Learning Path</h4>
                        <div className="space-y-2">
                            {analysis.learningPath.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <div className={`h-2 w-2 rounded-full mt-1.5 ${item.priority === 'high' ? 'bg-destructive' :
                                        item.priority === 'medium' ? 'bg-yellow-500' :
                                            'bg-muted-foreground'
                                        }`} />
                                    <div>
                                        <p className="text-sm">{item.skill}</p>
                                        <p className="text-xs text-muted-foreground">Est. {item.estimatedTimeToAcquire}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 