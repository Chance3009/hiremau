import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ChevronDown,
    ChevronUp,
    User,
    Briefcase,
    GraduationCap,
    Star,
    Bot,
    FileText
} from 'lucide-react';

interface CandidateInterviewProfileProps {
    candidate: {
        id: string;
        name: string;
        position: string;
        experience: string;
        education: string;
        skills: string[];
        score: number;
        aiSummary: {
            strengths: string[];
            considerations: string[];
            fitAnalysis: string;
        };
    };
}

export const CandidateInterviewProfile: React.FC<CandidateInterviewProfileProps> = ({
    candidate
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="flex-[0_0_auto]">
            <CardHeader className="card-padding pb-2">
                <CardTitle className="card-header-md flex items-center justify-between">
                    <span>Candidate Profile</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="card-padding pt-0">
                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold mb-2">
                        {candidate.name.charAt(0)}
                    </div>
                    <h2 className="font-semibold">{candidate.name}</h2>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    <div className="mt-2 text-sm">
                        <span className="text-green-600 font-medium">{candidate.score}% </span>
                        <span className="text-muted-foreground">match</span>
                    </div>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        <ScrollArea className="h-[300px] pr-4">
                            {/* Basic Info */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Briefcase className="h-4 w-4 mt-1" />
                                    <div>
                                        <h4 className="text-sm font-medium">Experience</h4>
                                        <p className="text-sm text-muted-foreground">{candidate.experience}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <GraduationCap className="h-4 w-4 mt-1" />
                                    <div>
                                        <h4 className="text-sm font-medium">Education</h4>
                                        <p className="text-sm text-muted-foreground">{candidate.education}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Star className="h-4 w-4 mt-1" />
                                    <div>
                                        <h4 className="text-sm font-medium">Key Skills</h4>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {candidate.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-0.5 bg-muted text-xs rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            <div className="mt-4 border-t pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bot className="h-4 w-4 text-blue-500" />
                                    <h4 className="font-medium text-sm">AI Summary</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="text-xs font-medium text-green-600 mb-1">Strengths</h5>
                                        <ul className="text-sm space-y-1">
                                            {candidate.aiSummary.strengths.map((strength, index) => (
                                                <li key={index} className="text-muted-foreground text-sm">
                                                    • {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-medium text-yellow-600 mb-1">Areas to Explore</h5>
                                        <ul className="text-sm space-y-1">
                                            {candidate.aiSummary.considerations.map((item, index) => (
                                                <li key={index} className="text-muted-foreground text-sm">
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-medium text-blue-600 mb-1">Fit Analysis</h5>
                                        <p className="text-sm text-muted-foreground">
                                            {candidate.aiSummary.fitAnalysis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => window.location.href = `/candidate/${candidate.id}`}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Profile
                </Button>
            </CardContent>
        </Card>
    );
}; 