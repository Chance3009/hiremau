import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, QrCode, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data for events
const mockEvents = [
    {
        id: '1',
        name: 'UPM Career Fair 2025',
        date: '2025-03-15',
        location: 'UPM Main Campus',
        positions: 12,
        registrations: 45,
        status: 'upcoming'
    },
    {
        id: '2',
        name: 'Tech Recruit Summit',
        date: '2025-04-01',
        location: 'Virtual Event',
        positions: 8,
        registrations: 32,
        status: 'upcoming'
    },
    {
        id: '3',
        name: 'Engineering Talent Day',
        date: '2025-02-28',
        location: 'Convention Center',
        positions: 15,
        registrations: 78,
        status: 'completed'
    }
];

const EventList = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Recruitment Events</h1>
                    <p className="text-muted-foreground">Manage your recruitment events and job fairs.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>
                                Set up a new recruitment event or job fair.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Event creation form will go here */}
                            <p className="text-sm text-muted-foreground">Event creation form coming soon...</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockEvents.map(event => (
                    <Card
                        key={event.id}
                        className={`${event.status === 'completed' ? 'opacity-75' : ''} hover:shadow-md transition-shadow`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-bold">{event.name}</CardTitle>
                                <Badge variant={event.status === 'completed' ? 'secondary' : 'default'}>
                                    {event.status}
                                </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.date}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm">{event.location}</div>

                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{event.positions} positions</span>
                                    </div>
                                    <div>{event.registrations} registrations</div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Separator />
                            <div className="grid grid-cols-2 gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/candidate-intake?event=${event.id}`)}
                                >
                                    <span className="flex-1">Candidates</span>
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/interview/schedule?event=${event.id}`)}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule
                                </Button>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    // Navigate directly to QR registration with event context
                                    navigate(`/candidate-intake/qr-registration/${event.id}`);
                                }}
                            >
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate QR Code
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EventList; 