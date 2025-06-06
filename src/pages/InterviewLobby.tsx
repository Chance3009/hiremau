import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Calendar, Clock, Users, VideoIcon } from "lucide-react";

const InterviewLobby = () => {
    const [view, setView] = useState<'my-interviews' | 'instant'>('my-interviews');

    // Mock data for interviews
    const myInterviews = [
        {
            id: '1',
            candidate: {
                name: 'Alex Johnson',
                position: 'Frontend Developer',
                email: 'alex@example.com'
            },
            date: '2024-03-20',
            time: '10:00',
            duration: 45,
            status: 'upcoming',
            interviewer: 'John Doe',
            room: 'Meeting Room 1'
        },
        {
            id: '2',
            candidate: {
                name: 'Sarah Chen',
                position: 'Backend Developer',
                email: 'sarah@example.com'
            },
            date: '2024-03-20',
            time: '14:00',
            duration: 60,
            status: 'upcoming',
            interviewer: 'Emma Wilson',
            room: 'Meeting Room 2'
        }
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Interview Hub</h1>
                <p className="text-muted-foreground">
                    Manage your interviews and conduct instant interviews with AI assistance
                </p>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as 'my-interviews' | 'instant')} className="w-full">
                <TabsList>
                    <TabsTrigger value="my-interviews">
                        <Calendar className="h-4 w-4 mr-2" />
                        My Interviews
                    </TabsTrigger>
                    <TabsTrigger value="instant">
                        <Bot className="h-4 w-4 mr-2" />
                        Instant Interview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-interviews" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Interviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-4">
                                    {myInterviews.map((interview) => (
                                        <Card key={interview.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{interview.candidate.name}</h3>
                                                            <Badge variant="secondary">{interview.candidate.position}</Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{interview.candidate.email}</p>
                                                    </div>
                                                    <Button>
                                                        <VideoIcon className="h-4 w-4 mr-2" />
                                                        Start Interview
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div className="space-y-2">
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Date:</span>{' '}
                                                            <span className="font-medium">{interview.date}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Time:</span>{' '}
                                                            <span className="font-medium">{interview.time}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Duration:</span>{' '}
                                                            <span className="font-medium">{interview.duration} minutes</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Interviewer:</span>{' '}
                                                            <span className="font-medium">{interview.interviewer}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Room:</span>{' '}
                                                            <span className="font-medium">{interview.room}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="instant" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Start Instant Interview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Bot className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div className="text-sm text-blue-700">
                                            <p className="font-medium">AI Interview Assistant</p>
                                            <p>Conduct interviews with real-time insights, suggested questions, and automated note-taking.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Candidate Name</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 p-2 border rounded-md"
                                            placeholder="Enter candidate name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Position</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 p-2 border rounded-md"
                                            placeholder="Enter position"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Duration</label>
                                        <select className="w-full mt-1 p-2 border rounded-md">
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                        </select>
                                    </div>
                                </div>

                                <Button className="w-full">
                                    <VideoIcon className="h-4 w-4 mr-2" />
                                    Start Instant Interview
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InterviewLobby; 