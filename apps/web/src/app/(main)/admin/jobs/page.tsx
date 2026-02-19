'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SERVICE_CATEGORIES } from '@localservices/shared';
import { getIdToken } from '@/lib/firebase';

async function fetchAllJobs() {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

async function deleteJob(jobId: string) {
  const token = await getIdToken();
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

async function updateJobStatus(jobId: string, status: string) {
  const token = await getIdToken();
  const res = await fetch(`/api/jobs/${jobId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export default function AdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: fetchAllJobs,
  });

  const jobs = jobsData?.data || [];

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => {
      toast.error('Failed to delete job');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) =>
      updateJobStatus(jobId, status),
    onSuccess: () => {
      toast.success('Job status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    open: jobs.filter((j: any) => j.status === 'OPEN').length,
    inProgress: jobs.filter((j: any) => j.status === 'IN_PROGRESS').length,
    completed: jobs.filter((j: any) => j.status === 'COMPLETED').length,
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all job postings</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Total Jobs</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Open</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.open}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">In Progress</p>
            <p className="text-primary text-2xl font-bold">{stats.inProgress}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Completed</p>
            <p className="text-muted-foreground text-2xl font-bold">{stats.completed}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Job
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Poster
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground px-6 py-12 text-center">
                      Loading jobs...
                    </td>
                  </tr>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job: any) => {
                    const categoryInfo =
                      SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];
                    return (
                      <tr key={job.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-foreground font-medium">{job.title}</p>
                            <p className="text-muted-foreground line-clamp-1 text-sm">
                              {job.description}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge
                            style={{
                              backgroundColor: `${categoryInfo?.color}20`,
                              color: categoryInfo?.color,
                            }}
                          >
                            {categoryInfo?.label || job.category}
                          </Badge>
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                          ${job.budget?.min || job.budget || 0}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <select
                            value={job.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({ jobId: job.id, status: e.target.value })
                            }
                            className="rounded border px-2 py-1 text-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                          {job.poster?.name || 'Unknown'}
                        </td>
                        <td className="text-muted-foreground whitespace-nowrap px-6 py-4 text-sm">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <Link href={`/jobs/${job.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/5"
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              disabled={deleteJobMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground px-6 py-12 text-center">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
