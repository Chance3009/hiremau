import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DoorClosed, Users, Clock, MapPin } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    location: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    currentSession?: {
        interviewer: string;
        candidate: string;
        startTime: string;
        endTime: string;
    };
    equipment: string[];
}

const RoomManagement: React.FC = () => {
    const [rooms, setRooms] = React.useState<Room[]>([
        {
            id: '1',
            name: 'Interview Room A',
            location: 'Engineering Block, Level 2',
            capacity: 4,
            status: 'occupied',
            currentSession: {
                interviewer: 'David Chen',
                candidate: 'Alex Johnson',
                startTime: '10:00 AM',
                endTime: '10:45 AM'
            },
            equipment: ['Whiteboard', 'Projector', 'Video Conference']
        },
        {
            id: '2',
            name: 'Discussion Room B',
            location: 'Engineering Block, Level 2',
            capacity: 6,
            status: 'available',
            equipment: ['Whiteboard', 'TV Screen']
        },
        {
            id: '3',
            name: 'Group Room C',
            location: 'Career Center',
            capacity: 8,
            status: 'reserved',
            currentSession: {
                interviewer: 'Team Assessment',
                candidate: 'Group Interview',
                startTime: '11:00 AM',
                endTime: '12:00 PM'
            },
            equipment: ['Whiteboard', 'Projector', 'Round Table']
        }
    ]);

    const getStatusBadgeVariant = (status: Room['status']) => {
        switch (status) {
            case 'available': return 'success';
            case 'occupied': return 'default';
            case 'reserved': return 'warning';
            case 'maintenance': return 'destructive';
        }
    };

    const handleRoomAction = (roomId: string, action: 'reserve' | 'release' | 'maintenance') => {
        setRooms(current =>
            current.map(room =>
                room.id === roomId
                    ? {
                        ...room,
                        status: action === 'release' ? 'available' : action === 'reserve' ? 'reserved' : 'maintenance',
                        currentSession: action === 'release' ? undefined : room.currentSession
                    }
                    : room
            )
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Room Management</CardTitle>
                        <CardDescription>Interview rooms and facilities status</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="success" className="h-7">
                            {rooms.filter(r => r.status === 'available').length} Available
                        </Badge>
                        <Badge variant="default" className="h-7">
                            {rooms.filter(r => r.status === 'occupied').length} In Use
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <DoorClosed className="h-4 w-4" />
                                    <span className="font-medium">{room.name}</span>
                                    <Badge variant={getStatusBadgeVariant(room.status)}>
                                        {room.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{room.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>Capacity: {room.capacity}</span>
                                </div>
                                {room.currentSession && (
                                    <div className="flex items-center gap-2 text-sm mt-2 border-t pt-2">
                                        <Clock className="h-3 w-3" />
                                        <div>
                                            <p>{room.currentSession.interviewer} with {room.currentSession.candidate}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {room.currentSession.startTime} - {room.currentSession.endTime}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                {room.status === 'available' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRoomAction(room.id, 'reserve')}
                                    >
                                        Reserve Room
                                    </Button>
                                )}
                                {(room.status === 'occupied' || room.status === 'reserved') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRoomAction(room.id, 'release')}
                                    >
                                        Release Room
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRoomAction(room.id, 'maintenance')}
                                >
                                    Mark for Maintenance
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RoomManagement; 