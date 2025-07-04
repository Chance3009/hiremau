import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    HelpCircle,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    MessageSquare,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
    id: string;
    text: string;
    type: 'technical' | 'behavioral' | 'follow-up' | 'probe';
    priority: 'high' | 'medium' | 'low';
    context?: string;
    aiReasoning?: string;
}

interface SuggestedQuestionsProps {
    questions: Question[];
    onSelectQuestion: (question: Question) => void;
    onRefreshQuestions: () => void;
    isRefreshing?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
    questions,
    onSelectQuestion,
    onRefreshQuestions,
    isRefreshing = false,
}) => {
    const getQuestionTypeIcon = (type: Question['type']) => {
        switch (type) {
            case 'technical':
                return <CheckCircle className="h-3 w-3 text-blue-500" />;
            case 'behavioral':
                return <MessageSquare className="h-3 w-3 text-green-500" />;
            case 'follow-up':
                return <Star className="h-3 w-3 text-yellow-500" />;
            case 'probe':
                return <AlertCircle className="h-3 w-3 text-red-500" />;
            default:
                return <HelpCircle className="h-3 w-3 text-muted-foreground" />;
        }
    };

    const getPriorityClass = (priority: Question['priority']) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-green-200 bg-green-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="card-padding pb-2 flex-[0_0_auto] border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="card-header-md">Suggested Questions</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshQuestions}
                        disabled={isRefreshing}
                        className={cn(
                            "h-8 w-8 p-0",
                            isRefreshing && "animate-spin"
                        )}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className={cn(
                                    "border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm",
                                    getPriorityClass(question.priority)
                                )}
                                onClick={() => onSelectQuestion(question)}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        {getQuestionTypeIcon(question.type)}
                                        <span className="text-sm font-medium">
                                            {question.text}
                                        </span>
                                    </div>
                                    {question.context && (
                                        <div className="text-xs text-muted-foreground pl-5">
                                            Context: {question.context}
                                        </div>
                                    )}
                                    {question.aiReasoning && (
                                        <div className="text-xs text-blue-600 pl-5 flex items-start gap-1">
                                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                            <span>{question.aiReasoning}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}; 