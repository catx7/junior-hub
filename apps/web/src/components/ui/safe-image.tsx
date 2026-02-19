'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// List of known image hosting domains and common image URL patterns
const VALID_IMAGE_PATTERNS = [
  // Cloud storage
  /cloudinary\.com/,
  /amazonaws\.com/,
  /googleusercontent\.com/,
  /firebasestorage\.googleapis\.com/,
  /supabase\.(co|io)/,
  /blob\.core\.windows\.net/,
  /digitaloceanspaces\.com/,
  /imgix\.net/,
  /res\.cloudinary\.com/,
  // Image CDNs
  /cdn\.jsdelivr\.net/,
  /images\.unsplash\.com/,
  /i\.imgur\.com/,
  /pbs\.twimg\.com/,
  /avatars\.githubusercontent\.com/,
  /picsum\.photos/,
  /placehold/,
  // Common image extensions in URL
  /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)(\?|$)/i,
  // Data URLs
  /^data:image\//,
];

// URLs that are definitely NOT images
const INVALID_URL_PATTERNS = [
  /^https?:\/\/(www\.)?(google|facebook|twitter|youtube|amazon|wikipedia|reddit)\.com\/?$/i,
  /^https?:\/\/[^\/]+\/?$/, // Root domain with no path (like google.com/)
];

/**
 * Validates if a URL is likely to be a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  // Trim and check for empty
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;

  // Check if it's an invalid pattern (like google.com)
  if (INVALID_URL_PATTERNS.some((pattern) => pattern.test(trimmedUrl))) {
    return false;
  }

  // Check if it matches known image patterns
  if (VALID_IMAGE_PATTERNS.some((pattern) => pattern.test(trimmedUrl))) {
    return true;
  }

  // For other URLs, try to parse and check if path has image extension
  try {
    const urlObj = new URL(trimmedUrl);
    const pathname = urlObj.pathname.toLowerCase();
    // Check for image extension in path
    if (/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)$/i.test(pathname)) {
      return true;
    }
    // Check for image-related path segments
    if (/\/(image|img|photo|media|upload|asset)/i.test(pathname)) {
      return true;
    }
  } catch {
    // Invalid URL
    return false;
  }

  // Default: allow but let onError handle it
  return true;
}

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

/**
 * A wrapper around Next.js Image that validates URLs and handles errors gracefully
 */
export function SafeImage({
  src,
  alt,
  fallback,
  fallbackClassName,
  className,
  fill,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const srcString = typeof src === 'string' ? src : '';
  const isValidUrl = isValidImageUrl(srcString);

  // Show fallback if URL is invalid or there was an error
  if (!isValidUrl || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center',
          fill ? 'absolute inset-0' : '',
          fallbackClassName || className
        )}
      >
        <ImageOff className="text-muted-foreground h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className={cn('bg-muted animate-pulse', fill ? 'absolute inset-0' : '', className)} />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(className, !isLoaded && 'opacity-0')}
        fill={fill}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </>
  );
}

export default SafeImage;
