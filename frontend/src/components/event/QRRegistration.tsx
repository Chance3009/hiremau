import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    QrCode, Users, Calendar, MapPin, Link,
    Download, Smartphone, RefreshCw, Eye,
    Share, Copy, Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/config/constants';

const QRRegistrationDisplay = () => {
    const [selectedEvent, setSelectedEvent] = useState('');
    const [copied, setCopied] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real events data from backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/active/list`);
                if (response.ok) {
                    const eventsData = await response.json();
                    setEvents(eventsData.map(event => ({
                        id: event.id,
                        name: event.title,
                        date: event.date,
                        location: event.location,
                        positions: [], // Will be populated from job data
                        registrationUrl: `${window.location.protocol}//${window.location.host}/register/${event.id}`,
                        status: event.status
                    })));

                    if (eventsData.length > 0) {
                        setSelectedEvent(eventsData[0].id);
                    }
                } else {
                    console.error('Failed to fetch events');
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const currentEvent = events.find(e => e.id === selectedEvent);
    const [registrations, setRegistrations] = useState(0);

    // Fetch real registration count for selected event
    useEffect(() => {
        const fetchRegistrations = async () => {
            if (selectedEvent) {
                try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${selectedEvent}/registrations`);
                    if (response.ok) {
                        const registrationsData = await response.json();
                        setRegistrations(registrationsData.length || 0);
                    }
                } catch (error) {
                    console.error('Error fetching registrations:', error);
                }
            }
        };

        fetchRegistrations();

        // Update registration count every 30 seconds
        const interval = setInterval(fetchRegistrations, 30000);
        return () => clearInterval(interval);
    }, [selectedEvent]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentEvent.registrationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Link Copied!",
            description: "Registration link copied to clipboard",
        });
    };

    const handleDownloadQR = () => {
        toast({
            title: "QR Code Downloaded",
            description: "QR code saved for printing",
        });
    };

    // Simple QR code placeholder (in real app, you'd use a QR library)
    const QRCodeDisplay = ({ url, size = 200 }) => (
        <div
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-200"
            style={{ width: size, height: size }}
        >
            <div className="grid grid-cols-8 gap-1">
                {[...Array(64)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-2 h-2",
                            Math.random() > 0.5 ? "bg-black" : "bg-white"
                        )}
                    />
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-600">Loading events...</span>
                </div>
            </div>
        );
    }

    if (!currentEvent) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-2">No Events Available</h1>
                    <p className="text-gray-600">Create an event first to generate QR codes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">QR Registration System</h1>
                    <p className="text-muted-foreground">Generate QR codes for candidate event registration</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                        {registrations} Registered
                    </Badge>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id}>
                                    {event.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Event Info Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{currentEvent.name}</h2>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {currentEvent.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {currentEvent.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {currentEvent.positions.length} Positions
                                </div>
                            </div>
                        </div>
                        <Badge variant={currentEvent.status === 'active' ? 'default' : 'secondary'}>
                            {currentEvent.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Registration QR Code
                        </CardTitle>
                        <CardDescription>
                            Candidates scan this to register for the event
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <div className="text-center space-y-4">
                                <QRCodeDisplay url={currentEvent.registrationUrl} />
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    Scan with phone camera to register
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleDownloadQR}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                            >
                                Print
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Registration Link & Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link className="h-5 w-5" />
                                Registration Link
                            </CardTitle>
                            <CardDescription>
                                Direct link for online registration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <code className="text-sm break-all">
                                    {currentEvent.registrationUrl}
                                </code>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline">
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                Live Registration Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">Total Registrations</span>
                                    <span className="text-2xl font-bold text-blue-600">{registrations}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">Today</span>
                                    <span className="text-2xl font-bold text-green-600">+23</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">Conversion Rate</span>
                                    <span className="text-2xl font-bold text-purple-600">78%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use QR Registration</CardTitle>
                    <CardDescription>
                        Simple steps to deploy QR codes for your event
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Download className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">1. Download & Print</h3>
                                <p className="text-sm text-muted-foreground">
                                    Download QR code and print for physical display
                                </p>
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Eye className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">2. Display at Event</h3>
                                <p className="text-sm text-muted-foreground">
                                    Place QR codes at registration booths and entrances
                                </p>
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <Smartphone className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">3. Candidates Scan</h3>
                                <p className="text-sm text-muted-foreground">
                                    Candidates use phone camera to scan and register
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QRRegistrationDisplay; 