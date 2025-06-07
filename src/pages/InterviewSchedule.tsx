import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar as CalendarIcon, Users, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

const InterviewSchedule = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState('');
  const [interviewer, setInterviewer] = React.useState('');
  const [interviewType, setInterviewType] = React.useState('in-person');
  const params = useParams();
  const candidateId = params.candidateId;
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2024-03-20');

  // Mock candidate data that would come from API in a real app
  const candidate = {
    id: candidateId || '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    event: 'UPM Career Fair 2025',
    status: 'shortlist',
    photo: ''
  };

  // Mock interviewers
  const interviewers = [
    { id: '1', name: 'Emma Rodriguez', role: 'Technical Lead' },
    { id: '2', name: 'Michael Chen', role: 'Senior Developer' },
    { id: '3', name: 'Sarah Kim', role: 'Engineering Manager' },
  ];

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

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
  ];

  // Filter interviews based on selected event
  const filteredInterviews = mockInterviews.filter(interview =>
    selectedEvent === 'all' || interview.eventId === selectedEvent
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Schedule"
        subtitle="Manage and view upcoming interviews"
      >
        <div className="flex items-center gap-2">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {/* Add events from the events array */}
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-03-20">March 20, 2024</SelectItem>
              <SelectItem value="2024-03-21">March 21, 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl font-semibold mb-4">
                {candidate.photo ? (
                  <img src={candidate.photo} alt={candidate.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  candidate.name.charAt(0)
                )}
              </div>
              <h3 className="font-medium text-lg">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.position}</p>
              <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {candidate.event}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>Schedule a time for the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule">
              <TabsList className="mb-4">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium mb-2">Select Date</div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Time</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Interviewer</Label>
                      <Select value={interviewer} onValueChange={setInterviewer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an interviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewers.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name} - {person.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Interview Type</Label>
                      <Select value={interviewType} onValueChange={setInterviewType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In-Person</SelectItem>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location/Meeting Link</Label>
                    <Input placeholder="Enter interview location or meeting link" />
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Input placeholder="Any additional information for the candidate" />
                  </div>

                  <div className="space-y-2">
                    <Label>Send Notification</Label>
                    <Select defaultValue="email">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/interview')}>Cancel</Button>
            <Button onClick={handleSchedule}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSchedule;
