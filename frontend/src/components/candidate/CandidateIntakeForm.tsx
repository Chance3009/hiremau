import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, File, X } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
}

interface CandidateIntakeFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const CandidateIntakeForm: React.FC<CandidateIntakeFormProps> = ({ onSubmit, isSubmitting = false }) => {
  // Essential fields only - agent will read the resume for details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch events and jobs on component mount
  useEffect(() => {
    fetchEvents();
    fetchJobs();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/events/active/list');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Warning",
        description: "Could not load events. You can still register without selecting an event.",
        variant: "default",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/jobs/active/list');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Warning",
        description: "Could not load positions. You can still register without selecting a position.",
        variant: "default",
      });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !email || !phone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Name, Email, and Phone",
        variant: "destructive",
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload a resume file so our AI can analyze the candidate",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create simplified candidate data object
      const candidateData = {
        name,
        email,
        phone,
        event_id: selectedEvent || undefined,
        job_id: selectedPosition || undefined,
        stage: "applied",
        status: "active",
        source: "direct"
      };

      console.log('Candidate data:', candidateData);

      // Create FormData object
      const formData = new FormData();
      formData.append('candidate_data', JSON.stringify(candidateData));
      formData.append('resume_file', resumeFile);

      await onSubmit(formData);

      // Reset form if submission was successful
      if (!isSubmitting) {
        setName('');
        setEmail('');
        setPhone('');
        setSelectedEvent('');
        setSelectedPosition('');
        setResumeFile(null);

        // Reset file input
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Registration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload candidate resume - our AI will analyze and extract all relevant details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Essential Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="012-345 6789"
                required
              />
            </div>

            {/* Optional Event and Position Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Event (Optional)</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Position (Optional)</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <Label htmlFor="resume-upload">Resume/CV *</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {resumeFile ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <File className="w-8 h-8" />
                          <div>
                            <p className="text-sm font-medium">{resumeFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeUpload}
                    />
                  </label>
                </div>
                {resumeFile && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">File selected: {resumeFile.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResumeFile(null);
                        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Registering...' : 'Register Candidate'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CandidateIntakeForm;
