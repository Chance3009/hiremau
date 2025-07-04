import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate } from 'react-router-dom';

const QRRegistration = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // Mock events and positions
  const events = [
    { id: '1', name: 'UPM Career Fair 2025' },
    { id: '2', name: 'Tech Recruit Summit' },
    { id: '3', name: 'Engineering Talent Day' }
  ];

  const positions = [
    { id: '1', name: 'Frontend Developer' },
    { id: '2', name: 'UX Designer' },
    { id: '3', name: 'Backend Developer' },
    { id: '4', name: 'Product Manager' },
  ];

  // Filter positions based on selected event
  const filteredPositions = positions.filter(position =>
    selectedEvent === 'all' || position.eventId === selectedEvent
  );

  const handleGenerateQR = () => {
    if (!selectedEvent) {
      toast({
        title: "Event Required",
        description: "Please select an event to generate a QR code.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would generate a QR code using an API
    toast({
      title: "QR Code Generated",
      description: `QR code created for ${events.find(e => e.id === selectedEvent)?.name}`,
    });
  };

  const handleCopyLink = () => {
    // In a real app, this would copy the registration link
    toast({
      title: "Link Copied",
      description: "Registration link copied to clipboard",
    });
  };

  const handleDownloadQR = () => {
    // In a real app, this would download the QR code image
    toast({
      title: "QR Code Downloaded",
      description: "QR code image saved to your device",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Registration"
        subtitle="Generate QR codes for quick candidate registration"
      >
        <div className="flex items-center gap-2">
          <Select value={selectedEvent || ''} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Registration QR Code</CardTitle>
            <CardDescription>Generate a QR code for candidates to scan and self-register</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select onValueChange={(value) => setSelectedEvent(value)} value={selectedEvent || undefined}>
                <SelectTrigger id="event">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position (Optional)</Label>
              <Select onValueChange={(value) => setSelectedPosition(value)} value={selectedPosition || undefined}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="All positions" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPositions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>{position.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">If selected, the form will automatically pre-fill the position field</p>
            </div>

            <Button className="w-full" onClick={handleGenerateQR}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration QR Code</CardTitle>
            <CardDescription>Candidates can scan this QR code to access the registration form</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-64 w-64 border rounded-md flex items-center justify-center bg-muted/50">
              {selectedEvent ? (
                <div className="text-center p-4">
                  <QrCode className="h-40 w-40 mx-auto mb-2" />
                  <p className="text-sm font-medium">{events.find(e => e.id === selectedEvent)?.name}</p>
                  {selectedPosition && (
                    <p className="text-xs text-muted-foreground">{positions.find(p => p.id === selectedPosition)?.name}</p>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground">Select an event to generate a QR code</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCopyLink} disabled={!selectedEvent}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button onClick={handleDownloadQR} disabled={!selectedEvent}>
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QRRegistration;
