import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoIcon, Calendar, Brain, Star, Search, Users, UserCheck } from 'lucide-react';

interface InterviewCandidate {
    id: string;
    name: string;
    position: string;
    time?: string;
    status: 'ready' | 'upcoming' | 'completed';
    screeningScore: number;
    aiMatch: number;
    experience: string;
    skills: string[];
    scheduledTime?: string;
    interviewer?: string;
}

const mockCandidates: InterviewCandidate[] = [
    {
        id: '1',
        name: 'Ali Thompson',
        position: 'Frontend Developer',
        time: '1:00',
        status: 'ready',
        screeningScore: 92,
        aiMatch: 88,
        experience: '5 years',
        skills: ['React', 'TypeScript', 'Node.js'],
        scheduledTime: '1:00 PM'
    },
    {
        id: '2',
        name: 'Abby Chen',
        position: 'Backend Developer',
        time: '10:00',
        status: 'ready',
        screeningScore: 88,
        aiMatch: 85,
        experience: '4 years',
        skills: ['Python', 'Django', 'PostgreSQL'],
        scheduledTime: '10:00 AM'
    },
    {
        id: '3',
        name: 'Tom Wilson',
        position: 'Full Stack Developer',
        time: '14:00',
        status: 'upcoming',
        screeningScore: 90,
        aiMatch: 92,
        experience: '6 years',
        skills: ['React', 'Node.js', 'MongoDB'],
        scheduledTime: '2:00 PM'
    }
];

const CandidateCard = ({ candidate }: { candidate: InterviewCandidate }) => {
    const navigate = useNavigate();

    const startInterview = (id: string) => {
        navigate(`/interview/${id}`);
    };

    return (
        <Card className="hover:bg-accent/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                            <Badge variant={candidate.status === 'ready' ? 'default' : 'secondary'}>
                                {candidate.status === 'ready' ? 'Ready to Start' : 'Upcoming'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500" />
                                <span>{candidate.screeningScore}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3 text-purple-500" />
                                <span>{candidate.aiMatch}%</span>
                            </div>
                            <div className="text-muted-foreground">{candidate.experience}</div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                            Scheduled: {candidate.scheduledTime}
                        </div>
                        <Button
                            onClick={() => startInterview(candidate.id)}
                            className="gap-2"
                            disabled={candidate.status !== 'ready'}
                        >
                            <VideoIcon className="w-4 h-4" />
                            {candidate.status === 'ready' ? 'Start Interview' : 'Upcoming'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const InterviewLobby = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [view, setView] = useState<'scheduled' | 'my-interviews' | 'new'>('scheduled');

    const filteredCandidates = mockCandidates.filter(candidate => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'ready' && candidate.status === 'ready') ||
            (filterStatus === 'upcoming' && candidate.status === 'upcoming');

        return matchesSearch && matchesStatus;
    });

    const startNewInterview = () => {
        navigate('/interview/new');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Interview Hub</h1>
                <p className="text-muted-foreground">
                    Manage and conduct your interviews efficiently
                </p>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as 'scheduled' | 'my-interviews' | 'new')}>
                <TabsList>
                    <TabsTrigger value="scheduled">
                        <Calendar className="h-4 w-4 mr-2" />
                        Scheduled Interviews
                    </TabsTrigger>
                    <TabsTrigger value="my-interviews">
                        <UserCheck className="h-4 w-4 mr-2" />
                        My Interviews
                    </TabsTrigger>
                    <TabsTrigger value="new">
                        <VideoIcon className="h-4 w-4 mr-2" />
                        New Interview
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-between mt-4">
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
                                <SelectItem value="all">All Interviews</SelectItem>
                                <SelectItem value="ready">Ready to Start</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="scheduled" className="mt-4">
                    <Card>
                        <CardHeader className="py-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    {filterStatus === 'ready' ? 'Interviews Ready to Start' :
                                        filterStatus === 'upcoming' ? 'Upcoming Interviews' :
                                            'All Scheduled Interviews'}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {filteredCandidates.length} interviews
                                    </Badge>
                                    {filterStatus === 'all' && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            {filteredCandidates.filter(c => c.status === 'ready').length} ready to start
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                <div className="space-y-2">
                                    {filteredCandidates.map((candidate) => (
                                        <CandidateCard key={candidate.id} candidate={candidate} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-interviews" className="mt-4">
                    <Card>
                        <CardHeader className="py-3 border-b">
                            <CardTitle className="text-base">My Upcoming Interviews</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                <div className="space-y-2">
                                    {filteredCandidates
                                        .filter(candidate => candidate.status === 'ready')
                                        .map((candidate) => (
                                            <CandidateCard key={candidate.id} candidate={candidate} />
                                        ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="new" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                                <h3 className="text-lg font-semibold">Start a New Interview</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Start an immediate interview session without scheduling. Perfect for walk-in candidates or quick screening calls.
                                </p>
                                <Button onClick={startNewInterview} size="lg" className="gap-2">
                                    <VideoIcon className="w-4 h-4" />
                                    Start New Interview
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InterviewLobby; 