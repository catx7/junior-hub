'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState(0);

  const displayValue = hoverValue || value;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;
        const isHalf = !isFilled && starValue - 0.5 <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn('transition-colors', !readonly && 'cursor-pointer hover:scale-110')}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            role={readonly ? undefined : 'radio'}
            aria-checked={readonly ? undefined : value === starValue}
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalf
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'text-muted-foreground/30 fill-transparent'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

function RatingDisplay({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}: RatingDisplayProps) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <StarRating value={rating} size={size} readonly />
      <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : '-'}</span>
      {showCount && count !== undefined && (
        <span className="text-muted-foreground text-sm">({count})</span>
      )}
    </div>
  );
}

export { StarRating, RatingDisplay };
