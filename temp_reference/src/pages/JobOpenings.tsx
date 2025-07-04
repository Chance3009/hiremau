import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus,
  RefreshCw,
  Eye,
  MoreVertical,
  Upload,
  FileText,
  Download,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Settings,
  CheckSquare,
  X,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { fetchJobs, updateJob, createJob } from '@/services/jobService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import JobModal from '@/components/job/JobModal';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  status: string;
  applicants: number;
  shortlisted: number;
  interviewed: number;
  description: string;
  createdAt?: string;
  priority?: string;
  tags?: string[];
  remote?: boolean;
  eventIds?: string[];
}

const JobOpenings: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Enhanced mock data with more realistic job information
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Kuala Lumpur',
      type: 'Full-time',
      experience: '3-5 years',
      salary: 'RM 8,000 - RM 12,000',
      status: 'Active',
      applicants: 45,
      shortlisted: 12,
      interviewed: 5,
      description: 'We are looking for a skilled Frontend Developer with React expertise...',
      createdAt: '2024-01-15',
      priority: 'high',
      tags: ['React', 'TypeScript', 'CSS'],
      remote: true,
      eventIds: ['1', '2']
    },
    {
      id: '2',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Penang',
      type: 'Full-time',
      experience: '2-4 years',
      salary: 'RM 6,000 - RM 9,000',
      status: 'Active',
      applicants: 32,
      shortlisted: 8,
      interviewed: 3,
      description: 'Creative UX/UI Designer to join our innovative design team...',
      createdAt: '2024-01-10',
      priority: 'medium',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      remote: false,
      eventIds: ['1']
    },
    {
      id: '3',
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Singapore',
      type: 'Full-time',
      experience: '4-6 years',
      salary: 'SGD 6,000 - SGD 8,500',
      status: 'Draft',
      applicants: 0,
      shortlisted: 0,
      interviewed: 0,
      description: 'Experienced Backend Developer with Node.js and Python skills...',
      createdAt: '2024-01-20',
      priority: 'high',
      tags: ['Node.js', 'Python', 'MongoDB'],
      remote: true,
      eventIds: []
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && job.status === 'Active') ||
      (statusFilter === 'inactive' && job.status === 'Inactive') ||
      (statusFilter === 'draft' && job.status === 'Draft');

    return matchesSearch && matchesStatus;
  });

  const loadJobs = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      // In real implementation, this would fetch from API
      // For now, use mock data
      setTimeout(() => {
        setJobs(mockJobs);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load job openings",
        variant: "destructive",
      });
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

      // In real implementation, this would call API
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast({
        title: "Status Updated",
        description: `Job ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/applied?jobId=${jobId}`);
  };

  const handleViewAnalytics = (jobId: string) => {
    navigate(`/analytics/job/${jobId}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle job description file upload and AI parsing
      toast({
        title: "File Upload",
        description: `Processing ${file.name} with AI...`,
      });

      // Simulate AI processing
      setTimeout(() => {
        toast({
          title: "AI Processing Complete",
          description: "Job description parsed and ready for review",
        });
        setIsModalOpen(true);
      }, 2000);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedJobs.length === 0) return;

    switch (action) {
      case 'activate':
        setJobs(jobs.map(job =>
          selectedJobs.includes(job.id) ? { ...job, status: 'Active' } : job
        ));
        break;
      case 'deactivate':
        setJobs(jobs.map(job =>
          selectedJobs.includes(job.id) ? { ...job, status: 'Inactive' } : job
        ));
        break;
      case 'delete':
        setJobs(jobs.filter(job => !selectedJobs.includes(job.id)));
        break;
    }

    setSelectedJobs([]);
    setShowBulkActions(false);
    toast({
      title: "Bulk Action Complete",
      description: `${action} applied to ${selectedJobs.length} jobs`,
    });
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleCreateJob = (data: {
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
    salary: {
      min: string;
      max: string;
      currency: string;
      period: string;
    };
    employmentType: string;
    experienceLevel: string;
    benefits: string[];
  }) => {
    const newJob: Job = {
      id: Date.now().toString(),
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.employmentType,
      experience: data.experienceLevel,
      salary: `${data.salary.currency} ${data.salary.min} - ${data.salary.max}`,
      status: 'Draft',
      applicants: 0,
      shortlisted: 0,
      interviewed: 0,
      description: data.description,
      priority: 'medium',
      tags: data.requirements.slice(0, 3), // Use first 3 requirements as tags
      remote: false,
      eventIds: []
    };

    setJobs([newJob, ...jobs]);
    setIsModalOpen(false);
    toast({
      title: "Job Created",
      description: "Job opening created successfully",
    });
  };

  const handleEditJob = (data: {
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
    salary: {
      min: string;
      max: string;
      currency: string;
      period: string;
    };
    employmentType: string;
    experienceLevel: string;
    benefits: string[];
  }) => {
    if (!editingJob) return;

    const updatedJob: Job = {
      ...editingJob,
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.employmentType,
      experience: data.experienceLevel,
      salary: `${data.salary.currency} ${data.salary.min} - ${data.salary.max}`,
      description: data.description,
      tags: data.requirements.slice(0, 3), // Use first 3 requirements as tags
    };

    setJobs(jobs.map(job => job.id === editingJob.id ? updatedJob : job));
    setEditingJob(null);
    setIsModalOpen(false);
    toast({
      title: "Job Updated",
      description: "Job opening updated successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-600 border-green-200';
      case 'Inactive': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'Draft': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={selectedJobs.includes(job.id)}
              onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
                <Badge variant="secondary" className={getPriorityColor(job.priority!)}>
                  {job.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                <span>{job.department}</span>
                <span>{job.type}</span>
                {job.remote && (
                  <Badge variant="outline" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleJobClick(job.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Candidates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingJob(job)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewAnalytics(job.id)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{job.experience}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{job.salary}</span>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{job.applicants}</p>
              <p className="text-xs text-muted-foreground">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{job.shortlisted}</p>
              <p className="text-xs text-muted-foreground">Shortlisted</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600">{job.interviewed}</p>
              <p className="text-xs text-muted-foreground">Interviewed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleJobClick(job.id)}
            >
              <Users className="h-4 w-4 mr-2" />
              View Candidates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewAnalytics(job.id)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Job Openings"
          subtitle="Manage and track open positions"
        >
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Opening
          </Button>
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings"
        subtitle="Manage and track open positions"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Job Description
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => loadJobs(true)} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Opening
          </Button>
        </div>
      </PageHeader>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search jobs, departments, locations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({jobs.length})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({jobs.filter(j => j.status === 'Active').length})
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({jobs.filter(j => j.status === 'Inactive').length})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Draft ({jobs.filter(j => j.status === 'Draft').length})
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedJobs.length === filteredJobs.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedJobs([])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No job openings found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all'
              ? "Try adjusting your search or filters"
              : "Create your first job opening to get started"}
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Opening
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Job Modal */}
      {isModalOpen && (
        <JobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingJob}
          onSubmit={editingJob ? handleEditJob : handleCreateJob}
          mode={editingJob ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

export default JobOpenings;
