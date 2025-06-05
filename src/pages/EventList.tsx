import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, Users, Clock, TrendingUp, Search, LayoutGrid, Plus, ArrowRight, Building2, MapPin, List, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for events
const events = [
    {
        id: '1',
        title: 'UPM Career Fair 2025',
        date: '2025-03-15',
        time: '09:00 AM - 05:00 PM',
        location: 'UPM Convention Center',
        company: 'University of Putra Malaysia',
        status: 'upcoming',
        registrations: 145,
        positions: 12,
        interviews: 0
    },
    {
        id: '2',
        title: 'Tech Recruit Summit',
        date: '2025-03-20',
        time: '10:00 AM - 04:00 PM',
        location: 'KL Convention Centre',
        company: 'Tech Malaysia Association',
        status: 'upcoming',
        registrations: 89,
        positions: 8,
        interviews: 0
    },
    {
        id: '3',
        title: 'Engineering Talent Day',
        date: '2025-03-25',
        time: '09:30 AM - 03:30 PM',
        location: 'Sunway University',
        company: 'Sunway Group',
        status: 'draft',
        registrations: 0,
        positions: 5,
        interviews: 0
    }
];

const stats = [
    {
        title: 'Total Events',
        value: '15',
        trend: '+3',
        trendLabel: 'vs last month',
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
    },
    {
        title: 'Registrations',
        value: '234',
        trend: '+45',
        trendLabel: 'this week',
        icon: <Users className="h-4 w-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
    },
    {
        title: 'Avg. Duration',
        value: '6.5h',
        trend: '-0.5h',
        trendLabel: 'vs average',
        icon: <Clock className="h-4 w-4" />,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50'
    },
    {
        title: 'Success Rate',
        value: '78%',
        trend: '+5%',
        trendLabel: 'vs target',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
    }
];

const EventList = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-green-50 text-green-600';
            case 'ongoing':
                return 'bg-blue-50 text-blue-600';
            case 'completed':
                return 'bg-gray-50 text-gray-600';
            case 'draft':
                return 'bg-amber-50 text-amber-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="h-[calc(100vh-1rem)] flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="page-title">Events</h1>
                    <p className="page-subtitle">Manage and monitor recruitment events</p>
                </div>
                <Button onClick={() => navigate('/event-setup')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-2 rounded-md", stat.bgColor)}>
                                    {stat.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="stat-label truncate">{stat.title}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="stat-value">{stat.value}</p>
                                        <div className={cn(
                                            "flex items-center text-xs",
                                            stat.trend.startsWith('+') ? "text-green-500" : "text-red-500"
                                        )}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <p className="stat-label">{stat.trendLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and View Toggle */}
            <div className="flex justify-between items-center gap-4 shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Events List */}
            <ScrollArea className="flex-1 -mx-4 px-4">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {filteredEvents.map((event) => (
                            <Card key={event.id} className="group relative hover:shadow-lg transition-all">
                                {/* Quick Actions Overlay */}
                                <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button size="icon" variant="secondary" className="h-8 w-8">
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="h-8 w-8">
                                        <Users className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="h-8 w-8">
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardHeader className="p-6">
                                    <div className="flex flex-col gap-3">
                                        <Badge className={cn("w-fit capitalize", getStatusColor(event.status))}>
                                            {event.status}
                                        </Badge>
                                        <div className="space-y-1.5">
                                            <CardTitle className="text-xl font-semibold line-clamp-1">
                                                {event.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1 flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                {event.company}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 pt-0 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                                                <Calendar className="h-4 w-4" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {event.time}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 py-3 border-t">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{event.registrations}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Registrations</p>
                                        </div>
                                        <div className="text-center border-x">
                                            <p className="text-2xl font-bold text-primary">{event.positions}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Positions</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{event.interviews}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Interviews</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={() => navigate(`/event-dashboard/${event.id}`)}
                                        >
                                            View Dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="h-full">
                        <ScrollArea className="h-full">
                            <div className="divide-y">
                                {filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={cn("p-2 rounded-md", getStatusColor(event.status))}>
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{event.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{event.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate">{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="grid grid-cols-3 gap-8 px-4 border-l">
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold">{event.registrations}</p>
                                                    <p className="text-xs text-muted-foreground">Registrations</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold">{event.positions}</p>
                                                    <p className="text-xs text-muted-foreground">Positions</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold">{event.interviews}</p>
                                                    <p className="text-xs text-muted-foreground">Interviews</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/event-dashboard/${event.id}`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </Card>
                )}
                <ScrollBar />
            </ScrollArea>
        </div>
    );
};

export default EventList; 