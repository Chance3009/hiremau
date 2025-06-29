import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface InterviewChatbotProps {
    onSendMessage: (message: string) => Promise<void>;
}

const InterviewChatbot: React.FC<InterviewChatbotProps> = ({ onSendMessage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'assistant',
            content: 'Hello! I\'m your interview assistant. I can help you with technical questions and candidate evaluation. How can I help you today?',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        try {
            await onSendMessage(input);
            // Simulated response - in real implementation, this would come from the backend
            const assistantResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'Here\'s what I found in our knowledge base...',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, assistantResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Interview Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg p-3">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about technical concepts, evaluation criteria..."
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <Button onClick={handleSend} disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InterviewChatbot; 