import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="bg-muted text-muted-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-sm text-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
