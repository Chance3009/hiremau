
import React, { useState } from 'react';
import { Message, EditingLabel } from '@/types/interview';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ThumbsUp, ThumbsDown, AlertCircle, Info, Plus, Pencil, Check, X } from 'lucide-react';
import { getMessageAnalysisColor, getAnalysisBadge } from '@/utils/interviewUtils';
import { cn } from '@/lib/utils';

interface InterviewMessageProps {
    message: Message;
    onAddLabel: (messageId: string, label: string) => void;
    onUpdateLabel: (messageId: string, labelIndex: number, newValue: string) => void;
    onRemoveLabel: (messageId: string, labelIndex: number) => void;
    editingLabel: EditingLabel | null;
    setEditingLabel: (label: EditingLabel | null) => void;
}

const InterviewMessage: React.FC<InterviewMessageProps> = ({
    message,
    onAddLabel,
    onUpdateLabel,
    onRemoveLabel,
    editingLabel,
    setEditingLabel
}) => {
    const [newLabel, setNewLabel] = useState('');
    const analysisColor = getMessageAnalysisColor(message);

    const handleAddLabel = () => {
        if (newLabel.trim()) {
            onAddLabel(message.id, newLabel.trim());
            setNewLabel('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddLabel();
        }
    };

    return (
        <Card className={cn("mb-4 border-l-4", analysisColor)}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">{message.timestamp}</span>
                            {message.aiAnalysis && (
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <Badge
                                            variant="secondary"
                                            className={getAnalysisBadge(message.aiAnalysis).color}
                                        >
                                            <div className="flex items-center gap-1">
                                                {message.aiAnalysis.type === 'excellent' && <ThumbsUp className="h-3 w-3" />}
                                                {message.aiAnalysis.type === 'concern' && <AlertCircle className="h-3 w-3" />}
                                                {message.aiAnalysis.type === 'mismatch' && <ThumbsDown className="h-3 w-3" />}
                                                {message.aiAnalysis.type === 'baseline' && <Info className="h-3 w-3" />}
                                                <span>{getAnalysisBadge(message.aiAnalysis).text}</span>
                                            </div>
                                        </Badge>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                        <div className="space-y-2">
                                            <p className="text-sm">{message.aiAnalysis.summary}</p>
                                            {message.aiAnalysis.keyPoints && (
                                                <ul className="text-sm list-disc pl-4">
                                                    {message.aiAnalysis.keyPoints.map((point, idx) => (
                                                        <li key={idx}>{point}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            )}
                        </div>
                        <p className="text-sm mb-3">{message.content}</p>
                        <div className="flex flex-wrap gap-2">
                            {message.quickLabels?.map((label, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    {editingLabel?.messageId === message.id && editingLabel?.labelIndex === idx ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                className="h-6 text-xs"
                                                value={editingLabel.value}
                                                onChange={(e) =>
                                                    setEditingLabel({
                                                        ...editingLabel,
                                                        value: e.target.value
                                                    })
                                                }
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onUpdateLabel(message.id, idx, editingLabel.value);
                                                        setEditingLabel(null);
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => {
                                                    onUpdateLabel(message.id, idx, editingLabel.value);
                                                    setEditingLabel(null);
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => setEditingLabel(null)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="px-2 py-0 h-6 gap-1 group hover:bg-secondary"
                                        >
                                            {label}
                                            <div className="hidden group-hover:flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0"
                                                    onClick={() =>
                                                        setEditingLabel({ messageId: message.id, labelIndex: idx, value: label })
                                                    }
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0"
                                                    onClick={() => onRemoveLabel(message.id, idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </Badge>
                                    )}
                                </div>
                            ))}
                            <div className="flex items-center gap-1">
                                <Input
                                    className="h-6 w-24 text-xs"
                                    placeholder="Add label"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={handleAddLabel}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InterviewMessage; 