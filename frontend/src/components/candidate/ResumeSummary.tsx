
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ResumeSummaryProps {
  candidate?: {
    name: string;
    position: string;
    skills: string[];
    experience: string[];
    education: string[];
    fitScore: number;
    isAIGenerated: boolean;
  };
  onStatusChange: (status: 'shortlist' | 'kiv' | 'reject') => void;
  onNotesChange: (notes: string) => void;
}

const ResumeSummary: React.FC<ResumeSummaryProps> = ({ 
  candidate, 
  onStatusChange,
  onNotesChange
}) => {
  const [notes, setNotes] = React.useState('');
  
  // This is a placeholder. In a real app, this would be populated with actual data
  const demoCandidate = {
    name: "Alex Johnson",
    position: "Frontend Developer",
    skills: ["React", "TypeScript", "CSS", "Node.js", "Git"],
    experience: [
      "Senior Frontend Developer at TechCorp (3 years)",
      "Web Developer at StartupXYZ (2 years)"
    ],
    education: ["B.S. Computer Science, State University (2019)"],
    fitScore: 85,
    isAIGenerated: true,
  };
  
  const displayCandidate = candidate || demoCandidate;
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesChange(e.target.value);
  };
  
  const getFitScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resume Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">{displayCandidate.name}</h3>
              <p className="text-muted-foreground">{displayCandidate.position}</p>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right">
                <div className="text-sm font-medium">Fit Score</div>
                <div className={`text-2xl font-bold ${getFitScoreColor(displayCandidate.fitScore)}`}>
                  {displayCandidate.fitScore}%
                </div>
              </div>
            </div>
          </div>
          
          {displayCandidate.isAIGenerated && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Potential AI-Generated Content Detected</h4>
                <p className="text-sm text-amber-700">
                  Our system has flagged this resume as potentially AI-generated. Review carefully before proceeding.
                </p>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Key Skills</h4>
            <div className="flex flex-wrap gap-2">
              {displayCandidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Experience</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {displayCandidate.experience.map((exp, index) => (
                <li key={index}>{exp}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Education</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {displayCandidate.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Position Skills Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>React</span>
              <span className="text-green-500 font-medium">Strong Match</span>
            </div>
            <div className="flex justify-between items-center">
              <span>TypeScript</span>
              <span className="text-green-500 font-medium">Strong Match</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Node.js</span>
              <span className="text-amber-500 font-medium">Partial Match</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Redux</span>
              <span className="text-red-500 font-medium">Not Found</span>
            </div>
            <div className="flex justify-between items-center">
              <span>GraphQL</span>
              <span className="text-red-500 font-medium">Not Found</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recruiter Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your observations, questions, or concerns here..."
            className="min-h-[120px]"
            value={notes}
            onChange={handleNotesChange}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              className="bg-recruit-shortlist text-recruit-shortlistText border border-recruit-shortlistBorder hover:bg-recruit-shortlist/80"
              onClick={() => onStatusChange('shortlist')}
            >
              <Check className="mr-2 h-4 w-4" />
              Shortlist
            </Button>
            <Button
              className="bg-recruit-kiv text-recruit-kivText border border-recruit-kivBorder hover:bg-recruit-kiv/80"
              onClick={() => onStatusChange('kiv')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Keep in View
            </Button>
            <Button
              className="bg-recruit-reject text-recruit-rejectText border border-recruit-rejectBorder hover:bg-recruit-reject/80"
              onClick={() => onStatusChange('reject')}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeSummary;
