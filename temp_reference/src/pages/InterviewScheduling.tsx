import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Video,
    Phone,
    MapPin,
    User,
    Building,
    Mail,
    ArrowLeft,
    Send,
    Save,
    RefreshCw,
    Bot,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    Star,
    Brain,
    Target,
    Zap,
    Timer,
    Monitor,
    Mic,
    Plus,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';

// Types
interface Interviewer {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
    expertise: string[];
    rating: number;
    availability: TimeSlot[];
}

interface TimeSlot {
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    conflictReason?: string;
}

interface Room {
    id: string;
    name: string;
    type: 'physical' | 'virtual';
    capacity: number;
    equipment: string[];
    link?: string;
    location?: string;
}

interface InterviewRequest {
    candidateId?: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    interviewType: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral' | 'final';
    duration: number;
    preferredDate: string;
    preferredTime: string;
    interviewerId: string;
    roomId?: string;
    notes?: string;
    priority: 'high' | 'medium' | 'low';
    isAutoScheduled?: boolean;
}

interface AIRecommendation {
    type: 'interviewer' | 'time' | 'room' | 'duration';
    suggestion: string;
    reason: string;
    confidence: number;
}

// Mock data
const mockInterviewers: Interviewer[] = [
    {
        id: 'int-1',
        name: 'John Smith',
        role: 'Tech Lead',
        email: 'john.smith@company.com',
        expertise: ['React', 'JavaScript', 'System Design'],
        rating: 4.8,
        availability: [
            { date: '2024-03-20', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { date: '2024-03-21', startTime: '10:00', endTime: '16:00', isAvailable: true }
        ]
    },
    {
        id: 'int-2',
        name: 'Emily Davis',
        role: 'Design Lead',
        email: 'emily.davis@company.com',
        expertise: ['UX Design', 'User Research', 'Prototyping'],
        rating: 4.9,
        availability: [
            { date: '2024-03-20', startTime: '10:00', endTime: '18:00', isAvailable: true }
        ]
    },
    {
        id: 'int-3',
        name: 'Mike Johnson',
        role: 'Senior Engineer',
        email: 'mike.johnson@company.com',
        expertise: ['Backend', 'Python', 'API Design'],
        rating: 4.7,
        availability: [
            { date: '2024-03-20', startTime: '13:00', endTime: '17:00', isAvailable: false, conflictReason: 'In meeting' }
        ]
    }
];

const mockRooms: Room[] = [
    {
        id: 'room-1',
        name: 'Conference Room A',
        type: 'physical',
        capacity: 6,
        equipment: ['Whiteboard', 'Screen', 'Camera'],
        location: 'Floor 2, Wing A'
    },
    {
        id: 'room-2',
        name: 'Zoom Room 1',
        type: 'virtual',
        capacity: 10,
        equipment: ['Screen sharing', 'Recording'],
        link: 'https://zoom.us/j/123456789'
    },
    {
        id: 'room-3',
        name: 'Teams Room B',
        type: 'virtual',
        capacity: 20,
        equipment: ['Screen sharing', 'Recording', 'Breakout rooms'],
        link: 'https://teams.microsoft.com/l/meetup-join/456'
    }
];

// Components
const InterviewerCard = ({ interviewer, isSelected, onSelect, timeSlot }: {
    interviewer: Interviewer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    timeSlot?: string;
}) => {
    const isAvailable = timeSlot ? interviewer.availability.some(slot =>
        slot.date === timeSlot?.split(' ')[0] && slot.isAvailable
    ) : true;

    return (
        <Card className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            isSelected ? "ring-2 ring-primary" : "",
            !isAvailable ? "opacity-50" : ""
        )} onClick={() => isAvailable && onSelect(interviewer.id)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium">{interviewer.name}</h4>
                        <p className="text-sm text-muted-foreground">{interviewer.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{interviewer.rating}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        {isAvailable ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                Available
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                                Busy
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Expertise:</div>
                    <div className="flex flex-wrap gap-1">
                        {interviewer.expertise.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const RoomCard = ({ room, isSelected, onSelect }: {
    room: Room;
    isSelected: boolean;
    onSelect: (id: string) => void;
}) => {
    const getTypeIcon = () => {
        switch (room.type) {
            case 'physical':
                return <Building className="h-4 w-4" />;
            case 'virtual':
                return <Video className="h-4 w-4" />;
            default:
                return <MapPin className="h-4 w-4" />;
        }
    };

    return (
        <Card className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            isSelected ? "ring-2 ring-primary" : ""
        )} onClick={() => onSelect(room.id)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {getTypeIcon()}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                        <p className="text-xs text-muted-foreground">
                            Capacity: {room.capacity} people
                        </p>
                    </div>
                </div>
                {room.equipment.length > 0 && (
                    <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Equipment:</div>
                        <div className="flex flex-wrap gap-1">
                            {room.equipment.slice(0, 2).map(equipment => (
                                <Badge key={equipment} variant="outline" className="text-xs">
                                    {equipment}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AIRecommendations = ({ recommendations }: { recommendations: AIRecommendation[] }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800">{rec.suggestion}</p>
                                <p className="text-xs text-blue-600 mt-1">{rec.reason}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <div className="text-xs text-blue-600">Confidence:</div>
                                    <div className="text-xs font-medium">{rec.confidence}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const InterviewScheduling = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Form state
    const [formData, setFormData] = useState<InterviewRequest>({
        candidateName: searchParams.get('candidateName') || '',
        candidateEmail: searchParams.get('candidateEmail') || '',
        position: searchParams.get('position') || '',
        interviewType: 'video',
        duration: 60,
        preferredDate: '',
        preferredTime: '',
        interviewerId: '',
        notes: '',
        priority: 'medium'
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isAutoSchedule, setIsAutoSchedule] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

    // Mock AI recommendations
    useEffect(() => {
        if (formData.position && formData.interviewType) {
            // Simulate AI analysis
            setTimeout(() => {
                setAiRecommendations([
                    {
                        type: 'interviewer',
                        suggestion: 'John Smith recommended as interviewer',
                        reason: 'High expertise match for React/JavaScript position',
                        confidence: 92
                    },
                    {
                        type: 'time',
                        suggestion: 'Schedule for 2:00 PM slot',
                        reason: 'Both interviewer and candidate are most productive in afternoon',
                        confidence: 78
                    },
                    {
                        type: 'duration',
                        suggestion: 'Extend to 75 minutes',
                        reason: 'Technical interviews typically require additional time for coding assessment',
                        confidence: 85
                    }
                ]);
            }, 1000);
        }
    }, [formData.position, formData.interviewType]);

    // Generate available time slots
    useEffect(() => {
        if (selectedDate && formData.interviewerId) {
            const interviewer = mockInterviewers.find(i => i.id === formData.interviewerId);
            if (interviewer) {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const availability = interviewer.availability.find(a => a.date === dateStr);

                if (availability && availability.isAvailable) {
                    // Generate 30-minute slots
                    const slots = [];
                    const start = parseInt(availability.startTime.split(':')[0]);
                    const end = parseInt(availability.endTime.split(':')[0]);

                    for (let hour = start; hour < end; hour++) {
                        slots.push(`${hour.toString().padStart(2, '0')}:00`);
                        if (hour + 0.5 < end) {
                            slots.push(`${hour.toString().padStart(2, '0')}:30`);
                        }
                    }
                    setAvailableSlots(slots);
                } else {
                    setAvailableSlots([]);
                }
            }
        }
    }, [selectedDate, formData.interviewerId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.candidateName || !formData.candidateEmail || !formData.position) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required candidate information.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.interviewerId) {
            toast({
                title: "No Interviewer Selected",
                description: "Please select an interviewer for this interview.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.preferredDate || !formData.preferredTime) {
            toast({
                title: "Schedule Missing",
                description: "Please select a date and time for the interview.",
                variant: "destructive"
            });
            return;
        }

        // Submit interview request
        toast({
            title: "Interview Scheduled!",
            description: `Interview with ${formData.candidateName} has been scheduled successfully.`,
        });

        // Navigate back to interview lobby
        navigate('/interview-lobby');
    };

    const handleAutoSchedule = () => {
        // Simulate AI auto-scheduling
        setIsAutoSchedule(true);

        setTimeout(() => {
            const bestInterviewer = mockInterviewers[0]; // John Smith from AI recommendation
            const bestDate = new Date();
            bestDate.setDate(bestDate.getDate() + 1); // Tomorrow

            setFormData({
                ...formData,
                interviewerId: bestInterviewer.id,
                preferredDate: bestDate.toISOString().split('T')[0],
                preferredTime: '14:00',
                isAutoScheduled: true
            });

            setSelectedDate(bestDate);
            setIsAutoSchedule(false);

            toast({
                title: "Auto-Schedule Complete",
                description: "AI has found the optimal time slot for this interview.",
            });
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Schedule Interview"
                subtitle="Set up a new interview session with AI-powered recommendations"
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/interview-lobby')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Lobby
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleAutoSchedule}
                        disabled={isAutoSchedule || !formData.candidateName || !formData.position}
                    >
                        {isAutoSchedule ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Auto-Scheduling...
                            </>
                        ) : (
                            <>
                                <Zap className="h-4 w-4 mr-2" />
                                AI Auto-Schedule
                            </>
                        )}
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Candidate Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Candidate Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateName">Candidate Name *</Label>
                                        <Input
                                            id="candidateName"
                                            value={formData.candidateName}
                                            onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                                            placeholder="Enter candidate name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateEmail">Email Address *</Label>
                                        <Input
                                            id="candidateEmail"
                                            type="email"
                                            value={formData.candidateEmail}
                                            onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                                            placeholder="candidate@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position *</Label>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        placeholder="e.g., Senior Frontend Developer"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interview Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Interview Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interviewType">Interview Type</Label>
                                        <Select
                                            value={formData.interviewType}
                                            onValueChange={(value: any) => setFormData({ ...formData, interviewType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="video">Video Call</SelectItem>
                                                <SelectItem value="phone">Phone Interview</SelectItem>
                                                <SelectItem value="in-person">In-Person</SelectItem>
                                                <SelectItem value="technical">Technical Interview</SelectItem>
                                                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                                                <SelectItem value="final">Final Interview</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Select
                                            value={formData.duration.toString()}
                                            onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">1 hour</SelectItem>
                                                <SelectItem value="75">1 hour 15 minutes</SelectItem>
                                                <SelectItem value="90">1 hour 30 minutes</SelectItem>
                                                <SelectItem value="120">2 hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high">High Priority</SelectItem>
                                                <SelectItem value="medium">Medium Priority</SelectItem>
                                                <SelectItem value="low">Low Priority</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any special requirements or notes for this interview..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interviewer Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Select Interviewer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mockInterviewers.map(interviewer => (
                                        <InterviewerCard
                                            key={interviewer.id}
                                            interviewer={interviewer}
                                            isSelected={formData.interviewerId === interviewer.id}
                                            onSelect={(id) => setFormData({ ...formData, interviewerId: id })}
                                            timeSlot={formData.preferredDate ? `${formData.preferredDate} ${formData.preferredTime}` : undefined}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date & Time Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Schedule Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Select Date</Label>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                setSelectedDate(date);
                                                if (date) {
                                                    setFormData({
                                                        ...formData,
                                                        preferredDate: date.toISOString().split('T')[0]
                                                    });
                                                }
                                            }}
                                            disabled={(date) => date < new Date()}
                                            className="rounded-md border"
                                        />
                                    </div>
                                    <div>
                                        <Label>Available Time Slots</Label>
                                        {formData.interviewerId ? (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                    <Button
                                                        key={slot}
                                                        type="button"
                                                        variant={formData.preferredTime === slot ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setFormData({ ...formData, preferredTime: slot })}
                                                    >
                                                        {slot}
                                                    </Button>
                                                )) : (
                                                    <p className="text-sm text-muted-foreground col-span-2">
                                                        No available slots for this date
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Select an interviewer to see available times
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Selection */}
                        {(formData.interviewType === 'video' || formData.interviewType === 'in-person') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Select Room
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {mockRooms
                                            .filter(room =>
                                                (formData.interviewType === 'video' && room.type === 'virtual') ||
                                                (formData.interviewType === 'in-person' && room.type === 'physical')
                                            )
                                            .map(room => (
                                                <RoomCard
                                                    key={room.id}
                                                    room={room}
                                                    isSelected={formData.roomId === room.id}
                                                    onSelect={(id) => setFormData({ ...formData, roomId: id })}
                                                />
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline">
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button type="submit">
                                <Send className="h-4 w-4 mr-2" />
                                Schedule Interview
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar with AI Recommendations */}
                <div className="space-y-6">
                    {aiRecommendations.length > 0 && (
                        <AIRecommendations recommendations={aiRecommendations} />
                    )}

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Scheduling Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm">This Week</span>
                                <span className="font-medium">23 interviews</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Success Rate</span>
                                <span className="font-medium">94%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Avg Duration</span>
                                <span className="font-medium">52 min</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Scheduling Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span>Technical interviews work best in 75-90 minute slots</span>
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span>Schedule buffer time between back-to-back interviews</span>
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                    <span>Consider candidate time zones for remote interviews</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InterviewScheduling; 