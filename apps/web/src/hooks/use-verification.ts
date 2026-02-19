'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '@/lib/api';
import { toast } from 'sonner';

export function useVerificationStatus() {
  return useQuery({
    queryKey: ['verification-status'],
    queryFn: () => verificationApi.getStatus(),
  });
}

export function useSubmitVerificationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { motivation: string; documentUrl?: string }) =>
      verificationApi.submitRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      toast.success('Verification request submitted successfully!');
    },
    onError: (error: any) => {
      if (error?.code === 'DUPLICATE_REQUEST') {
        toast.error('You already have a pending verification request');
      } else {
        toast.error('Failed to submit verification request');
      }
    },
  });
}

export function useCreateVerificationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { motivation: string }) => verificationApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    },
    onError: (error: any) => {
      if (error?.code === 'DUPLICATE_REQUEST') {
        toast.error('You already have a pending verification request');
      } else {
        toast.error('Failed to start verification. Please try again.');
      }
    },
  });
}
