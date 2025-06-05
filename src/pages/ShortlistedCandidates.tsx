import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Star, Mail, Phone, Building2, Calendar, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mock data for shortlisted candidates
const mockShortlisted = [
    {
        id: '1',
        name: 'Alex Johnson',
        position: 'Frontend Developer',
        matchScore: 92,
        currentCompany: 'TechCorp',
        email: 'alex.j@example.com',
        phone: '+1 234-567-8900',
        interviewScore: 88,
        shortlistedDate: '2024-03-20',
        status: 'Pending Offer',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: '5 years',
        education: 'B.S. Computer Science'
    },
    // Add more mock data as needed
];

const ShortlistedCandidates = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Shortlisted Candidates</h2>
                    <p className="text-sm text-muted-foreground">Review and make final decisions</p>
                </div>
                <Button onClick={() => navigate('/candidate-comparison')}>
                    Compare Candidates
                </Button>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-4">
                    <div className="w-[200px]">
                        <Label htmlFor="sort">Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger id="sort">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Shortlisted Date</SelectItem>
                                <SelectItem value="score">Match Score</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Grid
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4 mr-2" />
                        List
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockShortlisted.map((candidate) => (
                        <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                            <p className="text-muted-foreground">{candidate.position}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                                <span>{candidate.currentCompany}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{candidate.status}</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Brain className="h-4 w-4 text-primary" />
                                                <span>Match Score: {candidate.matchScore}%</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span>Interview Score: {candidate.interviewScore}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <a href={`mailto:${candidate.email}`} className="hover:text-primary">
                                                    {candidate.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{candidate.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Shortlisted: {candidate.shortlistedDate}</span>
                                        </div>
                                        <Button size="sm" onClick={() => navigate(`/offer/${candidate.id}`)}>
                                            Make Offer
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Shortlisted Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Match Score</TableHead>
                                    <TableHead>Interview Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Shortlisted Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockShortlisted.map((candidate) => (
                                    <TableRow key={candidate.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{candidate.name}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Building2 className="h-4 w-4" />
                                                    {candidate.currentCompany}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{candidate.position}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Brain className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{candidate.matchScore}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="font-medium">{candidate.interviewScore}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{candidate.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {candidate.shortlistedDate}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                                                >
                                                    View Profile
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`/offer/${candidate.id}`)}
                                                >
                                                    Make Offer
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ShortlistedCandidates; 