import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users, Clock, CheckCircle2, TrendingUp,
    Brain, Calendar, MapPin, UserCheck, Timer,
    Activity, Target, Zap, RefreshCw, Download,
    BarChart3, ArrowRight, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/config/constants';

const EventOps = () => {
    const [selectedEvent, setSelectedEvent] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentEvent, setCurrentEvent] = useState({
        name: '',
        date: '',
        location: '',
        status: 'active',
        progress: 0,
        totalCandidates: 0,
        screened: 0,
        interviewed: 0,
        hired: 0,
        avgWaitTime: 0,
        aiAccuracy: 94.2,
    });

    // Fetch events list
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/active/list`);
                if (response.ok) {
                    const eventsData = await response.json();
                    setEvents(eventsData);

                    if (eventsData.length > 0) {
                        setSelectedEvent(eventsData[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Fetch event data when selected event changes
    useEffect(() => {
        const fetchEventData = async () => {
            if (selectedEvent) {
                try {
                    const [eventRes, registrationsRes] = await Promise.all([
                        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${selectedEvent}`),
                        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${selectedEvent}/registrations`)
                    ]);

                    if (eventRes.ok) {
                        const event = await eventRes.json();
                        let registrations = [];

                        if (registrationsRes.ok) {
                            registrations = await registrationsRes.json();
                        }

                        const totalCandidates = registrations.length || 0;

                        setCurrentEvent({
                            name: event.title,
                            date: event.date,
                            location: event.location,
                            status: event.status || 'active',
                            progress: Math.min(Math.floor((totalCandidates / (event.positions || 100)) * 100), 100),
                            totalCandidates,
                            screened: Math.floor(totalCandidates * 0.8),
                            interviewed: Math.floor(totalCandidates * 0.3),
                            hired: Math.floor(totalCandidates * 0.08),
                            avgWaitTime: 18,
                            aiAccuracy: 94.2,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching event data:', error);
                }
            }
        };

        fetchEventData();
    }, [selectedEvent]);

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

    const hourlyData = [
        { hour: '9AM', count: 12 },
        { hour: '10AM', count: 28 },
        { hour: '11AM', count: 35 },
        { hour: '12PM', count: 42 },
        { hour: '1PM', count: 38 },
        { hour: '2PM', count: 45 },
        { hour: '3PM', count: 52 },
        { hour: '4PM', count: 48 }
    ];

    const maxHourlyCount = Math.max(...hourlyData.map(d => d.count));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Event Operations Dashboard</h1>
                    <p className="text-muted-foreground">Real-time monitoring and analytics for your recruitment events</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id}>
                                    {event.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Hourly Activity
                        </CardTitle>
                        <CardDescription>
                            Candidate registration throughout the day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {hourlyData.map((data, index) => (
                                <div key={data.hour} className="flex items-center gap-4">
                                    <div className="w-12 text-sm font-medium">{data.hour}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-sm text-muted-foreground">Candidates</div>
                                            <div className="text-sm font-medium">{data.count}</div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-blue-600"
                                                style={{ width: `${(data.count / maxHourlyCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-green-800">High AI Accuracy</div>
                                <div className="text-sm text-green-600">
                                    AI screening is performing exceptionally well at {currentEvent.aiAccuracy}% accuracy.
                                    This is saving an estimated 15 hours of manual screening time.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                            <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Optimize Wait Times</div>
                                <div className="text-sm text-blue-600">
                                    Peak activity between 2-4 PM. Consider adding 2 more interview slots
                                    to reduce wait times from {currentEvent.avgWaitTime}m to ~12m.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
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

export default EventOps; 