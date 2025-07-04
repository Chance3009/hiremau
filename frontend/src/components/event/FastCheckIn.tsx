import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    QrCode, UserCheck, Clock, CheckCircle2, AlertCircle,
    Users, Brain, Zap, ArrowRight, Timer, Camera, Search,
    Star, MapPin, Award, TrendingUp, Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FastCheckIn = () => {
    const [scannerActive, setScannerActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [recentCheckIns, setRecentCheckIns] = useState([]);
    const [liveStats, setLiveStats] = useState({
        totalCheckedIn: 47,
        avgProcessTime: 12,
        aiScreeningRate: 98.5,
        queueLength: 5
    });

    // Mock candidates for demo
    const candidates = [
        {
            id: '1',
            name: 'Sarah Chen',
            email: 'sarah.chen@email.com',
            position: 'Frontend Developer',
            university: 'UPM',
            year: 'Final Year',
            gpa: 3.8,
            skills: ['React', 'TypeScript', 'Node.js'],
            aiScore: 94,
            resumeUrl: '#',
            status: 'registered',
            estimatedTime: '8 min',
            priority: 'high'
        },
        {
            id: '2',
            name: 'Ahmad Rahman',
            email: 'ahmad.rahman@email.com',
            position: 'Data Scientist',
            university: 'UTM',
            year: 'Masters',
            gpa: 3.9,
            skills: ['Python', 'Machine Learning', 'SQL'],
            aiScore: 89,
            resumeUrl: '#',
            status: 'registered',
            estimatedTime: '12 min',
            priority: 'medium'
        },
        {
            id: '3',
            name: 'Lisa Wong',
            email: 'lisa.wong@email.com',
            position: 'UX Designer',
            university: 'UM',
            year: 'Final Year',
            gpa: 3.7,
            skills: ['Figma', 'User Research', 'Prototyping'],
            aiScore: 92,
            resumeUrl: '#',
            status: 'registered',
            estimatedTime: '6 min',
            priority: 'high'
        }
    ];

    const [queueCandidates, setQueueCandidates] = useState([
        {
            id: '4',
            name: 'Kevin Tan',
            position: 'Backend Developer',
            checkInTime: '14:23',
            status: 'waiting',
            estimatedWait: '15 min',
            aiScore: 87,
            priority: 'medium'
        },
        {
            id: '5',
            name: 'Maria Santos',
            position: 'Product Manager',
            checkInTime: '14:28',
            status: 'screening',
            estimatedWait: '8 min',
            aiScore: 95,
            priority: 'high'
        },
        {
            id: '6',
            name: 'David Kim',
            position: 'Full Stack Developer',
            checkInTime: '14:31',
            status: 'waiting',
            estimatedWait: '22 min',
            aiScore: 82,
            priority: 'medium'
        }
    ]);

    const handleQuickCheckIn = (candidate) => {
        const newCheckIn = {
            ...candidate,
            checkInTime: new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'processing'
        };

        setRecentCheckIns(prev => [newCheckIn, ...prev.slice(0, 4)]);
        setLiveStats(prev => ({ ...prev, totalCheckedIn: prev.totalCheckedIn + 1 }));

        // Simulate AI processing
        setTimeout(() => {
            setRecentCheckIns(prev =>
                prev.map(item =>
                    item.id === candidate.id
                        ? { ...item, status: 'completed', aiProcessed: true }
                        : item
                )
            );
        }, 2000);

        toast({
            title: "Check-in Successful!",
            description: `${candidate.name} has been checked in and is being processed by AI`,
        });
    };

    const handleQRScan = () => {
        setScannerActive(true);
        // Simulate QR code scan
        setTimeout(() => {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            handleQuickCheckIn(randomCandidate);
            setScannerActive(false);
        }, 3000);
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting': return 'bg-yellow-100 text-yellow-800';
            case 'screening': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Fast Check-In System</h1>
                    <p className="text-muted-foreground">Streamlined candidate check-in with AI-powered processing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                        Live Event
                    </Badge>
                    <Badge variant="secondary">
                        {liveStats.totalCheckedIn} Checked In
                    </Badge>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{liveStats.totalCheckedIn}</div>
                                <div className="text-sm text-muted-foreground">Total Check-ins</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-full">
                                <Timer className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{liveStats.avgProcessTime}s</div>
                                <div className="text-sm text-muted-foreground">Avg Process Time</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-full">
                                <Brain className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{liveStats.aiScreeningRate}%</div>
                                <div className="text-sm text-muted-foreground">AI Accuracy</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-full">
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{liveStats.queueLength}</div>
                                <div className="text-sm text-muted-foreground">In Queue</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Check-in Methods */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Quick Check-In Methods</CardTitle>
                        <CardDescription>
                            Multiple ways to check in candidates instantly
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* QR Code Scanner */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    <span className="font-medium">QR Code Scanner</span>
                                </div>
                                <Button
                                    onClick={handleQRScan}
                                    disabled={scannerActive}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {scannerActive ? (
                                        <>
                                            <Camera className="h-4 w-4 mr-2 animate-pulse" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="h-4 w-4 mr-2" />
                                            Start Scanner
                                        </>
                                    )}
                                </Button>
                            </div>
                            {scannerActive && (
                                <div className="bg-gray-100 rounded-lg p-8 text-center">
                                    <div className="animate-pulse">
                                        <div className="w-32 h-32 bg-blue-200 rounded-lg mx-auto mb-4"></div>
                                        <p className="text-sm text-muted-foreground">Scanning for QR codes...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Manual Search */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="h-5 w-5" />
                                <span className="font-medium">Manual Search</span>
                            </div>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Search by name or position..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {filteredCandidates.map(candidate => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {candidate.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                                                        getPriorityColor(candidate.priority)
                                                    )}>
                                                        <Star className="h-3 w-3 fill-current" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{candidate.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {candidate.position} • AI Score: {candidate.aiScore}%
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleQuickCheckIn(candidate)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Check In
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Check-ins */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Check-ins</CardTitle>
                        <CardDescription>
                            Live feed of processed candidates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentCheckIns.map(checkIn => (
                                <div
                                    key={checkIn.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-purple-600">
                                                {checkIn.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{checkIn.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {checkIn.checkInTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", getStatusColor(checkIn.status))}
                                        >
                                            {checkIn.status}
                                        </Badge>
                                        {checkIn.aiProcessed && (
                                            <Badge variant="secondary" className="text-xs">
                                                AI ✓
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {recentCheckIns.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No recent check-ins</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Current Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Current Processing Queue
                    </CardTitle>
                    <CardDescription>
                        Live view of candidates being processed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {queueCandidates.map((candidate, index) => (
                            <div
                                key={candidate.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-lg font-bold text-muted-foreground">
                                        #{index + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                            <span className="font-medium text-blue-600">
                                                {candidate.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{candidate.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {candidate.position} • Checked in: {candidate.checkInTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm font-medium">AI Score: {candidate.aiScore}%</div>
                                        <div className="text-xs text-muted-foreground">
                                            Est. wait: {candidate.estimatedWait}
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs", getStatusColor(candidate.status))}
                                    >
                                        {candidate.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FastCheckIn; 