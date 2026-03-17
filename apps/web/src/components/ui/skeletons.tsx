import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

// ─── Job Card Skeleton ──────────────────────────────────────

function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card overflow-hidden rounded-xl border', className)}>
      <Skeleton className="aspect-card w-full" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Event Card Skeleton ────────────────────────────────────

function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card overflow-hidden rounded-xl border', className)}>
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

// ─── Profile / Provider Card Skeleton ───────────────────────

function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl border p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ─── List Item Skeleton ─────────────────────────────────────

function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card flex items-center gap-4 rounded-lg border p-4', className)}>
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  );
}

// ─── Message Skeleton ───────────────────────────────────────

function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 p-4', className)}>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// ─── Page Header Skeleton ───────────────────────────────────

function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-96" />
    </div>
  );
}

export {
  JobCardSkeleton,
  EventCardSkeleton,
  ProfileSkeleton,
  ListItemSkeleton,
  MessageSkeleton,
  PageHeaderSkeleton,
};
