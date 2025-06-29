import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, AlertTriangle, CheckCircle, Bot } from 'lucide-react';

interface Message {
    id: string;
    type: 'question' | 'answer';
    content: string;
    timestamp: string;
    comment?: string;
    aiAnalysis?: {
        authenticity: number;
        contradictions: string[];
        keyInsights: string[];
    };
}

interface InterviewTranscriptProps {
    messages: Message[];
    onAddComment: (messageId: string, comment: string) => void;
    onRequestAiAnalysis: (messageId: string) => void;
}

const InterviewTranscript: React.FC<InterviewTranscriptProps> = ({
    messages,
    onAddComment,
    onRequestAiAnalysis,
}) => {
    const [activeComment, setActiveComment] = useState<string>('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <Card key={message.id} className={`border-l-4 ${message.type === 'question' ? 'border-l-blue-500' : 'border-l-green-500'
                    }`}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${message.type === 'question' ? 'bg-blue-100' : 'bg-green-100'
                                }`}>
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium">{message.content}</p>
                                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                </div>

                                {/* Quick Comments Section */}
                                <div className="flex items-center gap-2 mt-2">
                                    {editingMessageId === message.id ? (
                                        <div className="flex-1 flex gap-2">
                                            <Input
                                                value={activeComment}
                                                onChange={(e) => setActiveComment(e.target.value)}
                                                placeholder="Add a quick comment..."
                                                className="flex-1"
                                            />
                                            <Button size="sm" onClick={() => {
                                                onAddComment(message.id, activeComment);
                                                setEditingMessageId(null);
                                                setActiveComment('');
                                            }}>
                                                Save
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {message.comment && (
                                                <p className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                                    {message.comment}
                                                </p>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingMessageId(message.id);
                                                    setActiveComment(message.comment || '');
                                                }}
                                            >
                                                {message.comment ? 'Edit Comment' : 'Add Comment'}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* AI Analysis Section */}
                                {message.type === 'answer' && (
                                    <div className="mt-3 space-y-2">
                                        {message.aiAnalysis ? (
                                            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Bot className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium">AI Analysis</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm">
                                                            Authenticity Score: {message.aiAnalysis.authenticity}%
                                                        </span>
                                                    </div>
                                                    {message.aiAnalysis.contradictions.length > 0 && (
                                                        <div className="flex items-start gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-1" />
                                                            <div className="text-sm">
                                                                <p className="font-medium">Potential Contradictions:</p>
                                                                <ul className="list-disc list-inside">
                                                                    {message.aiAnalysis.contradictions.map((contradiction, i) => (
                                                                        <li key={i}>{contradiction}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="text-sm">
                                                        <p className="font-medium">Key Insights:</p>
                                                        <ul className="list-disc list-inside">
                                                            {message.aiAnalysis.keyInsights.map((insight, i) => (
                                                                <li key={i}>{insight}</li>
                                                            ))}
                                                        </ul>
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
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default InterviewTranscript; 