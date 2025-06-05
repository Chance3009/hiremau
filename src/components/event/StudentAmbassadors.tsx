import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, CheckCircle2, MessageSquare } from 'lucide-react';

interface Ambassador {
    id: string;
    name: string;
    department: string;
    year: string;
    status: 'active' | 'break' | 'offline';
    currentTask?: string;
    location: string;
    assignedArea: string;
    avatarUrl?: string;
    contactNumber: string;
}

const StudentAmbassadors: React.FC = () => {
    const [ambassadors, setAmbassadors] = React.useState<Ambassador[]>([
        {
            id: '1',
            name: 'Emily Wong',
            department: 'Computer Science',
            year: '3rd Year',
            status: 'active',
            currentTask: 'Registration Desk',
            location: 'Main Hall',
            assignedArea: 'Check-in & Registration',
            avatarUrl: '/avatars/emily.jpg',
            contactNumber: '+1234567890'
        },
        {
            id: '2',
            name: 'Michael Lee',
            department: 'Engineering',
            year: '4th Year',
            status: 'active',
            currentTask: 'Candidate Direction',
            location: 'Engineering Block',
            assignedArea: 'Interview Room Guidance',
            avatarUrl: '/avatars/michael.jpg',
            contactNumber: '+1234567891'
        },
        {
            id: '3',
            name: 'Sarah Chen',
            department: 'Business',
            year: '2nd Year',
            status: 'break',
            location: 'Career Center',
            assignedArea: 'Company Representative Support',
            avatarUrl: '/avatars/sarah.jpg',
            contactNumber: '+1234567892'
        }
    ]);

    const getStatusBadgeVariant = (status: Ambassador['status']) => {
        switch (status) {
            case 'active': return 'success';
            case 'break': return 'warning';
            case 'offline': return 'secondary';
        }
    };

    const handleStatusChange = (ambassadorId: string, newStatus: Ambassador['status']) => {
        setAmbassadors(current =>
            current.map(ambassador =>
                ambassador.id === ambassadorId
                    ? { ...ambassador, status: newStatus }
                    : ambassador
            )
        );
    };

    const handleAssignTask = (ambassadorId: string) => {
        // In a real app, this would open a task assignment dialog
        console.log('Assign task to ambassador:', ambassadorId);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Student Ambassadors</CardTitle>
                        <CardDescription>Campus event support team status and assignments</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="success" className="h-7">
                            {ambassadors.filter(a => a.status === 'active').length} Active
                        </Badge>
                        <Badge variant="secondary" className="h-7">
                            {ambassadors.length} Total
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {ambassadors.map((ambassador) => (
                        <div
                            key={ambassador.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={ambassador.avatarUrl} />
                                    <AvatarFallback>{ambassador.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{ambassador.name}</span>
                                        <Badge variant={getStatusBadgeVariant(ambassador.status)}>
                                            {ambassador.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {ambassador.department} • {ambassador.year}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{ambassador.location}</span>
                                    </div>
                                    {ambassador.currentTask && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>{ambassador.currentTask}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssignTask(ambassador.id)}
                                >
                                    Assign Task
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStatusChange(
                                        ambassador.id,
                                        ambassador.status === 'active' ? 'break' : 'active'
                                    )}
                                >
                                    {ambassador.status === 'active' ? 'Take Break' : 'Set Active'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <MessageSquare className="h-3 w-3" />
                                    Contact
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentAmbassadors; 