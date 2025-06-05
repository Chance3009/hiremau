import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Check, Mail, MapPin, Phone, User } from 'lucide-react';

// Mock data
const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: 5,
    education: 'BS Computer Science',
    interviewNotes: 'Strong technical skills, good communication. Shows leadership potential.'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8901',
    location: 'San Francisco, USA',
    skills: ['Angular', 'Python', 'AWS'],
    experience: 7,
    education: 'MS Software Engineering',
    interviewNotes: 'Excellent problem-solving abilities. Great team player with strong architectural background.'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    phone: '+1 234 567 8902',
    location: 'Austin, USA',
    skills: ['Vue.js', 'Java', 'Docker'],
    experience: 4,
    education: 'BS Information Technology',
    interviewNotes: 'Good technical foundation. Enthusiastic about learning new technologies.'
  }
];

const getCandidate = (id: string) => mockCandidates.find(c => c.id === id);

const CandidateComparison = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['1', '2']);
  const [viewMode, setViewMode] = useState<'resume' | 'interview'>('resume');

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length < 2) {
        return [...prev, candidateId];
      }
      return [prev[1], candidateId];
    });
  };

  const isSelected = (candidateId: string) =>
    selectedCandidates.includes(candidateId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compare Candidates</h1>
            <p className="text-muted-foreground">Side-by-side candidate evaluation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Comparison
          </Button>
          <Button size="sm">
            Add to Shortlist
          </Button>
        </div>
      </div>

      {/* Candidate Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Candidates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCandidates.map((candidate) => (
              <Button
                key={candidate.id}
                variant={isSelected(candidate.id) ? 'secondary' : 'outline'}
                className="justify-start gap-2"
                onClick={() => handleCandidateToggle(candidate.id)}
              >
                {isSelected(candidate.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {candidate.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <Tabs value={viewMode} className="w-full">
        <TabsList>
          <TabsTrigger value="resume" onClick={() => setViewMode('resume')}>
            Resume View
          </TabsTrigger>
          <TabsTrigger value="interview" onClick={() => setViewMode('interview')}>
            Interview Notes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resume">
          {/* Resume Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCandidates.map((candidateId) => {
              const candidate = getCandidate(candidateId);
              return (
                candidate && (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <CardTitle>{candidate.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          <Mail className="h-4 w-4 inline-block mr-1" />
                          {candidate.email}
                        </p>
                        <p>
                          <Phone className="h-4 w-4 inline-block mr-1" />
                          {candidate.phone}
                        </p>
                        <p>
                          <MapPin className="h-4 w-4 inline-block mr-1" />
                          {candidate.location}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill}>{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Experience</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.experience} years
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Education</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.education}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="interview">
          {/* Interview Notes Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCandidates.map((candidateId) => {
              const candidate = getCandidate(candidateId);
              return (
                candidate && (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <CardTitle>{candidate.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] w-full">
                        <p className="text-sm text-muted-foreground">
                          {candidate.interviewNotes}
                        </p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateComparison;
