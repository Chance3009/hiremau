import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Brain, FileSearch, MessageSquare, Calendar, Briefcase } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const HRDashboard = () => {
    const navigate = useNavigate();

    const aiInsights = [
        {
            title: "Active Screening Sessions",
            value: "12",
            change: "+3 from last week",
            icon: <Brain className="h-4 w-4" />,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            trend: "+3",
            trendLabel: "from last week",
            trendUp: true
        },
        {
            title: "AI-Verified Candidates",
            value: "45",
            change: "98% accuracy rate",
            icon: <FileSearch className="h-4 w-4" />,
            color: "text-green-500",
            bgColor: "bg-green-50",
            trend: "98%",
            trendLabel: "accuracy rate",
            trendUp: true
        },
        {
            title: "Interview Assistance",
            value: "28",
            change: "4.8/5 feedback score",
            icon: <MessageSquare className="h-4 w-4" />,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
            trend: "4.8",
            trendLabel: "feedback score",
            trendUp: true
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
                    <h1 className="text-2xl font-bold">HR Dashboard</h1>
                    <p className="text-muted-foreground">AI-powered recruitment insights and activities</p>
                </div>
                <Button onClick={() => navigate('/candidate-intake')}>
                    New Screening
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.map((insight, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2.5 rounded-lg", insight.bgColor)}>
                                    {insight.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground truncate">{insight.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">{insight.value}</p>
                                        <div className={cn(
                                            "flex items-center text-xs font-medium",
                                            insight.trendUp ? "text-green-600" : "text-red-600"
                                        )}>
                                            {insight.trend}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{insight.trendLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="p-6">
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Scheduled recruitment events and progress</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="space-y-3">
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
                    <CardHeader className="p-6">
                        <CardTitle>Active Positions</CardTitle>
                        <CardDescription>Current openings and candidate matches</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            {activePositions.map((position, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex items-center justify-between">
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
                                    <Progress
                                        value={(position.matches / position.candidates) * 100}
                                        className="h-2"
                                    />
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