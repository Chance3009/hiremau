import React, { useState } from 'react';
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ContextFilter from '@/components/layout/ContextFilter';
import CandidateComparisonComponent from '@/components/candidate/CandidateComparison';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Comparison</h1>
        <p className="text-muted-foreground">Compare candidates side by side to make better decisions.</p>
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
        <CardHeader>
          <CardTitle>Select Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">Select candidates to compare (up to 3):</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {mockCandidates.map(candidate => (
              <div
                key={candidate.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedCandidates.includes(candidate.id)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                  }`}
                onClick={() => {
                  setSelectedCandidates(prev => {
                    if (prev.includes(candidate.id)) {
                      return prev.filter(id => id !== candidate.id);
                    } else {
                      // Limit to 3 candidates
                      if (prev.length >= 3) return prev;
                      return [...prev, candidate.id];
                    }
                  });
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                  {selectedCandidates.includes(candidate.id) && (
                    <div className="rounded-full bg-primary h-5 w-5 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              disabled={selectedCandidates.length < 2}
              onClick={() => {
                // Scrolling to the comparison section
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
              }}
            >
              Compare Selected ({selectedCandidates.length}/3)
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCandidates.length > 0 && (
        <CandidateComparisonComponent
          candidates={mockCandidates.filter(c => selectedCandidates.includes(c.id))}
        />
      )}
    </div>
  );
};

export default CandidateComparison;
