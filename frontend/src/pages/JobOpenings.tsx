import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { fetchJobs, updateJob, createJob } from '@/services/jobService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
}

const JobOpenings: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const loadJobs = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const jobsData = await fetchJobs();
      setJobs(jobsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
      toast({
        title: "Error",
        description: "Failed to load job openings",
        variant: "destructive",
      });
    } finally {
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

      await updateJob(jobId, { status: newStatus });

      // Update local state
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast({
        title: "Status Updated",
        description: `Job ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/recruitment?jobId=${jobId}`);
  };

  const handleCreateJob = async (jobData: any) => {
    try {
      const newJob = await createJob(jobData);
      setJobs([newJob, ...jobs]);
      toast({
        title: "Job Created",
        description: "Job opening created successfully",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create job opening",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = async (jobData: any) => {
    if (!editingJob) return;

    try {
      const updatedJob = await updateJob(editingJob.id, jobData);
      setJobs(jobs.map(job => job.id === editingJob.id ? { ...job, ...updatedJob } : job));
      toast({
        title: "Job Updated",
        description: "Job opening updated successfully",
      });
      setEditingJob(null);
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update job opening",
        variant: "destructive",
      });
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const getStatusVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const JobSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-12" />
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

        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <JobSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Job Openings"
          subtitle="Manage and track open positions"
        >
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Opening
          </Button>
        </PageHeader>

        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">Failed to load job openings</p>
          <Button onClick={() => loadJobs()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings"
        subtitle={`${jobs.length} position${jobs.length !== 1 ? 's' : ''} available`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadJobs(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Opening
          </Button>
        </div>
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:bg-accent/5 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <CardTitle className="text-lg flex items-center gap-2">
                      {job.title}
                      {job.priority && (
                        <span className={cn("text-sm font-normal", getPriorityColor(job.priority))}>
                          ({job.priority} priority)
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{job.department} • {job.location}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(job.status)}>
                      {job.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleJobClick(job.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Pipeline
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(job)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Edit Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>{job.applicants || 0} applicants</span>
                    <span>{job.shortlisted || 0} shortlisted</span>
                    <span>{job.interviewed || 0} interviewed</span>
                    <span>{job.type}</span>
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {job.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={job.status === 'Active'}
                      onCheckedChange={() => handleStatusToggle(job.id, job.status)}
                    />
                  </div>
                </div>
                {job.salary && (
                  <div className="mt-2 text-sm font-medium">
                    {job.salary}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No job openings found</p>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Job Opening
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <JobModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingJob ? handleEditJob : handleCreateJob}
        initialData={editingJob}
        mode={editingJob ? 'edit' : 'create'}
      />
    </div>
  );
};

export default JobOpenings;
