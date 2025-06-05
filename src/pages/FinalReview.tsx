import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Check, X, Download, Send, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CandidateComparison, { Candidate } from '@/components/candidate/CandidateComparison';
import ContextFilter from '@/components/layout/ContextFilter';

// Mock events and positions for filtering
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
  { id: 'shortlist', name: 'Shortlisted' },
  { id: 'kiv', name: 'Keep in View' },
  { id: 'reject', name: 'Rejected' }
];

const FinalReview = () => {
  const [sendingEmails, setSendingEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const navigate = useNavigate();

  // Mock candidates data that would come from a backend in a real app
  const candidates: Candidate[] = [
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
  ];

  // Mock candidate statuses
  const candidateStatuses = {
    '1': 'shortlist',
    '2': 'shortlist',
    '3': 'kiv',
    '4': 'reject'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlist':
        return 'bg-recruit-shortlist text-recruit-shortlistText';
      case 'kiv':
        return 'bg-recruit-kiv text-recruit-kivText';
      case 'reject':
        return 'bg-recruit-reject text-recruit-rejectText';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlist':
        return <Check className="h-4 w-4" />;
      case 'kiv':
        return <Clock className="h-4 w-4" />;
      case 'reject':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleSendEmails = () => {
    setSendingEmails(true);

    // Simulate API call
    setTimeout(() => {
      setSendingEmails(false);
      toast({
        title: "Status Emails Sent",
        description: "All candidates have been notified of their status.",
      });
    }, 2000);
  };

  const handleExport = () => {
    toast({
      title: "Data Exported",
      description: "Candidate data has been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Final Review</h1>
          <p className="text-muted-foreground">Review candidate statuses and take final actions.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/candidate-comparison')}
          className="flex items-center gap-2"
        >
          <Users size={20} />
          Compare Candidates
        </Button>
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
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Candidates Review</CardTitle>
          <CardDescription>Review and finalize candidate statuses</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{candidate.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(candidateStatuses[candidate.id as keyof typeof candidateStatuses])}`}
                      >
                        {getStatusIcon(candidateStatuses[candidate.id as keyof typeof candidateStatuses])}
                        {candidateStatuses[candidate.id as keyof typeof candidateStatuses] === 'shortlist'
                          ? 'Shortlisted'
                          : candidateStatuses[candidate.id as keyof typeof candidateStatuses] === 'kiv'
                            ? 'Keep in View'
                            : 'Rejected'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Interview Score</div>
                    <div className="text-lg font-bold">{candidate.interviewScore}%</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Interview Notes: </span>
                    <span className="text-muted-foreground">{candidate.interviewNotes}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Fit Score:</span>
                    <span className="text-sm">{candidate.score}%</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => window.location.href = `/candidate/${candidate.id}`}>View Details</Button>
                    <Button size="sm">
                      Change Status
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalReview;
