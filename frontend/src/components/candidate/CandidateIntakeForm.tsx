import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ClipboardPaste, File, X } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  name?: string;
  description?: string;
  date?: string;
  location?: string;
  status?: string;
  event_type?: string;
}

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status?: string;
  description?: string;
  job_type?: string;
  salary_range?: string;
  company?: string;
}

interface CandidateIntakeFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const CandidateIntakeForm: React.FC<CandidateIntakeFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);

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
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
      // Set empty array as fallback
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
        title: "Error",
        description: "Failed to load positions. Please try again.",
        variant: "destructive",
      });
      // Set empty array as fallback
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

  const handleSupportingDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate each file
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setSupportingDocs(prev => [...prev, ...validFiles]);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !email || !phone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create candidate data object
      const candidateData = {
        name,
        email,
        phone,
        event_id: selectedEvent || undefined,
        job_id: selectedPosition || undefined,
        current_position: "",
        years_experience: 0,
        education: "",
        experience: "",
        skills: [],
        linkedin_url: "",
        github_url: "",
        portfolio_url: "",
        availability: "immediately",
        salary_expectations: 0,
        preferred_work_type: "full_time",
        source: "direct",
        stage: "applied",
        status: "active"
      };

      console.log('Candidate data:', candidateData);

      // Create FormData object
      const formData = new FormData();
      formData.append('candidate_data', JSON.stringify(candidateData));

      // Add resume file if exists
      if (resumeFile) {
        formData.append('resume_file', resumeFile);
      }

      // Log FormData entries
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      await onSubmit(formData);

      // Reset form if submission was successful
      if (!isSubmitting) {
        setName('');
        setEmail('');
        setPhone('');
        setSelectedEvent('');
        setSelectedPosition('');
        setResumeFile(null);
        setSupportingDocs([]);
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>

          {/* Event and Position Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event">Event *</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="event">
                  <SelectValue placeholder={loading ? "Loading events..." : "Select event"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading events...
                    </SelectItem>
                  ) : events.length === 0 ? (
                    <SelectItem value="no-events" disabled>
                      No events available
                    </SelectItem>
                  ) : (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title || event.name}
                        {event.location && ` - ${event.location}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger id="position">
                  <SelectValue placeholder={loading ? "Loading positions..." : "Select position"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading positions...
                    </SelectItem>
                  ) : jobs.length === 0 ? (
                    <SelectItem value="no-jobs" disabled>
                      No positions available
                    </SelectItem>
                  ) : (
                    jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                        {job.department && ` (${job.department})`}
                        {job.location && ` - ${job.location}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <Label>Resume *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {resumeFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <File className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">{resumeFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload Resume</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <Label>Supporting Documents (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {supportingDocs.length > 0 && (
                <div className="mb-4 space-y-2">
                  {supportingDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupportingDoc(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload Additional Documents</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleSupportingDocsUpload}
                  multiple
                  className="hidden"
                  id="supporting-docs-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('supporting-docs-upload')?.click()}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </>
              ) : (
                'Register Candidate'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CandidateIntakeForm;
