import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Brain,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface InterviewAssistantProps {
  jobTitle: string;
  candidateName: string;
  jobRequirements: string[];
  onUpdateScore: (score: number) => void;
  onAddNote: (note: string) => void;
}

const InterviewAssistant: React.FC<InterviewAssistantProps> = ({
  jobTitle,
  candidateName,
  jobRequirements,
  onUpdateScore,
  onAddNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [fitScore, setFitScore] = useState(0);
  const [quickNotes, setQuickNotes] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [flags, setFlags] = useState<{ positive: string[], negative: string[] }>({
    positive: [],
    negative: []
  });

  // Mock speech recognition (replace with actual Web Speech API implementation)
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        // Simulate receiving transcript updates
        setTranscript(prev => prev + ' ' + mockTranscriptUpdate());
        updateAnalysis();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Mock transcript generation
  const mockTranscriptUpdate = () => {
    const responses = [
      "I have experience with React and TypeScript",
      "I led a team of five developers",
      "We implemented CI/CD pipelines",
      "I'm passionate about user experience",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Update analysis based on transcript
  const updateAnalysis = () => {
    // Mock AI analysis (replace with actual AI service calls)
    const newScore = Math.min(100, fitScore + Math.random() * 10);
    setFitScore(newScore);
    onUpdateScore(newScore);

    // Update suggested questions
    setSuggestedQuestions([
      "Can you elaborate on your experience with CI/CD?",
      "How do you approach team conflicts?",
      "Tell me about a challenging project you led",
    ]);

    // Update flags
    setFlags({
      positive: ["Strong technical background", "Team leadership experience"],
      negative: ["Limited cloud experience", "No mention of testing practices"],
    });
  };

  // Quick note templates
  const quickNoteTemplates = [
    "Strong communication skills",
    "Good technical knowledge",
    "Enthusiastic about role",
    "Needs improvement in technical areas",
    "Cultural fit concern",
  ];

  const addQuickNote = (note: string) => {
    setQuickNotes(prev => [...prev, `${new Date().toLocaleTimeString()}: ${note}`]);
    onAddNote(note);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Interview Assistant</span>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Real-time Transcript</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <p className="text-sm">{transcript || "Transcript will appear here..."}</p>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Fit Score</h3>
            <Progress value={fitScore} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">
              {fitScore}% match for {jobTitle}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Quick Notes</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickNoteTemplates.map((note, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addQuickNote(note)}
                >
                  {note}
                </Badge>
              ))}
            </div>
            <ScrollArea className="h-[100px] border rounded-md p-2">
              {quickNotes.map((note, index) => (
                <p key={index} className="text-sm mb-1">{note}</p>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Suggested Questions</h3>
            <ScrollArea className="h-[150px] border rounded-md p-2">
              {suggestedQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => setCurrentTopic(question)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <p className="text-sm">{question}</p>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                Strengths
              </h3>
              <ul className="text-sm space-y-1">
                {flags.positive.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                Areas to Probe
              </h3>
              <ul className="text-sm space-y-1">
                {flags.negative.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Current Topic</h3>
            <div className="border rounded-md p-3 bg-muted">
              <p className="text-sm">
                {currentTopic || "Select a suggested question to focus on this topic"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewAssistant;
