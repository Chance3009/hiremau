import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Building2, Briefcase, Save, Eye, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { API_CONFIG } from '@/config/constants';

const EventCreation = () => {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 100,
        eventType: '',
        selectedJobs: [],
        features: {
            aiScreening: true,
            realTimeTracking: true,
            autoScheduling: true,
            analytics: true
        }
    });

    const [availableJobs, setAvailableJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [positionsForJob, setPositionsForJob] = useState({});

    // Fetch available jobs on component mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOBS}/active/list`);
                if (response.ok) {
                    const jobs = await response.json();
                    setAvailableJobs(jobs);
                } else {
                    console.error('Failed to fetch jobs');
                    toast({
                        title: "Warning",
                        description: "Could not load jobs. Using offline mode.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                toast({
                    title: "Connection Error",
                    description: "Could not connect to server. Please check if the backend is running.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    const handleAddJob = () => {
        if (selectedJob && !eventData.selectedJobs.find(job => job.id === selectedJob)) {
            const jobToAdd = availableJobs.find(job => job.id === selectedJob);
            if (jobToAdd) {
                setEventData(prev => ({
                    ...prev,
                    selectedJobs: [...prev.selectedJobs, {
                        ...jobToAdd,
                        positions_available: positionsForJob[selectedJob] || 1
                    }]
                }));
                setSelectedJob('');
                setPositionsForJob(prev => ({ ...prev, [selectedJob]: undefined }));
            }
        }
    };

    const handleRemoveJob = (jobId) => {
        setEventData(prev => ({
            ...prev,
            selectedJobs: prev.selectedJobs.filter(job => job.id !== jobId)
        }));
    };

    const handlePositionCountChange = (jobId, count) => {
        setPositionsForJob(prev => ({
            ...prev,
            [jobId]: count
        }));
    };

    const handleSave = async () => {
        if (!eventData.title || !eventData.date || !eventData.location) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields (title, date, location)",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.startTime && eventData.endTime
                        ? `${eventData.startTime} - ${eventData.endTime}`
                        : eventData.startTime,
                    location: eventData.location,
                    description: eventData.description,
                    status: 'active',
                    event_type: eventData.eventType || 'recruitment',
                    max_participants: eventData.maxParticipants,
                    event_positions: eventData.selectedJobs.map(job => ({
                        job_id: job.id,
                        positions_available: job.positions_available || 1
                    }))
                })
            });

            if (response.ok) {
                const event = await response.json();
                toast({
                    title: "Event Created Successfully! 🎉",
                    description: `${eventData.title} has been created and is ready for registration.`,
                });

                // Reset form after success
                setEventData({
                    title: '',
                    description: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    maxParticipants: 100,
                    eventType: '',
                    selectedJobs: [],
                    features: {
                        aiScreening: true,
                        realTimeTracking: true,
                        autoScheduling: true,
                        analytics: true
                    }
                });
                setPositionsForJob({});
            } else {
                throw new Error('Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            toast({
                title: "Error Creating Event",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handlePreview = () => {
        toast({
            title: "Preview Mode",
            description: "Opening event preview dashboard...",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create Recruitment Event</h1>
                    <p className="text-muted-foreground">Set up your next career fair or hiring event with AI-powered screening</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreview}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Event Details
                            </CardTitle>
                            <CardDescription>
                                Configure your recruitment event's basic information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Event Title *</Label>
                                    <Input
                                        id="title"
                                        value={eventData.title}
                                        onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="UPM Career Fair 2025"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="eventType">Event Type</Label>
                                    <Select value={eventData.eventType} onValueChange={(value) => setEventData(prev => ({ ...prev, eventType: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="career-fair">Career Fair</SelectItem>
                                            <SelectItem value="campus-recruitment">Campus Recruitment</SelectItem>
                                            <SelectItem value="tech-meetup">Tech Meetup</SelectItem>
                                            <SelectItem value="graduate-program">Graduate Program</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={eventData.description}
                                    onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe your event, target audience, and what candidates can expect..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={eventData.date}
                                        onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={eventData.startTime}
                                        onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endTime">End Time</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={eventData.endTime}
                                        onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={eventData.location}
                                        onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="UPM Student Center, Hall A"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxParticipants">Expected Participants</Label>
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        value={eventData.maxParticipants}
                                        onChange={(e) => setEventData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                                        min="1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Positions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Job Positions
                            </CardTitle>
                            <CardDescription>
                                Select the job positions you're recruiting for at this event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingJobs ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="ml-2">Loading jobs...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <Select value={selectedJob} onValueChange={setSelectedJob}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select job position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableJobs.map(job => (
                                                    <SelectItem key={job.id} value={job.id}>
                                                        {job.title} - {job.department} ({job.location})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedJob && (
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Positions"
                                                value={positionsForJob[selectedJob] || ''}
                                                onChange={(e) => handlePositionCountChange(selectedJob, parseInt(e.target.value) || 1)}
                                                className="w-24"
                                            />
                                        )}
                                        <Button onClick={handleAddJob} disabled={!selectedJob}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {eventData.selectedJobs.map(job => (
                                            <Badge key={job.id} variant="secondary" className="px-3 py-1">
                                                {job.title} ({job.positions_available || 1})
                                                <button
                                                    onClick={() => handleRemoveJob(job.id)}
                                                    className="ml-2 text-gray-500 hover:text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    {availableJobs.length === 0 && (
                                        <div className="text-center p-4 text-muted-foreground">
                                            No jobs available. Please add jobs to the system first.
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Preview Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Preview</CardTitle>
                            <CardDescription>How your event will appear to candidates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                <h3 className="font-semibold text-lg">
                                    {eventData.title || 'Your Event Title'}
                                </h3>
                                <div className="space-y-2 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {eventData.date || 'Select date'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {eventData.startTime && eventData.endTime
                                            ? `${eventData.startTime} - ${eventData.endTime}`
                                            : 'Set time range'
                                        }
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {eventData.location || 'Add location'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {eventData.maxParticipants} expected participants
                                    </div>
                                </div>
                                {eventData.selectedJobs.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium mb-2">Job Positions:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {eventData.selectedJobs.slice(0, 3).map(job => (
                                                <Badge key={job.id} variant="outline" className="text-xs">
                                                    {job.title} ({job.positions_available || 1})
                                                </Badge>
                                            ))}
                                            {eventData.selectedJobs.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{eventData.selectedJobs.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default EventCreation; 