import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Calendar,
    Users,
    Clock,
    TrendingUp,
    LayoutGrid,
    Plus,
    Building2,
    MapPin,
    List,
    MoreVertical,
    QrCode,
    ExternalLink,
    Edit,
    Trash2,
    Copy,
    FileDown,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PageHeader } from "@/components/ui/page-header";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/services/eventService';

// Enhanced mock data for events with more realistic information
const eventsData = [
    {
        id: '1',
        title: 'UPM Career Fair 2025',
        date: '2025-03-15',
        startTime: '09:00',
        endTime: '17:00',
        location: 'UPM Convention Center',
        address: 'Universiti Putra Malaysia, Serdang, Selangor',
        company: 'University of Putra Malaysia',
        status: 'upcoming',
        registrations: 145,
        positions: 12,
        interviews: 0,
        description: 'Annual career fair hosting multiple companies and job opportunities for fresh graduates.',
        qrCodeUrl: '/qr/event-1',
        maxCapacity: 500,
        registrationDeadline: '2025-03-10'
    },
    {
        id: '2',
        title: 'Tech Recruit Summit',
        date: '2025-03-20',
        startTime: '10:00',
        endTime: '16:00',
        location: 'KL Convention Centre',
        address: 'Kuala Lumpur Convention Centre, KL',
        company: 'Tech Malaysia Association',
        status: 'upcoming',
        registrations: 89,
        positions: 8,
        interviews: 0,
        description: 'Technology sector recruitment event focusing on software engineering roles.',
        qrCodeUrl: '/qr/event-2',
        maxCapacity: 300,
        registrationDeadline: '2025-03-18'
    },
    {
        id: '3',
        title: 'Engineering Talent Day',
        date: '2025-03-25',
        startTime: '09:30',
        endTime: '15:30',
        location: 'Sunway University',
        address: 'Sunway University, Petaling Jaya',
        company: 'Sunway Group',
        status: 'draft',
        registrations: 0,
        positions: 5,
        interviews: 0,
        description: 'Engineering recruitment event for various engineering disciplines.',
        qrCodeUrl: '/qr/event-3',
        maxCapacity: 200,
        registrationDeadline: '2025-03-22'
    },
    {
        id: '4',
        title: 'Startup Hiring Expo',
        date: '2025-02-28',
        startTime: '11:00',
        endTime: '18:00',
        location: 'KLCC Hall 3',
        address: 'Suria KLCC, Kuala Lumpur',
        company: 'Malaysia Startup Association',
        status: 'completed',
        registrations: 234,
        positions: 15,
        interviews: 45,
        description: 'Connect with innovative startups looking for talented individuals.',
        qrCodeUrl: '/qr/event-4',
        maxCapacity: 400,
        registrationDeadline: '2025-02-25'
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
        title: 'Total Registrations',
        value: '468',
        trend: '+87',
        trendLabel: 'this month',
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
    const [events, setEvents] = useState(eventsData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'draft'>('all');

    const filteredEvents = events.filter(event => {
        if (filterStatus === 'all') return true;
        return event.status === filterStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'ongoing':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'completed':
                return 'bg-gray-50 text-gray-600 border-gray-200';
            case 'draft':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleGenerateQR = (eventId: string) => {
        navigate(`/qr-registration/${eventId}`);
    };

    const handleViewEvent = (eventId: string) => {
        navigate(`/event-dashboard/${eventId}`);
    };

    const handleEditEvent = (eventId: string) => {
        navigate(`/event-setup/${eventId}`);
    };

    const handleCopyLink = (event: any) => {
        const registrationUrl = `${window.location.origin}/register/${event.id}`;
        navigator.clipboard.writeText(registrationUrl);
        // You could add a toast notification here
        console.log('Registration link copied!');
    };

    const handleExportData = (eventId: string) => {
        // Export event data functionality
        console.log('Exporting data for event:', eventId);
    };

    useEffect(() => {
        // Load events from API in real implementation
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Events"
                subtitle="Manage recruiting events and job fairs"
            >
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/analytics/events')}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analytics
                    </Button>
                    <Button onClick={() => navigate('/event-setup')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-md", stat.bgColor)}>
                                    <div className={stat.color}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <div className={cn(
                                            "flex items-center text-xs",
                                            stat.trend.startsWith('+') ? "text-green-500" : "text-red-500"
                                        )}>
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

            {/* Filters and View Toggle */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                    >
                        All ({events.length})
                    </Button>
                    <Button
                        variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('upcoming')}
                    >
                        Upcoming ({events.filter(e => e.status === 'upcoming').length})
                    </Button>
                    <Button
                        variant={filterStatus === 'ongoing' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('ongoing')}
                    >
                        Ongoing ({events.filter(e => e.status === 'ongoing').length})
                    </Button>
                    <Button
                        variant={filterStatus === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('completed')}
                    >
                        Completed ({events.filter(e => e.status === 'completed').length})
                    </Button>
                    <Button
                        variant={filterStatus === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('draft')}
                    >
                        Draft ({events.filter(e => e.status === 'draft').length})
                    </Button>
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

            {/* Events Grid/List */}
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading events...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-6">
                        {filterStatus === 'all'
                            ? "Create your first event to get started"
                            : `No ${filterStatus} events found`}
                    </p>
                    <Button onClick={() => navigate('/event-setup')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </div>
            ) : (
                <div className={cn(
                    viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                )}>
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-all duration-200 group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-lg">{event.title}</CardTitle>
                                            <Badge variant="outline" className={getStatusColor(event.status)}>
                                                {event.status}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-sm line-clamp-2">
                                            {event.description}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleViewEvent(event.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Event
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleGenerateQR(event.id)}>
                                                <QrCode className="mr-2 h-4 w-4" />
                                                QR Registration
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCopyLink(event)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExportData(event.id)}>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Export Data
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {/* Date and Time */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDate(event.date)}</span>
                                        <span className="text-muted-foreground">
                                            {event.startTime} - {event.endTime}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{event.location}</span>
                                    </div>

                                    {/* Company */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{event.company}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                                        <div className="text-center">
                                            <p className="text-lg font-semibold">{event.registrations}</p>
                                            <p className="text-xs text-muted-foreground">Registered</p>
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

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewEvent(event.id)}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Event
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGenerateQR(event.id)}
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList; 