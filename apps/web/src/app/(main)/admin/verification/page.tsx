'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  FileText,
  User,
  Fingerprint,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { getIdToken } from '@/lib/firebase';

interface VerificationRequest {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  status: 'pending' | 'approved' | 'rejected';
  motivation: string;
  idnormSessionId: string | null;
  idnormStatus: string | null;
  idnormResult: Record<string, any> | null;
  documentUrl: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: string;
}

async function fetchVerificationRequests() {
  const token = await getIdToken();
  const res = await fetch('/api/admin/verification/requests', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}

async function updateVerificationStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  notes: string
) {
  const token = await getIdToken();
  const res = await fetch(`/api/admin/verification/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export default function ProviderVerificationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['verification-requests'],
    queryFn: fetchVerificationRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
      notes,
    }: {
      requestId: string;
      status: 'approved' | 'rejected';
      notes: string;
    }) => updateVerificationStatus(requestId, status, notes),
    onSuccess: (_, { status }) => {
      toast.success(`Verification ${status === 'approved' ? 'approved' : 'rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: () => {
      toast.error('Failed to update verification status');
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      status: 'approved',
      notes: reviewNotes,
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      status: 'rejected',
      notes: reviewNotes,
    });
  };

  const filteredRequests = requests.filter((req: VerificationRequest) => {
    const matchesSearch =
      req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: requests.filter((r: VerificationRequest) => r.status === 'pending').length,
    approved: requests.filter((r: VerificationRequest) => r.status === 'approved').length,
    rejected: requests.filter((r: VerificationRequest) => r.status === 'rejected').length,
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="text-primary h-8 w-8" />
            <h1 className="text-foreground text-3xl font-bold">Provider Verification</h1>
          </div>
          <p className="text-muted-foreground">
            Review and verify service providers to ensure platform safety
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.pending}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Rejected</p>
                <p className="text-destructive text-3xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-foreground text-3xl font-bold">{requests.length}</p>
              </div>
              <Shield className="h-10 w-10 text-blue-500" />
            </div>
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
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background text-foreground rounded-lg border px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Requests Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Identity Verification
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-6 py-12 text-center">
                      Loading verification requests...
                    </td>
                  </tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((request: VerificationRequest) => (
                    <tr key={request.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {request.user.avatar ? (
                              <img src={request.user.avatar} alt={request.user.name} />
                            ) : (
                              <div className="bg-primary flex h-full w-full items-center justify-center text-sm font-bold text-white">
                                {request.user.name.charAt(0)}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-foreground font-medium">{request.user.name}</p>
                            <p className="text-muted-foreground text-sm">{request.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {request.status === 'pending' && (
                          <Badge className="bg-orange-500">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {request.status === 'approved' && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge className="bg-red-600">
                            <XCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-1">
                          {request.idnormSessionId ? (
                            <Badge variant="outline" className="text-xs">
                              <Fingerprint className="mr-1 h-3 w-3" />
                              {request.idnormStatus === 'completed'
                                ? 'Verified'
                                : request.idnormStatus === 'failed'
                                  ? 'Failed'
                                  : request.idnormStatus || 'In Progress'}
                            </Badge>
                          ) : request.documentUrl ? (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="mr-1 h-3 w-3" />
                              Document
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">No verification</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-6 py-12 text-center">
                      No verification requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
              <h2 className="mb-6 text-2xl font-bold">Review Verification Request</h2>

              {/* Provider Info */}
              <div className="bg-muted/50 mb-6 flex items-center gap-4 rounded-lg p-4">
                <Avatar className="h-16 w-16">
                  {selectedRequest.user.avatar ? (
                    <img src={selectedRequest.user.avatar} alt={selectedRequest.user.name} />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {selectedRequest.user.name.charAt(0)}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedRequest.user.name}</p>
                  <p className="text-muted-foreground text-sm">{selectedRequest.user.email}</p>
                  <p className="text-muted-foreground text-xs">
                    Submitted {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Motivation */}
              {selectedRequest.motivation && (
                <div className="mb-6">
                  <h3 className="mb-2 font-semibold">Motivation</h3>
                  <Card className="p-4">
                    <p className="text-foreground whitespace-pre-wrap text-sm">
                      {selectedRequest.motivation}
                    </p>
                  </Card>
                </div>
              )}

              {/* Identity Verification (idnorm) */}
              <div className="mb-6 space-y-4">
                <h3 className="font-semibold">Identity Verification</h3>

                {selectedRequest.idnormSessionId ? (
                  <Card className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Fingerprint className="text-primary h-5 w-5" />
                      <p className="font-medium">idnorm Verification</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Session ID:</span>
                        <code className="bg-muted rounded px-2 py-0.5 text-xs">
                          {selectedRequest.idnormSessionId}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Status:</span>
                        <Badge
                          variant="outline"
                          className={
                            selectedRequest.idnormStatus === 'completed'
                              ? 'border-green-500 text-green-600 dark:text-green-400'
                              : selectedRequest.idnormStatus === 'failed'
                                ? 'text-destructive border-red-500'
                                : 'border-orange-500 text-orange-600 dark:text-orange-400'
                          }
                        >
                          {selectedRequest.idnormStatus === 'completed' && (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          )}
                          {selectedRequest.idnormStatus === 'failed' && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedRequest.idnormStatus === 'completed'
                            ? 'Verified'
                            : selectedRequest.idnormStatus === 'failed'
                              ? 'Failed'
                              : selectedRequest.idnormStatus || 'Pending'}
                        </Badge>
                      </div>
                      {selectedRequest.idnormResult && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm font-medium">
                            Verification Result:
                          </p>
                          <pre className="bg-muted max-h-48 overflow-auto rounded-lg p-3 text-xs">
                            {JSON.stringify(selectedRequest.idnormResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : selectedRequest.documentUrl ? (
                  <Card className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="text-primary h-5 w-5" />
                      <p className="font-medium">Uploaded Document</p>
                    </div>
                    <div className="bg-muted aspect-video overflow-hidden rounded-lg">
                      <img
                        src={selectedRequest.documentUrl}
                        alt="Verification Document"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4">
                    <p className="text-muted-foreground text-sm">
                      No identity verification completed yet.
                    </p>
                  </Card>
                )}
              </div>

              {/* Review Notes */}
              <div className="mb-6">
                <label className="mb-2 block font-medium">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="bg-background text-foreground w-full resize-none rounded-lg border px-4 py-3"
                  placeholder="Add notes about your review decision (required for rejection)..."
                />
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' ? (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRequest(null);
                      setReviewNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleReject}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Approve
                  </Button>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="mb-2 text-sm font-medium">
                    Status: <span className="text-lg">{selectedRequest.status.toUpperCase()}</span>
                  </p>
                  {selectedRequest.notes && (
                    <p className="text-muted-foreground text-sm">
                      <strong>Notes:</strong> {selectedRequest.notes}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSelectedRequest(null);
                      setReviewNotes('');
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Safety Info */}
        <Card className="bg-primary/5 mt-6 border-l-4 border-l-blue-500 p-6">
          <div className="flex items-start gap-3">
            <Shield className="text-primary mt-1 h-6 w-6" />
            <div>
              <h3 className="text-primary mb-2 font-semibold">Verification Checklist</h3>
              <ul className="text-primary space-y-1 text-sm">
                <li>✓ Check idnorm identity verification status is &quot;Verified&quot;</li>
                <li>✓ Review the verification result details for any anomalies</li>
                <li>✓ Read the provider&apos;s motivation for becoming a service provider</li>
                <li>✓ Look for any red flags or inconsistencies</li>
                <li>✓ Cross-reference with the user&apos;s profile and activity history</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
