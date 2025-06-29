import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Clock, CheckCircle, AlertTriangle, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const HiringManagerDashboard = () => {
    const navigate = useNavigate();

    const teamMetrics = [
        {
            title: "Open Positions",
            value: "4",
            change: "2 urgent",
            icon: <Users className="h-5 w-5" />,
            color: "text-blue-500 bg-blue-50"
        },
        {
            title: "Shortlisted",
            value: "12",
            change: "8 highly matched",
            icon: <Star className="h-5 w-5" />,
            color: "text-amber-500 bg-amber-50"
        },
        {
            title: "Time to Hire",
            value: "18d",
            change: "-5 days vs avg",
            icon: <Clock className="h-5 w-5" />,
            color: "text-green-500 bg-green-50"
        }
    ];

    const pendingReviews = [
        {
            name: "Alex Chen",
            position: "Senior Developer",
            score: 92,
            status: "urgent",
            skills: ["React", "Node.js", "AWS"]
        },
        {
            name: "Sarah Miller",
            position: "Product Designer",
            score: 88,
            status: "new",
            skills: ["UI/UX", "Figma", "User Research"]
        }
    ];

    const teamInsights = [
        {
            title: "Skills Coverage",
            description: "Current team skill distribution",
            data: [
                { skill: "Frontend", coverage: 85 },
                { skill: "Backend", coverage: 70 },
                { skill: "DevOps", coverage: 45 }
            ]
        },
        {
            title: "Hiring Progress",
            description: "Status across all positions",
            data: [
                { stage: "Screening", count: 25 },
                { stage: "Technical", count: 12 },
                { stage: "Final", count: 5 }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Dashboard</h1>
                    <p className="text-muted-foreground">Recruitment progress and team insights</p>
                </div>
                <Button onClick={() => navigate('/interview')}>
                    Review Candidates
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teamMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{metric.change}</p>
                                </div>
                                <div className={`p-3 rounded-full ${metric.color}`}>
                                    {metric.icon}
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
                            <CardTitle className="text-lg font-semibold">Pending Reviews</CardTitle>
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Candidates requiring your attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingReviews.map((candidate, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{candidate.name}</p>
                                            <p className="text-sm text-muted-foreground">{candidate.position}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${candidate.status === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {candidate.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-medium">{candidate.score}% match</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.map((skill, skillIndex) => (
                                            <span key={skillIndex} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Team Insights</CardTitle>
                            <BarChart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Current team composition and hiring progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {teamInsights.map((insight, index) => (
                                <div key={index} className="space-y-2">
                                    <div>
                                        <p className="font-medium">{insight.title}</p>
                                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {insight.data.map((item: any, itemIndex) => (
                                            <div key={itemIndex} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{item.skill || item.stage}</span>
                                                    <span>{item.coverage ? `${item.coverage}%` : `${item.count} candidates`}</span>
                                                </div>
                                                {item.coverage && <Progress value={item.coverage} className="h-2" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HiringManagerDashboard; 