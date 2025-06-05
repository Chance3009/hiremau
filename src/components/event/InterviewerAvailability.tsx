import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Coffee, UserCheck, UserMinus } from 'lucide-react';

interface Interviewer {
    id: string;
    name: string;
    position: string;
    status: 'available' | 'interviewing' | 'break' | 'offline';
    currentCandidate?: string;
    totalInterviews: number;
    avatarUrl?: string;
}

const InterviewerAvailability: React.FC = () => {
    const [interviewers, setInterviewers] = React.useState<Interviewer[]>([
        {
            id: '1',
            name: 'David Chen',
            position: 'Senior Developer',
            status: 'interviewing',
            currentCandidate: 'Alex Johnson',
            totalInterviews: 5,
            avatarUrl: '/avatars/david.jpg'
        },
        {
            id: '2',
            name: 'Sarah Miller',
            position: 'Tech Lead',
            status: 'available',
            totalInterviews: 3,
            avatarUrl: '/avatars/sarah.jpg'
        },
        {
            id: '3',
            name: 'James Wilson',
            position: 'Engineering Manager',
            status: 'break',
            totalInterviews: 4,
            avatarUrl: '/avatars/james.jpg'
        }
    ]);

    const handleStatusChange = (interviewerId: string, newStatus: Interviewer['status']) => {
        setInterviewers(current =>
            current.map(interviewer =>
                interviewer.id === interviewerId
                    ? { ...interviewer, status: newStatus }
                    : interviewer
            )
        );
    };

    const getStatusBadgeVariant = (status: Interviewer['status']) => {
        switch (status) {
            case 'available': return 'success';
            case 'interviewing': return 'default';
            case 'break': return 'warning';
            case 'offline': return 'secondary';
        }
    };

    const getStatusIcon = (status: Interviewer['status']) => {
        switch (status) {
            case 'available': return <UserCheck className="h-4 w-4" />;
            case 'interviewing': return <Clock className="h-4 w-4" />;
            case 'break': return <Coffee className="h-4 w-4" />;
            case 'offline': return <UserMinus className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Interviewer Availability</CardTitle>
                        <CardDescription>Real-time status of interview panel members</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="success" className="h-7">
                            {interviewers.filter(i => i.status === 'available').length} Available
                        </Badge>
                        <Badge variant="default" className="h-7">
                            {interviewers.filter(i => i.status === 'interviewing').length} Active
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {interviewers.map((interviewer) => (
                        <div
                            key={interviewer.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={interviewer.avatarUrl} />
                                    <AvatarFallback>{interviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{interviewer.name}</div>
                                    <div className="text-sm text-muted-foreground">{interviewer.position}</div>
                                    {interviewer.currentCandidate && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            Interviewing: {interviewer.currentCandidate}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-semibold">{interviewer.totalInterviews}</div>
                                    <div className="text-xs text-muted-foreground">interviews today</div>
                                </div>
                                <Badge
                                    variant={getStatusBadgeVariant(interviewer.status)}
                                    className="h-7 gap-1"
                                >
                                    {getStatusIcon(interviewer.status)}
                                    {interviewer.status}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStatusChange(
                                        interviewer.id,
                                        interviewer.status === 'available' ? 'break' : 'available'
                                    )}
                                >
                                    {interviewer.status === 'available' ? 'Take Break' : 'Set Available'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default InterviewerAvailability; 