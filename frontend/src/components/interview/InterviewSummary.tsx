import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Download,
    Share2
} from 'lucide-react';

interface InterviewSummaryProps {
    candidate: {
        name: string;
        position: string;
        skills: string[];
    };
    evaluation: {
        overallScore: number;
        technicalScore: number;
        communicationScore: number;
        culturalFitScore: number;
        strengths: string[];
        weaknesses: string[];
        notes: string[];
        recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
    };
    onExport: () => void;
    onShare: () => void;
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({
    candidate,
    evaluation,
    onExport,
    onShare,
}) => {
    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'strong_yes':
                return 'bg-green-500';
            case 'yes':
                return 'bg-emerald-400';
            case 'maybe':
                return 'bg-yellow-400';
            case 'no':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getRecommendationText = (rec: string) => {
        switch (rec) {
            case 'strong_yes':
                return 'Strong Yes';
            case 'yes':
                return 'Yes';
            case 'maybe':
                return 'Maybe';
            case 'no':
                return 'No';
            default:
                return 'Undecided';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">{candidate.name}</h2>
                    <p className="text-muted-foreground">{candidate.position}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={onShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluation Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Overall Fit</span>
                                <span className="text-sm font-medium">{evaluation.overallScore}%</span>
                            </div>
                            <Progress value={evaluation.overallScore} className="w-full" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Technical Skills</span>
                                <span className="text-sm font-medium">{evaluation.technicalScore}%</span>
                            </div>
                            <Progress value={evaluation.technicalScore} className="w-full" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Communication</span>
                                <span className="text-sm font-medium">{evaluation.communicationScore}%</span>
                            </div>
                            <Progress value={evaluation.communicationScore} className="w-full" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Cultural Fit</span>
                                <span className="text-sm font-medium">{evaluation.culturalFitScore}%</span>
                            </div>
                            <Progress value={evaluation.culturalFitScore} className="w-full" />
                        </div>

                        <div className="pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Recommendation</span>
                                <Badge
                                    variant="secondary"
                                    className={`${getRecommendationColor(evaluation.recommendation)} text-white`}
                                >
                                    {getRecommendationText(evaluation.recommendation)}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {evaluation.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                Areas of Improvement
                            </h3>
                            <ul className="space-y-2">
                                {evaluation.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Interview Notes
                            </h3>
                            <ScrollArea className="h-[200px] border rounded-md p-2">
                                {evaluation.notes.map((note, index) => (
                                    <div
                                        key={index}
                                        className="py-2 border-b last:border-0"
                                    >
                                        <p className="text-sm">{note}</p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InterviewSummary; 