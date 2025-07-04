import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users, Clock, CheckCircle2, AlertTriangle, TrendingUp,
    Brain, Calendar, MapPin, UserCheck, Award, Timer,
    Activity, BarChart3, Target, Zap, RefreshCw, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const EventOperationsDashboard = () => {
    const [selectedEvent, setSelectedEvent] = useState('upm-career-fair');
    const [timeRange, setTimeRange] = useState('today');

    // Mock data for the demo
    const eventData = {
        'upm-career-fair': {
            name: 'UPM Career Fair 2025',
            date: '2024-03-20',
            location: 'UPM Student Center',
            status: 'active',
            progress: 65,
            totalCandidates: 156,
            screened: 98,
            interviewed: 45,
            hired: 12,
            avgWaitTime: 18,
            currentQueue: 8,
            aiAccuracy: 94.2,
            positions: ['Frontend Developer', 'Backend Developer', 'Data Scientist', 'Product Manager']
        },
        'tech-summit': {
            name: 'Tech Summit 2024',
            date: '2024-03-15',
            location: 'KLCC Convention Center',
            status: 'completed',
            progress: 100,
            totalCandidates: 234,
            screened: 234,
            interviewed: 89,
            hired: 23,
            avgWaitTime: 22,
            currentQueue: 0,
            aiAccuracy: 96.8,
            positions: ['Full Stack Developer', 'DevOps Engineer', 'Tech Lead']
        }
    };

    const currentEvent = eventData[selectedEvent];

    const realTimeMetrics = [
        {
            title: 'Total Candidates',
            value: currentEvent.totalCandidates,
            change: '+23',
            changeType: 'increase',
            icon: <Users className="h-5 w-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'AI Screened',
            value: currentEvent.screened,
            change: `${currentEvent.aiAccuracy}%`,
            changeType: 'accuracy',
            icon: <Brain className="h-5 w-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Interviewed',
            value: currentEvent.interviewed,
            change: 'Live',
            changeType: 'active',
            icon: <UserCheck className="h-5 w-5" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Avg Wait Time',
            value: `${currentEvent.avgWaitTime}m`,
            change: '-5m',
            changeType: 'decrease',
            icon: <Clock className="h-5 w-5" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    const pipelineData = [
        { stage: 'Registered', count: currentEvent.totalCandidates, color: '#3b82f6' },
        { stage: 'AI Screened', count: currentEvent.screened, color: '#10b981' },
        { stage: 'Interviewed', count: currentEvent.interviewed, color: '#8b5cf6' },
        { stage: 'Hired', count: currentEvent.hired, color: '#f59e0b' }
    ];

    const hourlyData = [
        { hour: '9AM', candidates: 12, interviews: 3 },
        { hour: '10AM', candidates: 18, interviews: 8 },
        { hour: '11AM', candidates: 24, interviews: 12 },
        { hour: '12PM', candidates: 19, interviews: 15 },
        { hour: '1PM', candidates: 15, interviews: 10 },
        { hour: '2PM', candidates: 22, interviews: 18 },
        { hour: '3PM', candidates: 28, interviews: 22 },
        { hour: '4PM', candidates: 18, interviews: 14 }
    ];

    const positionDistribution = [
        { name: 'Frontend Dev', value: 35, color: '#3b82f6' },
        { name: 'Backend Dev', value: 28, color: '#10b981' },
        { name: 'Data Scientist', value: 22, color: '#8b5cf6' },
        { name: 'Product Manager', value: 15, color: '#f59e0b' }
    ];

    const getChangeIcon = (changeType) => {
        switch (changeType) {
            case 'increase':
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'decrease':
                return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
            case 'active':
                return <Activity className="h-3 w-3 text-blue-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Event Operations Dashboard</h1>
                    <p className="text-muted-foreground">Real-time monitoring and analytics for your recruitment events</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="upm-career-fair">UPM Career Fair 2025</SelectItem>
                            <SelectItem value="tech-summit">Tech Summit 2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Event Status Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{currentEvent.name}</h2>
                                <Badge variant={currentEvent.status === 'active' ? 'default' : 'secondary'}>
                                    {currentEvent.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {currentEvent.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {currentEvent.location}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{currentEvent.progress}%</div>
                            <div className="text-sm text-muted-foreground">Event Progress</div>
                            <Progress value={currentEvent.progress} className="w-32 mt-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {realTimeMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-2 rounded-full", metric.bgColor)}>
                                    <div className={metric.color}>
                                        {metric.icon}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getChangeIcon(metric.changeType)}
                                    <span className="text-sm font-medium">{metric.change}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold">{metric.value}</div>
                                <div className="text-sm text-muted-foreground">{metric.title}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pipeline Flow */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Candidate Pipeline Flow
                    </CardTitle>
                    <CardDescription>
                        Real-time view of candidates moving through your recruitment process
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {pipelineData.map((stage, index) => (
                            <div key={stage.stage} className="relative">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{stage.stage}</span>
                                            <span className="text-2xl font-bold">{stage.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    backgroundColor: stage.color,
                                                    width: `${(stage.count / currentEvent.totalCandidates) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {Math.round((stage.count / currentEvent.totalCandidates) * 100)}% of total candidates
                                        </div>
                                    </div>
                                </div>
                                {index < pipelineData.length - 1 && (
                                    <div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Hourly Activity
                        </CardTitle>
                        <CardDescription>
                            Candidate registration and interview activity throughout the day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="candidates" fill="#3b82f6" name="Candidates" />
                                <Bar dataKey="interviews" fill="#10b981" name="Interviews" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Position Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Position Distribution
                        </CardTitle>
                        <CardDescription>
                            Distribution of candidates across different positions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={positionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {positionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        AI Insights & Recommendations
                    </CardTitle>
                    <CardDescription>
                        Smart recommendations to optimize your recruitment process
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-green-800">High AI Accuracy</div>
                                <div className="text-sm text-green-600">
                                    AI screening is performing exceptionally well at {currentEvent.aiAccuracy}% accuracy.
                                    This is saving an estimated 15 hours of manual screening time.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Optimize Wait Times</div>
                                <div className="text-sm text-blue-600">
                                    Peak activity between 2-4 PM. Consider adding 2 more interview slots
                                    to reduce wait times from {currentEvent.avgWaitTime}m to ~12m.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-purple-800">Strong Pipeline Flow</div>
                                <div className="text-sm text-purple-600">
                                    Conversion rate from screened to interviewed is 46%, which is 23% above industry average.
                                    Great job on candidate quality!
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EventOperationsDashboard; 