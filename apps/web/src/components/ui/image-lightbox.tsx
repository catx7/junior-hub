'use client';

import * as React from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: { url: string; alt?: string }[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [zoomed, setZoomed] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoomed(false);
    }
  }, [open, initialIndex]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(!zoomed);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        >
          {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
        </button>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
              setZoomed(false);
            }}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
              setZoomed(false);
            }}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className={cn(
          'relative transition-transform duration-300',
          zoomed ? 'h-full w-full' : 'h-[80vh] w-[90vw] max-w-5xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current.url}
          alt={current.alt || `Image ${currentIndex + 1}`}
          fill
          className={cn('object-contain', zoomed && 'cursor-zoom-out')}
          sizes="100vw"
          priority
          onClick={() => zoomed && setZoomed(false)}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
                setZoomed(false);
              }}
              className={cn(
                'relative h-12 w-12 overflow-hidden rounded-md border-2 transition',
                i === currentIndex
                  ? 'border-white'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || `Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export { ImageLightbox };
