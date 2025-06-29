import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Plus, Mail, Copy, Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import CandidateIntakeForm from '@/components/candidate/CandidateIntakeForm';

interface CandidateFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    notes: string;
    resumeFile: File | null;
    resumeText: string;
}

export const RegisterDialog = () => {
    const [mode, setMode] = useState<'form' | 'qr'>('form');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

    const handleCopyLink = () => {
        // Implement copy link logic
        toast({
            title: "Link Copied",
            description: "The registration link has been copied to your clipboard."
        });
    };

    const handleDownloadQR = () => {
        // Implement QR download logic
        toast({
            title: "QR Code Downloaded",
            description: "The QR code has been downloaded successfully."
        });
    };

    const handleCandidateSubmit = (data: CandidateFormData) => {
        // Handle form submission
        console.log('Candidate data:', data);
        toast({
            title: "Candidate Registered",
            description: "The candidate has been successfully registered."
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Candidate
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-2">
                    <DialogTitle>Register New Candidate</DialogTitle>
                    <Tabs value={mode} onValueChange={(value) => setMode(value as 'form' | 'qr')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">
                                <Mail className="h-4 w-4 mr-2" />
                                Manual Form
                            </TabsTrigger>
                            <TabsTrigger value="qr">
                                <QrCode className="h-4 w-4 mr-2" />
                                QR Code
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2">
                    {mode === 'qr' ? (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <Label className="text-sm">Event (Optional)</Label>
                                <Select value={selectedEvent || undefined} onValueChange={setSelectedEvent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select event or leave empty for general application" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Application</SelectItem>
                                        <SelectItem value="tech-meetup">Tech Meetup 2024</SelectItem>
                                        <SelectItem value="career-fair">Career Fair 2024</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Select an event to generate a specific QR code for that event, or leave empty for a general application
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="h-64 w-64 border rounded-md flex items-center justify-center bg-muted/50">
                                    {selectedEvent ? (
                                        <div className="text-center p-4">
                                            <QrCode className="h-40 w-40 mx-auto mb-2" />
                                            <p className="text-sm font-medium">
                                                {selectedEvent === 'general' ? 'General Application' : selectedEvent}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <p className="text-sm text-muted-foreground">Select an event to generate a QR code</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Quick Application Process</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Scan QR code with your phone</li>
                                            <li>• Fill out the mobile-friendly form</li>
                                            <li>• Submit your application instantly</li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={!selectedEvent}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link
                                        </Button>
                                        <Button size="sm" onClick={handleDownloadQR} disabled={!selectedEvent}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download QR
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CandidateIntakeForm onSubmit={handleCandidateSubmit} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}; 