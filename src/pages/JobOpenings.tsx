import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

const JobOpenings: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Mock data
  const jobOpenings = [
    {
      id: '1',
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '$80,000 - $120,000',
      status: 'Active',
      applicants: 45,
      shortlisted: 12,
      interviewed: 8,
      description: 'We are looking for an experienced Frontend Developer...'
    },
    // ... more job openings
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings"
        subtitle="Manage and track open positions"
      >
        <Button onClick={() => navigate('/jobs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Opening
        </Button>
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-4">
          {jobOpenings.map((job) => (
            <Card key={job.id} className="cursor-pointer hover:bg-accent/5" onClick={() => navigate(`/job-openings/${job.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>{job.department} • {job.location}</CardDescription>
                  </div>
                  <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Experience:</span> {job.experience}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type:</span> {job.type}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Salary:</span> {job.salary}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Applicants:</span> {job.applicants}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shortlisted:</span> {job.shortlisted}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interviewed:</span> {job.interviewed}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobOpenings;
