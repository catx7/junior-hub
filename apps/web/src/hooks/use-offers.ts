'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/lib/api';
import type { CreateOfferInput } from '@localservices/shared';
import { toast } from 'sonner';

export function useJobOffers(jobId: string) {
  return useQuery({
    queryKey: ['offers', jobId],
    queryFn: () => offersApi.listForJob(jobId),
    enabled: !!jobId,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: CreateOfferInput }) =>
      offersApi.create(jobId, data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['offers', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      toast.success('Offer submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit offer');
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offersApi.accept(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Offer accepted!');
    },
    onError: () => {
      toast.error('Failed to accept offer');
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offersApi.reject(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offer rejected');
    },
    onError: () => {
      toast.error('Failed to reject offer');
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offersApi.withdraw(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offer withdrawn');
    },
    onError: () => {
      toast.error('Failed to withdraw offer');
    },
  });
}
