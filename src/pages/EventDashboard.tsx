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
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate, useParams } from 'react-router-dom';

const EventDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams();

    const eventStats = [
        {
            title: "Total Registrations",
            value: "248",
            icon: <Users className="h-4 w-4" />,
            color: "text-blue-500",
            trend: "+12",
            trendLabel: "vs last event",
            trendUp: true
        },
        {
            title: "Check-ins",
            value: "186",
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-green-500",
            trend: "75%",
            trendLabel: "attendance rate",
            trendUp: true
        },
        {
            title: "Avg Wait Time",
            value: "12m",
            icon: <Clock className="h-4 w-4" />,
            color: "text-amber-500",
            trend: "-3m",
            trendLabel: "vs target",
            trendUp: true
        },
        {
            title: "Interviews Done",
            value: "142",
            icon: <MessageSquare className="h-4 w-4" />,
            color: "text-purple-500",
            trend: "76%",
            trendLabel: "completion rate",
            trendUp: true
        }
    ];

    const positionStats = [
        {
            position: "Software Engineer",
            slots: 15,
            registered: 45,
            interviewed: 32,
            shortlisted: 12
        },
        {
            position: "Product Manager",
            slots: 8,
            registered: 28,
            interviewed: 22,
            shortlisted: 6
        },
        {
            position: "UX Designer",
            slots: 5,
            registered: 18,
            interviewed: 15,
            shortlisted: 4
        }
    ];

    const timelineData = [
        { time: '9:00', interviews: 0, satisfaction: 0 },
        { time: '10:00', interviews: 15, satisfaction: 85 },
        { time: '11:00', interviews: 25, satisfaction: 88 },
        { time: '12:00', interviews: 18, satisfaction: 82 },
        { time: '13:00', interviews: 12, satisfaction: 85 },
        { time: '14:00', interviews: 28, satisfaction: 90 },
        { time: '15:00', interviews: 20, satisfaction: 87 },
        { time: '16:00', interviews: 15, satisfaction: 86 }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={mockEvent.name}
                subtitle={`${mockEvent.startDate} - ${mockEvent.endDate}`}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/events')}>
                        Back to Events
                    </Button>
                    <Button onClick={() => navigate('/event/setup')}>
                        Edit Event
                    </Button>
                </div>
            </PageHeader>

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
                                        <p className="text-2xl font-bold">{stat.value}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="p-6">
                        <CardTitle>Position Overview</CardTitle>
                        <CardDescription>Registration and interview progress by position</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            {positionStats.map((position, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{position.position}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {position.slots} open positions • {position.registered} registered
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-sm font-medium">{position.interviewed}</p>
                                                <p className="text-xs text-muted-foreground">Interviewed</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">{position.shortlisted}</p>
                                                <p className="text-xs text-muted-foreground">Shortlisted</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-blue-100 h-2 rounded-full" style={{ width: `${(position.interviewed / position.registered) * 100}%` }} />
                                        <div className="bg-green-100 h-2 rounded-full" style={{ width: `${(position.shortlisted / position.registered) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="p-6">
                        <CardTitle>Queue Status</CardTitle>
                        <CardDescription>Current waiting times and interview queue</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Average Wait</span>
                                        <span className="text-2xl font-bold">25m</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Active Interviews</span>
                                        <span className="text-2xl font-bold">3</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">In Queue</span>
                                        <span className="text-2xl font-bold">8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="p-6">
                        <CardTitle>Event Timeline</CardTitle>
                        <CardDescription>Interview and satisfaction trends over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="h-[240px]">
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
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Peak Time</span>
                                <span className="text-sm font-semibold">14:00 (28)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Avg Satisfaction</span>
                                <span className="text-sm font-semibold text-green-600">86.2%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EventDashboard; 