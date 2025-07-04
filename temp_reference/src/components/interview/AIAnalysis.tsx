import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Brain, Check, X, AlertCircle } from 'lucide-react';

interface AIAnalysisProps {
    analysis: {
        technicalCompetency: {
            score: number;
            strengths: string[];
            gaps: string[];
        };
        communicationSkills: {
            score: number;
            highlights: string[];
            areas_of_improvement: string[];
        };
        culturalAlignment: {
            score: number;
            positiveIndicators: string[];
            concerns: string[];
        };
        overallRecommendation: string;
    } | null;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis }) => {
    if (!analysis) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No AI analysis available
                </CardContent>
            </Card>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const renderScoreSection = (
        title: string,
        score: number,
        positives: string[],
        negatives: string[]
    ) => (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{title}</h3>
                    <span className={`font-semibold ${getScoreColor(score)}`}>
                        {score}%
                    </span>
                </div>
                <Progress value={score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                        {positives.map((item, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Areas to Probe</span>
                    </div>
                    <ul className="space-y-1">
                        {negatives.map((item, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>AI-Powered Analysis</CardTitle>
                        <CardDescription>Comprehensive evaluation based on resume and interview data</CardDescription>
                    </div>
                    <Brain className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderScoreSection(
                    'Technical Competency',
                    analysis.technicalCompetency.score,
                    analysis.technicalCompetency.strengths,
                    analysis.technicalCompetency.gaps
                )}
                <Separator />
                {renderScoreSection(
                    'Communication Skills',
                    analysis.communicationSkills.score,
                    analysis.communicationSkills.highlights,
                    analysis.communicationSkills.areas_of_improvement
                )}
                <Separator />
                {renderScoreSection(
                    'Cultural Alignment',
                    analysis.culturalAlignment.score,
                    analysis.culturalAlignment.positiveIndicators,
                    analysis.culturalAlignment.concerns
                )}
                <Separator />
                <div>
                    <h3 className="font-medium mb-2">Overall Recommendation</h3>
                    <div className="bg-secondary/20 p-4 rounded-lg text-sm">
                        {analysis.overallRecommendation}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AIAnalysis; 