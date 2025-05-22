
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, Mic, MicOff } from 'lucide-react';

interface InterviewAssistantProps {
  candidateName: string;
  position: string;
  onSuggestionUse?: (suggestion: string) => void;
}

const InterviewAssistant: React.FC<InterviewAssistantProps> = ({
  candidateName,
  position,
  onSuggestionUse
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Mock function to toggle recording - in a real app, this would use the Web Speech API
  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    
    // Simulate transcript and analysis for demo
    if (!isRecording) {
      // Starting recording
      setAnalysis(null);
      setTimeout(() => {
        const newLine = `You: Can you tell me about your experience with React?`;
        setTranscript(prev => [...prev, newLine]);
        
        setTimeout(() => {
          const response = `${candidateName}: I've been working with React for about 3 years now. I started with class components but now primarily use functional components with hooks. I've built several complex applications including an e-commerce platform and a dashboard for a financial services company.`;
          setTranscript(prev => [...prev, response]);
          
          // Generate analysis and suggestions
          setAnalysis("The candidate has solid React experience with both class and functional components. Their experience with complex applications is relevant to the position.");
          setSuggestions([
            "Ask about specific React hooks they use frequently",
            "Inquire about state management approaches they prefer",
            "Ask about testing strategies for their React components"
          ]);
        }, 2000);
      }, 1000);
    }
  };
  
  const handleUseSuggestion = (suggestion: string) => {
    if (onSuggestionUse) {
      onSuggestionUse(suggestion);
    }
    
    // Add the suggestion to the transcript
    setTranscript(prev => [...prev, `You: ${suggestion}`]);
    
    // Simulate a response
    setTimeout(() => {
      let response = '';
      if (suggestion.includes('hooks')) {
        response = `${candidateName}: I commonly use useState and useEffect, but I'm also comfortable with useContext, useReducer, and useMemo for optimization. I've also created custom hooks for form handling and authentication.`;
      } else if (suggestion.includes('state management')) {
        response = `${candidateName}: For simpler apps, I use React's Context API with useReducer. For more complex state, I've used Redux, but lately I've been preferring Zustand for its simplicity. I've also worked with React Query for server state.`;
      } else if (suggestion.includes('testing')) {
        response = `${candidateName}: I use Jest with React Testing Library for unit and integration tests. I focus on testing behavior rather than implementation details. I also set up Cypress for end-to-end testing on larger projects.`;
      }
      
      if (response) {
        setTranscript(prev => [...prev, response]);
        
        // Update analysis based on new information
        setAnalysis(prev => prev + " The candidate demonstrates depth of knowledge in modern React development practices.");
        
        // Update suggestions
        setSuggestions([
          "Ask about a challenging React problem they solved",
          "Inquire about their experience with React performance optimization",
          "Ask how they stay updated with React ecosystem changes"
        ]);
      }
    }, 1500);
  };
  
  const handleAskAssistant = () => {
    // Simulate getting help from AI assistant
    setAnalysis("The candidate's React experience aligns well with our requirements. Consider asking about their experience with our specific tech stack (Next.js, Tailwind CSS) to further evaluate fit.");
    setSuggestions([
      "Do you have experience with Next.js?",
      "Have you worked with Tailwind CSS?",
      "What's your approach to responsive design in React applications?"
    ]);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Interview Transcript
          </CardTitle>
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            onClick={toggleRecording}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto border rounded-md p-3 bg-muted/30 space-y-2">
            {transcript.length === 0 ? (
              <div className="text-muted-foreground text-center py-20">
                Start recording to capture the interview transcript
              </div>
            ) : (
              transcript.map((line, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md ${line.startsWith('You:') ? 'bg-muted' : 'bg-primary/5'}`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Real-time Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-md">
                {analysis}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Suggested Follow-ups:</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-primary/5 p-2 rounded-md"
                    >
                      <span>{suggestion}</span>
                      <Button size="sm" onClick={() => handleUseSuggestion(suggestion)}>Use</Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleAskAssistant}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Assistant
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Not Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-12">
              Analysis will appear as the interview progresses
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewAssistant;
