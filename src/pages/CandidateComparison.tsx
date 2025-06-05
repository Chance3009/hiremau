import React, { useState, useMemo } from 'react';
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContextFilter from '@/components/layout/ContextFilter';
import CandidateComparisonComponent from '@/components/candidate/CandidateComparison';
import { cn } from '@/lib/utils';

// Mock data for events and positions
const mockEvents = [
  { id: '1', name: 'UPM Career Fair 2025' },
  { id: '2', name: 'Tech Recruit Summit' },
  { id: '3', name: 'Engineering Talent Day' }
];

const mockPositions = [
  { id: '1', name: 'Frontend Developer' },
  { id: '2', name: 'UX Designer' },
  { id: '3', name: 'Backend Developer' },
  { id: '4', name: 'Product Manager' },
];

const mockStatuses = [
  { id: 'new', name: 'New' },
  { id: 'screened', name: 'Screened' },
  { id: 'shortlisted', name: 'Shortlisted' },
  { id: 'interviewed', name: 'Interviewed' },
  { id: 'rejected', name: 'Rejected' }
];

// Mock candidate data
const mockCandidates = [
  {
    id: '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    skills: ["React", "TypeScript", "Node.js", "CSS"],
    experience: [
      "Senior Frontend Developer at TechCorp (3 years)",
      "Web Developer at StartupXYZ (2 years)"
    ],
    education: ["B.S. Computer Science, State University (2019)"],
    score: 85,
    interviewScore: 87,
    interviewNotes: 'Strong technical skills, excellent cultural fit.'
  },
  {
    id: '2',
    name: 'Sam Taylor',
    position: 'UX Designer',
    skills: ["Figma", "UI Design", "User Research", "HTML/CSS"],
    experience: [
      "UX Designer at DesignCo (2 years)",
      "UI Designer at CreativeLabs (1 year)"
    ],
    education: ["B.F.A. Design, Art Institute (2020)"],
    score: 78,
    interviewScore: 82,
    interviewNotes: 'Great portfolio, good communication skills.'
  },
  {
    id: '3',
    name: 'Morgan Smith',
    position: 'Backend Developer',
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
    experience: [
      "Junior Backend Developer at TechStart (1 year)"
    ],
    education: ["B.S. Computer Engineering, Tech University (2022)"],
    score: 68,
    interviewScore: 73,
    interviewNotes: 'Good technical knowledge but limited experience.'
  },
  {
    id: '4',
    name: 'Jordan Lee',
    position: 'Product Manager',
    skills: ["Product Strategy", "Agile", "User Stories", "Market Research"],
    experience: [
      "Assistant Product Manager at ProductCo (1 year)",
      "Business Analyst at CorpTech (1 year)"
    ],
    education: ["MBA, Business School (2021)"],
    score: 55,
    interviewScore: 62,
    interviewNotes: 'Not enough relevant experience.'
  },
  {
    id: '5',
    name: 'Riley Zhang',
    position: 'Frontend Developer',
    skills: ["React", "JavaScript", "CSS", "Redux"],
    experience: [
      "Frontend Developer at WebSolutions (2 years)",
      "Junior Developer at TechInc (1 year)"
    ],
    education: ["B.S. Information Technology, Tech University (2020)"],
    score: 72,
    interviewScore: 76,
    interviewNotes: 'Good technical skills, shows potential for growth.'
  },
];

const CandidateComparison = () => {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Filter candidates based on context filters
  const filteredCandidates = useMemo(() => {
    let filtered = [...mockCandidates];

    if (activePosition) {
      filtered = filtered.filter(c => c.position === activePosition);
    }

    return filtered;
  }, [activePosition]);

  // Get selected candidates data
  const selectedCandidatesData = useMemo(() =>
    filteredCandidates.filter(c => selectedCandidates.includes(c.id)),
    [filteredCandidates, selectedCandidates]
  );

  return (
    <div className="section-spacing">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Comparison</h1>
          <p className="page-subtitle">Compare candidates side by side to make better decisions.</p>
        </div>
      </div>

      <ContextFilter
        events={mockEvents}
        positions={mockPositions}
        statuses={mockStatuses}
        activeEvent={activeEvent}
        setActiveEvent={setActiveEvent}
        activePosition={activePosition}
        setActivePosition={setActivePosition}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        showViewToggle={false}
      />

      <Card>
        <CardHeader className="card-padding">
          <CardTitle className="card-header-lg">Select Candidates</CardTitle>
          <CardDescription>Select up to 3 candidates to compare their qualifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Select candidates to compare (up to 3):</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                className={cn(
                  "group relative p-4 border rounded-lg cursor-pointer transition-all",
                  selectedCandidates.includes(candidate.id)
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "hover:bg-muted/50"
                )}
                onClick={() => {
                  setSelectedCandidates(prev => {
                    if (prev.includes(candidate.id)) {
                      return prev.filter(id => id !== candidate.id);
                    } else {
                      if (prev.length >= 3) return prev;
                      return [...prev, candidate.id];
                    }
                  });
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{candidate.position}</p>
                  </div>
                  {selectedCandidates.includes(candidate.id) && (
                    <div className="shrink-0 rounded-full bg-primary h-5 w-5 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">Score:</div>
                    <div className="font-medium">{candidate.score}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              {selectedCandidates.length} of 3 candidates selected
            </p>
            <Button
              disabled={selectedCandidates.length < 2}
              onClick={() => {
                // Scroll to comparison section
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
              }}
            >
              Compare Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCandidates.length >= 2 && (
        <CandidateComparisonComponent
          candidates={selectedCandidatesData}
        />
      )}
    </div>
  );
};

export default CandidateComparison;
