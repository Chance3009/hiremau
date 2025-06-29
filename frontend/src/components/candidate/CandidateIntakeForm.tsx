import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ClipboardPaste } from "lucide-react";

interface CandidateIntakeFormProps {
  onSubmit: (data: any) => void;
}

const CandidateIntakeForm: React.FC<CandidateIntakeFormProps> = ({ onSubmit }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeText, setResumeText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateData = {
      firstName,
      lastName,
      email,
      phone,
      position,
      notes,
      resumeFile,
      resumeText
    };
    onSubmit(candidateData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {/* Left Column - Basic Info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" placeholder="John Doe" className="h-8" />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-8" />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" className="h-8" />
              </div>
            </div>

            {/* Middle Column - Professional Info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="position" className="text-xs">Position</Label>
                <Select>
                  <SelectTrigger id="position" className="h-8">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend-dev">Frontend Developer</SelectItem>
                    <SelectItem value="backend-dev">Backend Developer</SelectItem>
                    <SelectItem value="fullstack-dev">Full Stack Developer</SelectItem>
                    <SelectItem value="devops-eng">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience" className="text-xs">Experience (Years)</Label>
                <Input id="experience" type="number" placeholder="5" className="h-8" />
              </div>

              <div>
                <Label htmlFor="salary" className="text-xs">Expected Salary</Label>
                <Input id="salary" placeholder="$100,000" className="h-8" />
              </div>
            </div>

            {/* Right Column - Resume Upload */}
            <div className="space-y-3">
              <Label className="text-xs">Resume</Label>
              <div className="grid grid-rows-2 gap-2">
                <Button className="h-[72px] bg-muted hover:bg-muted/80" variant="ghost">
                  <div className="space-y-1">
                    <Upload className="h-4 w-4 mx-auto" />
                    <p className="text-xs font-medium">Upload Resume</p>
                    <p className="text-[10px] text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</p>
                  </div>
                </Button>
                <Button className="h-[72px] bg-muted hover:bg-muted/80" variant="ghost">
                  <div className="space-y-1">
                    <ClipboardPaste className="h-4 w-4 mx-auto" />
                    <p className="text-xs font-medium">Paste Resume</p>
                    <p className="text-[10px] text-muted-foreground">Paste formatted text</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm">Register Candidate</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CandidateIntakeForm;
