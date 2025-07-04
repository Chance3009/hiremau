import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Room {
    id: string;
    name: string;
    capacity: number;
    location: string;
    equipment: string[];
    status: 'available' | 'occupied' | 'maintenance';
    currentBooking?: {
        candidateName: string;
        interviewerName: string;
        startTime: string;
        endTime: string;
    };
}

const RoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [newRoom, setNewRoom] = useState({
        name: '',
        capacity: 2,
        location: '',
        equipment: '',
        status: 'available' as const
    });

    // Mock data for demo
    useEffect(() => {
        const mockRooms: Room[] = [
            {
                id: '1',
                name: 'Interview Room A',
                capacity: 4,
                location: 'Floor 2, Wing A',
                equipment: ['Projector', 'Whiteboard', 'Video Conferencing'],
                status: 'available'
            },
            {
                id: '2',
                name: 'Interview Room B',
                capacity: 2,
                location: 'Floor 2, Wing B',
                equipment: ['Laptop', 'Whiteboard'],
                status: 'occupied',
                currentBooking: {
                    candidateName: 'John Doe',
                    interviewerName: 'Sarah Manager',
                    startTime: '14:00',
                    endTime: '15:00'
                }
            },
            {
                id: '3',
                name: 'Conference Room C',
                capacity: 8,
                location: 'Floor 3, Conference Area',
                equipment: ['Projector', 'Sound System', 'Video Conferencing', 'Whiteboard'],
                status: 'available'
            },
            {
                id: '4',
                name: 'Meeting Room D',
                capacity: 3,
                location: 'Floor 1, Reception Area',
                equipment: ['Whiteboard'],
                status: 'maintenance'
            }
        ];
        setRooms(mockRooms);
    }, []);

    const handleAddRoom = () => {
        if (!newRoom.name || !newRoom.location) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const room: Room = {
            id: Date.now().toString(),
            name: newRoom.name,
            capacity: newRoom.capacity,
            location: newRoom.location,
            equipment: newRoom.equipment.split(',').map(e => e.trim()).filter(e => e),
            status: newRoom.status
        };

        setRooms(prev => [...prev, room]);
        setNewRoom({ name: '', capacity: 2, location: '', equipment: '', status: 'available' });
        setIsAddDialogOpen(false);

        toast({
            title: "Success",
            description: "Room added successfully",
        });
    };

    const handleDeleteRoom = (roomId: string) => {
        setRooms(prev => prev.filter(room => room.id !== roomId));
        toast({
            title: "Success",
            description: "Room deleted successfully",
        });
    };

    const handleStatusChange = (roomId: string, newStatus: Room['status']) => {
        setRooms(prev =>
            prev.map(room =>
                room.id === roomId
                    ? { ...room, status: newStatus, ...(newStatus !== 'occupied' && { currentBooking: undefined }) }
                    : room
            )
        );

        toast({
            title: "Success",
            description: `Room status updated to ${newStatus}`,
        });
    };

    const getStatusColor = (status: Room['status']) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'occupied': return 'bg-red-100 text-red-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: Room['status']) => {
        switch (status) {
            case 'available': return '✅';
            case 'occupied': return '🔴';
            case 'maintenance': return '🔧';
            default: return '❓';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Room Management</h2>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Room
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Room</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="roomName">Room Name *</Label>
                                <Input
                                    id="roomName"
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Interview Room A"
                                />
                            </div>

                            <div>
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={newRoom.capacity}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={newRoom.location}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Floor 2, Wing A"
                                />
                            </div>

                            <div>
                                <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                                <Input
                                    id="equipment"
                                    value={newRoom.equipment}
                                    onChange={(e) => setNewRoom(prev => ({ ...prev, equipment: e.target.value }))}
                                    placeholder="Projector, Whiteboard, Video Conferencing"
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={newRoom.status} onValueChange={(value: Room['status']) => setNewRoom(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddRoom}>
                                    Add Room
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Card key={room.id} className="relative">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{room.name}</CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {room.location}
                                    </div>
                                </div>
                                <Badge className={getStatusColor(room.status)}>
                                    {getStatusIcon(room.status)} {room.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                Capacity: {room.capacity} people
                            </div>

                            {room.equipment.length > 0 && (
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">EQUIPMENT</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {room.equipment.map((item, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {room.currentBooking && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <Label className="text-xs font-medium text-red-700">CURRENT BOOKING</Label>
                                    <div className="text-sm mt-1">
                                        <div><strong>Candidate:</strong> {room.currentBooking.candidateName}</div>
                                        <div><strong>Interviewer:</strong> {room.currentBooking.interviewerName}</div>
                                        <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {room.currentBooking.startTime} - {room.currentBooking.endTime}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <Select
                                    value={room.status}
                                    onValueChange={(value: Room['status']) => handleStatusChange(room.id, value)}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteRoom(room.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {rooms.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
                        <p className="text-muted-foreground mb-4">Get started by adding your first interview room.</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Room
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RoomManagement; 