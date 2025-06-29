import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Bot,
    ThumbsUp,
    ThumbsDown,
    AlertCircle,
    Star,
    Plus
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    type: 'question' | 'answer';
    content: string;
    timestamp: string;
    comment?: string;
    rating?: 'positive' | 'negative' | 'neutral';
    quickNotes?: string[];
    aiAnalysis?: {
        authenticity: number;
        contradictions: string[];
        keyInsights: string[];
        resumeMatch?: {
            matches: string[];
            discrepancies: string[];
        };
    };
}

interface InterviewTranscriptProps {
    messages: Message[];
    onAddComment: (messageId: string, comment: string) => void;
    onAddQuickNote: (messageId: string, note: string) => void;
    onRateResponse: (messageId: string, rating: 'positive' | 'negative' | 'neutral') => void;
    onRequestAiAnalysis: (messageId: string) => void;
    isTranscribing?: boolean;
}

export const InterviewTranscriptNew: React.FC<InterviewTranscriptProps> = ({
    messages,
    onAddComment,
    onAddQuickNote,
    onRateResponse,
    onRequestAiAnalysis,
    isTranscribing = false,
}) => {
    const [activeComment, setActiveComment] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [quickNoteInput, setQuickNoteInput] = useState<string>('');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAddComment = (messageId: string) => {
        if (commentText.trim()) {
            onAddComment(messageId, commentText);
            setCommentText('');
            setActiveComment(null);
        }
    };

    const handleAddQuickNote = (messageId: string) => {
        if (quickNoteInput.trim()) {
            onAddQuickNote(messageId, quickNoteInput);
            setQuickNoteInput('');
        }
    };

    return (
        <ScrollArea ref={scrollRef} className="h-full pr-4">
            <div className="space-y-4">
                {messages.map((message) => (
                    <Card key={message.id} className={cn(
                        "border-l-4",
                        message.type === 'question' ? "border-l-blue-500" : "border-l-green-500"
                    )}>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {/* Message Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {message.type === 'question' ? 'Interviewer' : 'Candidate'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {message.timestamp}
                                        </span>
                                    </div>
                                    {message.type === 'answer' && (
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "h-8 w-8 p-0",
                                                                message.rating === 'positive' && "text-green-500",
                                                                message.rating === 'negative' && "text-red-500"
                                                            )}
                                                            onClick={() => onRateResponse(message.id, 'positive')}
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Rate as Good Response</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "h-8 w-8 p-0",
                                                                message.rating === 'negative' && "text-red-500"
                                                            )}
                                                            onClick={() => onRateResponse(message.id, 'negative')}
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Rate as Poor Response</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className="text-sm leading-relaxed">
                                    {message.content}
                                    {isTranscribing && message.id === messages[messages.length - 1].id && (
                                        <span className="inline-block animate-pulse">▊</span>
                                    )}
                                </div>

                                {/* Quick Notes Input */}
                                {message.type === 'answer' && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            placeholder="Add a quick note..."
                                            value={quickNoteInput}
                                            onChange={(e) => setQuickNoteInput(e.target.value)}
                                            className="text-xs h-7"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddQuickNote(message.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7"
                                            onClick={() => handleAddQuickNote(message.id)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Quick Notes Display */}
                                {message.quickNotes && message.quickNotes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {message.quickNotes.map((note, index) => (
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

                                {/* AI Analysis for Answers */}
                                {message.type === 'answer' && (
                                    <div className="mt-3 space-y-2">
                                        {message.aiAnalysis ? (
                                            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Bot className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium">AI Analysis</span>
                                                </div>
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className={cn(
                                                            "h-3 w-3",
                                                            message.aiAnalysis.authenticity >= 80 ? "text-green-500" :
                                                                message.aiAnalysis.authenticity >= 50 ? "text-yellow-500" :
                                                                    "text-red-500"
                                                        )} />
                                                        <span>
                                                            Authenticity Score: {message.aiAnalysis.authenticity}%
                                                        </span>
                                                    </div>

                                                    {/* Resume Matches */}
                                                    {message.aiAnalysis.resumeMatch && (
                                                        <div className="mt-2">
                                                            <div className="mb-1">
                                                                <span className="font-medium">Resume Analysis:</span>
                                                            </div>
                                                            {message.aiAnalysis.resumeMatch.matches.length > 0 && (
                                                                <div className="pl-4 text-green-600">
                                                                    {message.aiAnalysis.resumeMatch.matches.map((match, index) => (
                                                                        <div key={index} className="flex items-start gap-1">
                                                                            <CheckCircle className="h-3 w-3 mt-0.5" />
                                                                            <span>{match}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {message.aiAnalysis.resumeMatch.discrepancies.length > 0 && (
                                                                <div className="pl-4 text-yellow-600">
                                                                    {message.aiAnalysis.resumeMatch.discrepancies.map((discrepancy, index) => (
                                                                        <div key={index} className="flex items-start gap-1">
                                                                            <AlertCircle className="h-3 w-3 mt-0.5" />
                                                                            <span>{discrepancy}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Key Insights */}
                                                    <div className="mt-2">
                                                        <span className="font-medium">Key Insights:</span>
                                                        <div className="pl-4 mt-1">
                                                            {message.aiAnalysis.keyInsights.map((insight, index) => (
                                                                <div key={index} className="flex items-start gap-1">
                                                                    <Star className="h-3 w-3 text-blue-500 mt-0.5" />
                                                                    <span>{insight}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => onRequestAiAnalysis(message.id)}
                                            >
                                                <Bot className="h-3 w-3 mr-1" />
                                                Analyze Response
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Comments Section */}
                                {(message.comment || activeComment === message.id) && (
                                    <div className="mt-3 pl-4 border-l-2">
                                        {activeComment === message.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add your comment..."
                                                    className="text-xs"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAddComment(message.id)}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                {message.comment}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}; 