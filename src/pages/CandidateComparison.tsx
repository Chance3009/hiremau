import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Award, 
  Briefcase, 
  GraduationCap,
  Check,
  X,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  education: string;
  skills: string[];
  resume: string;
  interviewNotes: string;
  rating: number;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    title: 'Software Engineer',
    email: 'alice.j@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    experience: 5,
    education: 'Master of Science in Computer Science',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
    resume: 'alice_resume.pdf',
    interviewNotes: 'Strong technical skills, good communication.',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Bob Williams',
    title: 'Frontend Developer',
    email: 'bob.w@example.com',
    phone: '987-654-3210',
    location: 'Los Angeles, CA',
    experience: 3,
    education: 'Bachelor of Arts in Web Development',
    skills: ['JavaScript', 'React', 'Redux', 'HTML', 'CSS'],
    resume: 'bob_resume.pdf',
    interviewNotes: 'Passionate about UI, needs more experience with backend.',
    rating: 4.0,
  },
  {
    id: '3',
    name: 'Charlie Brown',
    title: 'Backend Developer',
    email: 'charlie.b@example.com',
    phone: '555-123-4567',
    location: 'Chicago, IL',
    experience: 7,
    education: 'PhD in Computer Engineering',
    skills: ['Python', 'Django', 'SQL', 'Docker', 'AWS'],
    resume: 'charlie_resume.pdf',
    interviewNotes: 'Expert in backend systems, excellent problem-solver.',
    rating: 5.0,
  },
];

const CandidateComparison = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['1', '2']);
  const [viewMode, setViewMode<'resume' | 'interview'>('resume');

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getCandidate = (id: string) =>
    mockCandidates.find((candidate) => candidate.id === id);

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
      <Tabs defaultValue={viewMode} className="w-full">
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
