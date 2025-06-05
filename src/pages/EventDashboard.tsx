import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle2, AlertTriangle, Timer, Activity, MessageSquare, ArrowUp, ArrowDown, UserCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import CheckInQueue from '@/components/event/CheckInQueue';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const EventDashboard: React.FC = () => {
    const eventStats = [
        {
            title: "Check-ins",
            value: 45,
            trend: "+12",
            trendLabel: "last hour",
            icon: <Users className="h-4 w-4" />,
            color: "text-blue-500",
            trendUp: true
        },
        {
            title: "Wait Time",
            value: "25m",
            trend: "-5m",
            trendLabel: "vs morning",
            icon: <Clock className="h-4 w-4" />,
            color: "text-amber-500",
            trendUp: false
        },
        {
            title: "Completed",
            value: "65%",
            trend: "+5%",
            trendLabel: "vs target",
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-green-500",
            trendUp: true
        },
        {
            title: "No Shows",
            value: "7%",
            trend: "-2%",
            trendLabel: "vs avg",
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-red-500",
            trendUp: false
        }
    ];

    const timelineData = [
        { time: '9:00', interviews: 5, waitTime: 15, satisfaction: 90 },
        { time: '10:00', interviews: 8, waitTime: 20, satisfaction: 85 },
        { time: '11:00', interviews: 12, waitTime: 25, satisfaction: 82 },
        { time: '12:00', interviews: 7, waitTime: 30, satisfaction: 78 },
        { time: '13:00', interviews: 10, waitTime: 22, satisfaction: 88 },
        { time: '14:00', interviews: 15, waitTime: 18, satisfaction: 92 },
    ];

    const upcomingInterviews = [
        { time: '14:30', candidate: 'John Doe', interviewer: 'Sarah Smith', room: 'Room A', status: 'Ready' },
        { time: '14:45', candidate: 'Jane Smith', interviewer: 'Mike Johnson', room: 'Room B', status: 'Waiting' },
        { time: '15:00', candidate: 'Alex Brown', interviewer: 'Lisa Davis', room: 'Room C', status: 'Preparing' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">UPM Career Fair 2025</h1>
                    <p className="text-sm text-muted-foreground">Real-time event monitoring and management</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-7 px-3">
                        <Timer className="w-4 h-4 mr-2" />
                        5h 23m Remaining
                    </Badge>
                    <Badge variant="default" className="h-7 px-3 bg-green-600">
                        <Activity className="w-4 h-4 mr-2" />
                        Live
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventStats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2.5 rounded-lg bg-primary/10", stat.color)}>
                                    {stat.icon}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                                        <div className={cn(
                                            "flex items-center text-xs font-medium",
                                            stat.trendUp ? "text-green-600" : "text-red-600"
                                        )}>
                                            {stat.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{stat.trendLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="col-span-1">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-semibold">Real-time Queue</CardTitle>
                        <CardDescription>Current check-in and interview queue status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">Check-in & Queue</h3>
                                    <p className="text-sm text-muted-foreground">Manage candidate check-ins and interview queue</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xl font-semibold">2</span>
                                        <span className="text-sm text-muted-foreground">in queue</span>
                                    </div>
                                    <Button variant="default" size="sm" className="gap-2">
                                        <Users className="h-4 w-4" />
                                        Check-in Candidate
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium">Current Queue</h4>
                                        <p className="text-sm text-muted-foreground">Candidates waiting for interviews</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search candidates..." className="pl-8" />
                                    </div>
                                    <ScrollArea className="h-[240px] pr-4">
                                        <div className="space-y-2">
                                            {/* Queue items */}
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">Alex Johnson</p>
                                                            <p className="text-sm text-muted-foreground">Frontend Developer</p>
                                                        </div>
                                                        <Badge variant="secondary">interviewing</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Checked in at 09:30 AM</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">Sarah Wilson</p>
                                                            <p className="text-sm text-muted-foreground">UX Designer</p>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">~30 min wait</div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Checked in at 09:45 AM</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </ScrollArea>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium">Queue Statistics</h4>
                                        <p className="text-sm text-muted-foreground">Real-time queue metrics</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">Average Wait Time</span>
                                                    <span className="text-2xl font-bold">25m</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">Active Interviews</span>
                                                    <span className="text-2xl font-bold">3</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">Completed Today</span>
                                                    <span className="text-2xl font-bold">12</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-semibold">Event Timeline</CardTitle>
                        <CardDescription>Interview and satisfaction trends over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 12 }}
                                        stroke="#888"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#888"
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="interviews"
                                        stroke="#8884d8"
                                        name="Interviews"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="satisfaction"
                                        stroke="#82ca9d"
                                        name="Satisfaction %"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Peak Time</span>
                                <span className="text-sm font-semibold">14:00 (15)</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Avg Satisfaction</span>
                                <span className="text-sm font-semibold text-green-600">85.8%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="p-6">
                        <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
                        <CardDescription>Next scheduled interviews and their status</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingInterviews.map((interview, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-2.5 rounded-full">
                                            <UserCheck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">{interview.candidate}</p>
                                            <p className="text-sm text-muted-foreground">{interview.interviewer}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs px-2">{interview.time}</Badge>
                                                <Badge variant="outline" className="text-xs px-2">{interview.room}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="ml-4">
                                        {interview.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EventDashboard; 