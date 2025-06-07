import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from "@/components/ui/page-header";
import { mockCandidates, mockInterviewers, mockTimeSlots } from '@/mocks/interviewData';

const InterviewSchedule = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState('');
  const [interviewer, setInterviewer] = React.useState('');
  const [interviewType, setInterviewType] = React.useState('in-person');
  const params = useParams();
  const candidateId = params.candidateId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2024-03-20');

  // Get candidate from mock data
  const candidate = mockCandidates.find(c => c.id === candidateId) || mockCandidates[0];

  const handleSchedule = () => {
    if (!date || !time || !interviewer) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Interview Scheduled",
      description: `Interview with ${candidate.name} scheduled for ${format(date, 'MMMM d, yyyy')} at ${time}`,
    });

    // Navigate to interview page or interviews list
    navigate('/interview');
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Schedule Interview"
        subtitle={`${candidate.name} - ${candidate.position}`}
      >
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose when the interview will take place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {mockTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Right Column - Interview Details */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>Configure the interview settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Candidate Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{candidate.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Position</span>
                    <span className="font-medium">{candidate.position}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge>{candidate.status}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Interview Type</h3>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Select Interviewer</h3>
                <Select value={interviewer} onValueChange={setInterviewer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInterviewers.map((interviewer) => (
                      <SelectItem key={interviewer.id} value={interviewer.id}>
                        {interviewer.name} - {interviewer.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleSchedule}>
                Schedule Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSchedule;
