import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, Filter, CalendarDays, Users, Star, Brain, MapPin, Building, UserCheck, VideoIcon, Bot, Mail, Phone, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/ui/page-header";

// Mock current user
const currentUser = {
    id: 'john_doe',
    name: 'John Doe',
    role: 'Tech Lead'
};

const mockInterviews = [
    {
        date: '2024-03-20',
        time: '10:00 AM',
        candidateId: '1'
    },
    {
        date: '2024-03-20',
        time: '2:00 PM',
        candidateId: '2'
    }
];

const interviewers: Interviewer[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Senior Engineer',
        availability: [
            {
                day: '2024-03-20',
                slots: [
                    { time: '9:00 AM', status: 'available' },
                    { time: '10:00 AM', status: 'booked' },
                    { time: '11:00 AM', status: 'available' },
                    { time: '1:00 PM', status: 'available' },
                    { time: '2:00 PM', status: 'booked' },
                    { time: '3:00 PM', status: 'available' }
                ]
            }
        ],
        assignedInterviews: mockInterviews
    }
];

// Updated mock data for rooms with context
const rooms: Room[] = [
    // General interview rooms (always available)
    {
        id: 'mr1',
        name: 'Meeting Room 1',
        capacity: 4,
        type: 'general'
    },
    {
        id: 'mr2',
        name: 'Meeting Room 2',
        capacity: 6,
        type: 'general'
    },
    // Event-specific rooms
    {
        id: 'event-r1',
        name: 'Career Fair - Room A',
        capacity: 4,
        type: 'event',
        eventId: 'career-fair-2024',
        availability: ['2024-03-20', '2024-03-21']
    },
    {
        id: 'event-r2',
        name: 'Career Fair - Room B',
        capacity: 4,
        type: 'event',
        eventId: 'career-fair-2024',
        availability: ['2024-03-20', '2024-03-21']
    }
];

// Mock events data
const events = [
    {
        id: 'career-fair-2024',
        name: 'Career Fair 2024',
        dates: ['2024-03-20', '2024-03-21'],
        location: 'Convention Center'
    }
];

// Mock data for screened candidates
const screenedCandidates: Candidate[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        position: 'Frontend Developer',
        email: 'alex@example.com',
        phone: '+1 234-567-8900',
        screeningScore: 85,
        aiMatch: 78,
        status: 'pending',
        availability: ['Monday', 'Wednesday', 'Friday'],
        preferredTime: 'Morning',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: '5 years'
    },
    {
        id: '2',
        name: 'Sarah Chen',
        position: 'Backend Developer',
        email: 'sarah@example.com',
        phone: '+1 234-567-8901',
        screeningScore: 92,
        aiMatch: 85,
        status: 'scheduled',
        availability: ['Tuesday', 'Thursday'],
        preferredTime: 'Afternoon',
        skills: ['Python', 'Django', 'PostgreSQL'],
        experience: '7 years',
        scheduledInterview: {
            date: '2024-03-20',
            time: '10:00',
            interviewer: 'john_doe',
            room: 'mr1'
        }
    },
    {
        id: '3',
        name: 'Michael Park',
        position: 'Full Stack Developer',
        email: 'michael@example.com',
        phone: '+1 234-567-8902',
        screeningScore: 88,
        aiMatch: 82,
        status: 'pending',
        availability: ['Monday', 'Wednesday', 'Friday'],
        preferredTime: 'Afternoon',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        experience: '4 years'
    },
    {
        id: '4',
        name: 'Emma Wilson',
        position: 'Frontend Developer',
        email: 'emma@example.com',
        phone: '+1 234-567-8903',
        screeningScore: 90,
        aiMatch: 88,
        status: 'scheduled',
        availability: ['Monday', 'Tuesday', 'Wednesday'],
        preferredTime: 'Morning',
        skills: ['React', 'Vue.js', 'CSS', 'UI/UX'],
        experience: '3 years',
        scheduledInterview: {
            date: '2024-03-20',
            time: '14:00',
            interviewer: 'john_doe',
            room: 'mr2'
        }
    }
];

interface Candidate {
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    screeningScore: number;
    aiMatch: number;
    status: 'pending' | 'scheduled';
    availability: string[];
    preferredTime: string;
    skills: string[];
    experience: string;
    scheduledInterview?: {
        date: string;
        time: string;
        interviewer: string;
        room: string;
    };
}

interface TimeSlot {
    time: string;
    status: 'available' | 'booked' | 'unavailable';
}

interface Interviewer {
    id: string;
    name: string;
    role: string;
    availability: Array<{
        day: string;
        slots: TimeSlot[];
    }>;
    assignedInterviews: Array<{
        date: string;
        time: string;
        candidateId: string;
    }>;
}

interface Room {
    id: string;
    name: string;
    capacity: number;
    type: 'general' | 'event';
    eventId?: string;
    availability?: string[];
}

const TimeSlotGrid = ({ date, interviewer, isCurrentUser = false }: { date: string, interviewer: Interviewer, isCurrentUser?: boolean }) => {
    const daySlots = interviewer.availability.find(a => a.day === date)?.slots || [];

    return (
        <div className="grid grid-cols-6 gap-1">
            {daySlots.map((slot, index) => {
                const { time, status } = slot;
                return (
                    <Button
                        key={`${date}-${time}-${index}`}
                        variant={status === 'booked' ? "secondary" : "outline"}
                        size="sm"
                        className={cn(
                            "w-full text-xs py-1",
                            status === 'booked' && "bg-blue-100 hover:bg-blue-100",
                            status === 'available' && "hover:bg-green-100",
                            status === 'unavailable' && "bg-gray-100 hover:bg-gray-100"
                        )}
                        disabled={status !== 'available'}
                    >
                        {time}
                    </Button>
                );
            })}
        </div>
    );
};

const ScheduleInterviewDialog = ({ candidate, selectedEvent = null }: { candidate: Candidate, selectedEvent?: string | null }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedInterviewer, setSelectedInterviewer] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');

    // Filter available rooms based on context
    const availableRooms = rooms.filter(room => {
        if (selectedEvent) {
            // For events, show only event rooms for that event on selected date
            return room.type === 'event' &&
                room.eventId === selectedEvent &&
                room.availability?.includes(selectedDate);
        }
        // For general interviews, show only general rooms
        return room.type === 'general';
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Schedule Interview
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Candidate</Label>
                        <div className="text-sm font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.position}</div>
                    </div>

                    <div className="space-y-2">
                        <Label>Availability</Label>
                        <div className="text-sm text-muted-foreground">
                            {candidate.availability.join(', ')} • {candidate.preferredTime}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Select value={selectedDate} onValueChange={setSelectedDate}>
                            <SelectTrigger id="date">
                                <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024-03-20">March 20, 2024</SelectItem>
                                <SelectItem value="2024-03-21">March 21, 2024</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedDate && (
                        <div className="space-y-2">
                            <Label htmlFor="interviewer">Interviewer</Label>
                            <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
                                <SelectTrigger id="interviewer">
                                    <SelectValue placeholder="Select interviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {interviewers.map(interviewer => (
                                        <SelectItem key={interviewer.id} value={interviewer.id}>
                                            {interviewer.name} ({interviewer.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedInterviewer && (
                        <div className="space-y-2">
                            <Label>Available Time Slots</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {interviewers
                                    .find(i => i.id === selectedInterviewer)
                                    ?.availability
                                    .find(a => a.day === selectedDate)
                                    ?.slots.map(time => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {selectedTime && (
                        <div className="space-y-2">
                            <Label htmlFor="room">Room</Label>
                            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                <SelectTrigger id="room">
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRooms.map(room => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.name} (Capacity: {room.capacity})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button className="w-full" disabled={!selectedDate || !selectedTime || !selectedInterviewer || !selectedRoom}>
                        Confirm Schedule
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CandidateCard = ({ candidate }: { candidate: Candidate }) => {
    const navigate = useNavigate();

    const startInterview = (id: string) => {
        navigate(`/interview/${id}`);
    };

    return (
        <Card className="hover:bg-accent/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                            <Badge variant={candidate.status === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                                {candidate.status === 'scheduled' ? 'Scheduled' : 'Ready for Interview'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500" />
                                <span>{candidate.screeningScore}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3 text-purple-500" />
                                <span>{candidate.aiMatch}%</span>
                            </div>
                            <div className="text-muted-foreground">{candidate.experience}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {candidate.status === 'scheduled' ? (
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right text-sm">
                                    <div className="font-medium">{new Date(candidate.scheduledInterview?.date).toLocaleDateString()}</div>
                                    <div className="text-muted-foreground">{candidate.scheduledInterview?.time}</div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="gap-2"
                                    onClick={() => startInterview(candidate.id)}
                                >
                                    <VideoIcon className="h-4 w-4" />
                                    Start Interview
                                </Button>
                            </div>
                        ) : (
                            <>
                                <ScheduleInterviewDialog candidate={candidate} />
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="gap-2"
                                    onClick={() => startInterview(candidate.id)}
                                >
                                    <VideoIcon className="h-4 w-4" />
                                    Start Now
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const Screening = () => {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState<string>('all');
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'scheduled'>('all');

    // Filter candidates based on event and status
    const filteredCandidates = screenedCandidates.filter(candidate => {
        const matchesEvent = selectedEvent === 'all' || candidate.eventId === selectedEvent;
        const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesEvent && matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Screening"
                subtitle="Schedule and manage candidate interviews"
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setView(view === 'list' ? 'calendar' : 'list')}>
                        {view === 'list' ? <CalendarDays className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </Button>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Events" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </PageHeader>

            <div className="flex items-center justify-between">
                <Tabs
                    value={view}
                    onValueChange={(v) => {
                        setView(v as 'list' | 'calendar');
                        if (v === 'list') {
                            setFilterStatus('all');
                        }
                    }}
                    className="w-full"
                >
                    <TabsList>
                        <TabsTrigger value="list">
                            <Users className="h-4 w-4 mr-2" />
                            Candidates
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-sm relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search candidates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Candidates</SelectItem>
                                    <SelectItem value="pending">Ready for Interview</SelectItem>
                                    <SelectItem value="scheduled">Interview Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Card>
                            <CardHeader className="py-3 border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {filterStatus === 'pending' ? 'Candidates Ready for Interview' :
                                            filterStatus === 'scheduled' ? 'Scheduled Interviews' :
                                                'All Candidates'}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {filteredCandidates.length} candidates
                                        </Badge>
                                        {filterStatus === 'all' && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {filteredCandidates.filter(c => c.status === 'pending').length} ready for interview
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <ScrollArea className="h-[calc(100vh-300px)]">
                                    <div className="space-y-2">
                                        {filteredCandidates.map((candidate) => (
                                            <CandidateCard key={candidate.id} candidate={candidate} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="calendar" className="space-y-6">
                        <div className="grid gap-6">
                            {interviewers.map(interviewer => (
                                <Card key={interviewer.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{interviewer.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{interviewer.role}</p>
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                                {interviewer.assignedInterviews.length} interviews
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <TimeSlotGrid date="2024-03-20" interviewer={interviewer} />
                                    </CardContent>
                                </Card>
                            ))}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Rooms</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {rooms.map(room => (
                                            <Card key={room.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">{room.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Capacity: {room.capacity} people
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Screening; 