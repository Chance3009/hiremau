import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Mic,
  MicOff,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Star,
  Plus,
  Bot
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
  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<{
    authenticity: number;
    resumeMatch?: {
      matches: string[];
      discrepancies: string[];
    };
  } | null>(null);

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

    // Update suggested questions based on context
    setSuggestedQuestions([
      "Can you elaborate on your experience with CI/CD?",
      "How do you approach team conflicts?",
      "Tell me about a challenging project you led",
    ]);

    // Update flags and AI analysis
    setFlags({
      positive: ["Strong technical background", "Team leadership experience"],
      negative: ["Limited cloud experience", "No mention of testing practices"],
    });

    setAiAnalysis({
      authenticity: 85,
      resumeMatch: {
        matches: ["Experience aligns with stated React expertise", "Leadership role confirmed"],
        discrepancies: ["Cloud experience needs verification"]
      }
    });
  };

  const handleAddQuickNote = () => {
    if (quickNoteInput.trim()) {
      const note = `${new Date().toLocaleTimeString()}: ${quickNoteInput}`;
      setQuickNotes(prev => [...prev, note]);
      onAddNote(quickNoteInput);
      setQuickNoteInput('');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Column - Transcript and Analysis */}
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
          {/* Real-time Transcript */}
          <div>
            <h3 className="text-sm font-medium mb-2">Real-time Transcript</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <p className="text-xs leading-relaxed">
                {transcript || "Transcript will appear here..."}
                {isRecording && <span className="inline-block animate-pulse ml-1">▊</span>}
              </p>
            </ScrollArea>
          </div>

          {/* Quick Notes Input */}
          <div>
            <h3 className="text-sm font-medium mb-2">Quick Notes</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a quick note..."
                value={quickNoteInput}
                onChange={(e) => setQuickNoteInput(e.target.value)}
                className="text-xs h-8"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddQuickNote();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleAddQuickNote}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quick Notes Display */}
          {quickNotes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickNotes.map((note, index) => (
                <div
                  key={index}
                  className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1"
                >
                  <Star className="h-3 w-3 text-yellow-500" />
                  {note}
                </div>
              ))}
            </div>
          )}

          {/* Fit Score */}
          <div>
            <h3 className="text-sm font-medium mb-2">Fit Score</h3>
            <Progress value={fitScore} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              {fitScore}% match for {jobTitle}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested Questions */}
          <div>
            <h3 className="text-sm font-medium mb-2">Suggested Questions</h3>
            <ScrollArea className="h-[150px] border rounded-md p-2">
              {suggestedQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer group"
                  onClick={() => setCurrentTopic(question)}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <p className="text-xs">{question}</p>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-2">Response Analysis</h3>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${aiAnalysis.authenticity >= 80 ? "text-green-500" :
                        aiAnalysis.authenticity >= 50 ? "text-yellow-500" :
                          "text-red-500"
                      }`} />
                    <span className="text-xs">
                      Authenticity Score: {aiAnalysis.authenticity}%
                    </span>
                  </div>

                  {aiAnalysis.resumeMatch && (
                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        {aiAnalysis.resumeMatch.matches.map((match, index) => (
                          <div key={index} className="flex items-start gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3 mt-0.5" />
                            <span>{match}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {aiAnalysis.resumeMatch.discrepancies.map((discrepancy, index) => (
                          <div key={index} className="flex items-start gap-1 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mt-0.5" />
                            <span>{discrepancy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strengths and Areas to Probe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                Strengths
              </h3>
              <ul className="text-xs space-y-1">
                {flags.positive.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
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
              <ul className="text-xs space-y-1">
                {flags.negative.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Current Topic */}
          <div>
            <h3 className="text-sm font-medium mb-2">Current Topic</h3>
            <div className="border rounded-md p-3 bg-muted">
              <p className="text-xs">
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
