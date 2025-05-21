
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './FileUpload';

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input 
                id="first-name" 
                placeholder="First Name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input 
                id="last-name" 
                placeholder="Last Name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position Applied For</Label>
            <Input 
              id="position" 
              placeholder="Position" 
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Resume</Label>
            <FileUpload 
              onFileSelect={setResumeFile} 
              onTextInput={setResumeText}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any initial observations or notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full">Process Candidate</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CandidateIntakeForm;
