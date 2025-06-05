import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    Briefcase,
    Code,
    Globe,
    Flag
} from 'lucide-react';

interface CandidateBriefingProps {
    candidate: {
        name: string;
        skills: string[];
        experience: string[];
        education: string[];
        onlinePresence?: {
            linkedin?: string;
            github?: string;
            portfolio?: string;
        };
    };
    evaluation: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        flags: {
            green: string[];
            red: string[];
        };
    };
    jobTitle: string;
}

const CandidateBriefing: React.FC<CandidateBriefingProps> = ({
    candidate,
    evaluation,
    jobTitle,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Candidate Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Experience
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {candidate.experience.map((exp, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    {exp}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Education
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {candidate.education.map((edu, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    {edu}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {candidate.onlinePresence && (
                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Online Presence
                            </h3>
                            <div className="space-y-1 text-sm">
                                {candidate.onlinePresence.linkedin && (
                                    <a
                                        href={candidate.onlinePresence.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline block"
                                    >
                                        LinkedIn Profile
                                    </a>
                                )}
                                {candidate.onlinePresence.github && (
                                    <a
                                        href={candidate.onlinePresence.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline block"
                                    >
                                        GitHub Profile
                                    </a>
                                )}
                                {candidate.onlinePresence.portfolio && (
                                    <a
                                        href={candidate.onlinePresence.portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline block"
                                    >
                                        Portfolio Website
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium mb-2">Initial Fit Score</h3>
                        <div className="space-y-2">
                            <Progress value={evaluation.score} className="w-full" />
                            <p className="text-sm text-muted-foreground">
                                {evaluation.score}% match for {jobTitle}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Strengths</h3>
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
                            <h3 className="text-sm font-medium mb-2">Areas to Probe</h3>
                            <ul className="space-y-2">
                                {evaluation.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Flags
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-medium text-green-600 mb-1">Green Flags</h4>
                                <ul className="space-y-1">
                                    {evaluation.flags.green.map((flag, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-red-600 mb-1">Red Flags</h4>
                                <ul className="space-y-1">
                                    {evaluation.flags.red.map((flag, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CandidateBriefing; 