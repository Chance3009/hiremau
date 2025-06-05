import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save } from 'lucide-react';

interface InterviewNotesProps {
    candidate: {
        id: string;
        name: string;
        position: string;
        notes?: string;
    };
}

const InterviewNotes: React.FC<InterviewNotesProps> = ({ candidate }) => {
    return (
        <div className="h-full p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Notes</CardTitle>
                    <CardDescription>Add notes during the interview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Type your notes here..."
                            className="min-h-[200px]"
                        />
                        <div className="flex justify-end">
                            <Button>
                                <Save className="h-4 w-4 mr-2" />
                                Save Notes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Key Points</CardTitle>
                    <CardDescription>Important observations and highlights</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Button variant="outline" size="sm" className="shrink-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <div className="text-sm">
                                    <p className="font-medium">Technical Skills</p>
                                    <p className="text-muted-foreground">Add notes about technical capabilities</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Button variant="outline" size="sm" className="shrink-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <div className="text-sm">
                                    <p className="font-medium">Communication</p>
                                    <p className="text-muted-foreground">Add notes about communication skills</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Button variant="outline" size="sm" className="shrink-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <div className="text-sm">
                                    <p className="font-medium">Experience</p>
                                    <p className="text-muted-foreground">Add notes about past experience</p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewNotes; 