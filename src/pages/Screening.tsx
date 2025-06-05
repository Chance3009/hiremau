import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, Filter, CalendarDays, Users, ArrowRight, Star, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data for screened candidates
const screenedCandidates = [
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
        scheduledInterview: '2024-03-20 14:00'
    },
    // Add more mock candidates as needed
];

const ScheduleInterviewDialog = ({ candidate }: { candidate: any }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [interviewer, setInterviewer] = useState<string>('');

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
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger id="time">
                                <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                <SelectItem value="14:00">2:00 PM</SelectItem>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interviewer">Interviewer</Label>
                        <Select value={interviewer} onValueChange={setInterviewer}>
                            <SelectTrigger id="interviewer">
                                <SelectValue placeholder="Select interviewer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="john">John Smith (Tech Lead)</SelectItem>
                                <SelectItem value="emma">Emma Wilson (Senior Dev)</SelectItem>
                                <SelectItem value="michael">Michael Chen (Engineering Manager)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-full">
                        Confirm Schedule
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const Screening = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredCandidates = screenedCandidates.filter(candidate => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'pending' && candidate.status === 'pending') ||
            (filterStatus === 'scheduled' && candidate.status === 'scheduled');

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Screened Candidates</h1>
                <p className="text-muted-foreground">Schedule interviews for qualified candidates</p>
            </div>

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
                        <SelectItem value="pending">Pending Schedule</SelectItem>
                        <SelectItem value="scheduled">Interview Scheduled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Candidates Ready for Interview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {filteredCandidates.map((candidate) => (
                                <Card key={candidate.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{candidate.name}</h3>
                                                    <Badge variant={candidate.status === 'scheduled' ? 'default' : 'secondary'}>
                                                        {candidate.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{candidate.position}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="flex items-center gap-1 text-amber-500">
                                                                <Star className="h-4 w-4" />
                                                                <span className="text-sm font-medium">{candidate.screeningScore}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Screening Score</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="flex items-center gap-1 text-purple-500">
                                                                <Brain className="h-4 w-4" />
                                                                <span className="text-sm font-medium">{candidate.aiMatch}%</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>AI Match Score</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-3">
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Experience:</span>{' '}
                                                    <span className="font-medium">{candidate.experience}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Skills:</span>{' '}
                                                    <span className="font-medium">{candidate.skills.join(', ')}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Availability:</span>{' '}
                                                    <span className="font-medium">{candidate.availability.join(', ')}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-between">
                                                {candidate.status === 'scheduled' ? (
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">Interview Scheduled</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(candidate.scheduledInterview).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <ScheduleInterviewDialog candidate={candidate} />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default Screening; 