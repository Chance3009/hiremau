import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, UserCheck, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QueuedCandidate {
    id: string;
    name: string;
    position: string;
    checkInTime: string;
    status: 'waiting' | 'interviewing' | 'completed';
    estimatedWaitTime?: number;
}

const CheckInQueue: React.FC = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [queuedCandidates, setQueuedCandidates] = React.useState<QueuedCandidate[]>([
        {
            id: '1',
            name: 'Alex Johnson',
            position: 'Frontend Developer',
            checkInTime: '09:30 AM',
            status: 'interviewing',
            estimatedWaitTime: 15
        },
        {
            id: '2',
            name: 'Sarah Wilson',
            position: 'UX Designer',
            checkInTime: '09:45 AM',
            status: 'waiting',
            estimatedWaitTime: 30
        }
    ]);

    const handleCheckIn = () => {
        toast({
            title: "Candidate Checked In",
            description: "Added to the interview queue",
        });
    };

    const handleStatusUpdate = (candidateId: string, newStatus: QueuedCandidate['status']) => {
        setQueuedCandidates(candidates =>
            candidates.map(c =>
                c.id === candidateId ? { ...c, status: newStatus } : c
            )
        );
    };

    const getStatusBadgeVariant = (status: QueuedCandidate['status']) => {
        switch (status) {
            case 'waiting': return 'secondary';
            case 'interviewing': return 'default';
            case 'completed': return 'success';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Check-in & Queue</h2>
                    <p className="text-muted-foreground">Manage candidate check-ins and interview queue</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-semibold">{queuedCandidates.length}</span>
                        <span className="text-muted-foreground">in queue</span>
                    </div>
                    <Button onClick={handleCheckIn}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check-in Candidate
                    </Button>
                </div>
            </div>

            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Current Queue</CardTitle>
                        <CardDescription>Candidates waiting for interviews</CardDescription>
                        <div className="mt-2">
                            <Input
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {queuedCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                >
                                    <div className="space-y-1">
                                        <div className="font-medium">{candidate.name}</div>
                                        <div className="text-sm text-muted-foreground">{candidate.position}</div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-3 w-3" />
                                            <span>Checked in at {candidate.checkInTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={getStatusBadgeVariant(candidate.status)}>
                                            {candidate.status}
                                        </Badge>
                                        {candidate.estimatedWaitTime && candidate.status === 'waiting' && (
                                            <span className="text-sm text-muted-foreground">
                                                ~{candidate.estimatedWaitTime} min wait
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-[300px]">
                    <CardHeader>
                        <CardTitle>Queue Statistics</CardTitle>
                        <CardDescription>Real-time queue metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Average Wait Time</span>
                                <span className="text-2xl font-semibold">25m</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Active Interviews</span>
                                <span className="text-2xl font-semibold">3</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Completed Today</span>
                                <span className="text-2xl font-semibold">12</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CheckInQueue; 