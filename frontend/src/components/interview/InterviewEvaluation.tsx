import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface InterviewEvaluationProps {
    candidate: {
        id: string;
        name: string;
        position: string;
    };
}

const InterviewEvaluation: React.FC<InterviewEvaluationProps> = ({ candidate }) => {
    return (
        <div className="h-full p-4">
            <ScrollArea className="h-full">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Assessment</CardTitle>
                            <CardDescription>Rate the candidate's overall performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Recommendation</Label>
                                    <RadioGroup defaultValue="consider" className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="hire" id="hire" />
                                            <Label htmlFor="hire" className="flex items-center gap-2">
                                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                                Hire
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="consider" id="consider" />
                                            <Label htmlFor="consider" className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                Consider
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="reject" id="reject" />
                                            <Label htmlFor="reject" className="flex items-center gap-2">
                                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                                Reject
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label>Summary</Label>
                                    <Textarea
                                        placeholder="Provide a brief summary of your evaluation..."
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Skills</CardTitle>
                            <CardDescription>Evaluate technical competencies</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Problem Solving</Label>
                                    <RadioGroup defaultValue="3" className="mt-2 flex gap-4">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div key={value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={value.toString()} id={`problem-solving-${value}`} />
                                                <Label htmlFor={`problem-solving-${value}`}>{value}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div>
                                    <Label>Technical Knowledge</Label>
                                    <RadioGroup defaultValue="3" className="mt-2 flex gap-4">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div key={value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={value.toString()} id={`technical-${value}`} />
                                                <Label htmlFor={`technical-${value}`}>{value}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label>Comments</Label>
                                    <Textarea
                                        placeholder="Add comments about technical skills..."
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Soft Skills</CardTitle>
                            <CardDescription>Evaluate communication and interpersonal skills</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Communication</Label>
                                    <RadioGroup defaultValue="3" className="mt-2 flex gap-4">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div key={value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={value.toString()} id={`communication-${value}`} />
                                                <Label htmlFor={`communication-${value}`}>{value}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div>
                                    <Label>Cultural Fit</Label>
                                    <RadioGroup defaultValue="3" className="mt-2 flex gap-4">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div key={value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={value.toString()} id={`cultural-${value}`} />
                                                <Label htmlFor={`cultural-${value}`}>{value}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label>Comments</Label>
                                    <Textarea
                                        placeholder="Add comments about soft skills..."
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline">Save Draft</Button>
                        <Button>Submit Evaluation</Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default InterviewEvaluation; 