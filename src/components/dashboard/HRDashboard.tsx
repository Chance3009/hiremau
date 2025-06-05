import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Brain, FileSearch, MessageSquare, Calendar, Briefcase } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const HRDashboard = () => {
    const navigate = useNavigate();

    const aiInsights = [
        {
            title: "Active Screening Sessions",
            value: "12",
            change: "+3 from last week",
            icon: <Brain className="h-5 w-5" />,
            color: "text-blue-500 bg-blue-50"
        },
        {
            title: "AI-Verified Candidates",
            value: "45",
            change: "98% accuracy rate",
            icon: <FileSearch className="h-5 w-5" />,
            color: "text-green-500 bg-green-50"
        },
        {
            title: "Interview Assistance",
            value: "28",
            change: "4.8/5 feedback score",
            icon: <MessageSquare className="h-5 w-5" />,
            color: "text-purple-500 bg-purple-50"
        }
    ];

    const upcomingEvents = [
        {
            title: "Tech Career Fair",
            date: "Mar 15, 2024",
            candidates: 50,
            progress: 65
        },
        {
            title: "Graduate Recruitment",
            date: "Mar 20, 2024",
            candidates: 75,
            progress: 40
        }
    ];

    const activePositions = [
        {
            title: "Senior Software Engineer",
            candidates: 28,
            matches: 12,
            deadline: "5 days"
        },
        {
            title: "Product Manager",
            candidates: 34,
            matches: 15,
            deadline: "7 days"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
                    <p className="text-muted-foreground">AI-powered recruitment insights and activities</p>
                </div>
                <Button onClick={() => navigate('/candidate-intake')}>
                    New Screening
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                                    <p className="text-2xl font-bold mt-1">{insight.value}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{insight.change}</p>
                                </div>
                                <div className={`p-3 rounded-full ${insight.color}`}>
                                    {insight.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Scheduled recruitment events and progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{event.candidates} candidates</p>
                                        </div>
                                    </div>
                                    <Progress value={event.progress} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Active Positions</CardTitle>
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Current openings and candidate matches</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activePositions.map((position, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{position.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {position.candidates} candidates, {position.matches} matches
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        {position.deadline} left
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HRDashboard; 