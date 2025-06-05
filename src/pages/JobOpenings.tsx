import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Edit, File, Plus, Search, Trash } from 'lucide-react';
import ContextFilter from '@/components/layout/ContextFilter';
import { toast } from '@/hooks/use-toast';
import JobOpeningForm from '@/components/job/JobOpeningForm';

// Mock data for job openings
const mockJobOpenings = [
  {
    id: '1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Hybrid - New York',
    description: 'We are looking for a skilled Frontend Developer with experience in React, TypeScript, and modern CSS frameworks like Tailwind. The ideal candidate should have 3+ years of experience building responsive and accessible web applications.',
    requirements: [
      'Strong proficiency in React and TypeScript',
      'Experience with state management libraries (Redux, Zustand, etc.)',
      'Knowledge of modern CSS and responsive design principles',
      'Understanding of web performance optimization',
      'Experience with testing frameworks (Jest, React Testing Library)',
    ],
    events: ['1', '2'],
    createdAt: '2025-04-10',
  },
  {
    id: '2',
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    description: 'We are seeking a talented UX Designer to create exceptional user experiences for our digital products. The ideal candidate will combine design thinking, user research, and visual design skills to deliver intuitive and engaging interfaces.',
    requirements: [
      'Portfolio demonstrating strong UX/UI design skills',
      'Proficiency in design tools like Figma or Sketch',
      'Experience conducting user research and usability testing',
      'Understanding of accessibility standards',
      'Knowledge of design systems and component libraries',
    ],
    events: ['1'],
    createdAt: '2025-04-15',
  },
  {
    id: '3',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Hybrid - San Francisco',
    description: 'We are looking for a Backend Developer with expertise in building scalable and reliable API services. The ideal candidate should have experience with Node.js, databases, and cloud infrastructure.',
    requirements: [
      'Strong proficiency in Node.js and TypeScript',
      'Experience with SQL and NoSQL databases',
      'Knowledge of RESTful API design principles',
      'Experience with cloud services (AWS, Azure, GCP)',
      'Understanding of security best practices',
    ],
    events: ['2'],
    createdAt: '2025-04-18',
  },
  {
    id: '4',
    title: 'Product Manager',
    department: 'Product',
    location: 'Hybrid - Seattle',
    description: 'We are seeking an experienced Product Manager to lead the development of our core products. The ideal candidate will have a strong technical background and experience working with cross-functional teams.',
    requirements: [
      'Experience managing digital products from conception to launch',
      'Strong analytical and problem-solving skills',
      'Excellent communication and stakeholder management',
      'Technical background or familiarity with software development',
      'Data-driven approach to product decisions',
    ],
    events: [],
    createdAt: '2025-04-20',
  },
];

// Mock data for events
const mockEvents = [
  { id: '1', name: 'UPM Career Fair 2025' },
  { id: '2', name: 'Tech Recruit Summit' },
  { id: '3', name: 'Engineering Talent Day' }
];

const JobOpenings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter jobs based on search query and active tab
  const filteredJobs = mockJobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active' && job.events.length > 0) return matchesSearch;
    if (activeTab === 'inactive' && job.events.length === 0) return matchesSearch;

    return false;
  });

  const handleCreateJob = (data: {
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
  }) => {
    // In a real app, this would make an API call
    const newJob = {
      ...data,
      id: String(mockJobOpenings.length + 1),
      events: [],
      createdAt: new Date().toISOString(),
    };

    // Add to mock data
    mockJobOpenings.push(newJob);

    toast({
      title: "Job Opening Created",
      description: `Successfully created ${data.title} position.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Openings</h1>
        <p className="text-muted-foreground">Create and manage job positions that can be used across multiple events.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job openings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job Opening
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Job Opening</DialogTitle>
              <DialogDescription>
                Add a new job position manually or extract details from an existing job description.
              </DialogDescription>
            </DialogHeader>
            <JobOpeningForm
              onSubmit={handleCreateJob}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Positions</TabsTrigger>
          <TabsTrigger value="active">Active in Events</TabsTrigger>
          <TabsTrigger value="inactive">Not Used</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map(job => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.department} • {job.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {job.requirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Key Requirements:</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                          {job.requirements.length > 3 && (
                            <li className="text-muted-foreground">+{job.requirements.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Events: </span>
                      <span>
                        {job.events.length > 0
                          ? job.events.length === 1
                            ? mockEvents.find(e => e.id === job.events[0])?.name
                            : `${job.events.length} events`
                          : 'Not used in any event'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button size="sm">Use in Event</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobOpenings;
