'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Lightbox({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false 
}: LightboxProps) {
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Title */}
      {title && (
        <div className="absolute top-6 left-6 text-white/70 text-sm tracking-wide">
          {title}
        </div>
      )}

      {/* Previous button */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={title || 'Photo'}
          width={1920}
          height={1080}
          className="max-w-full max-h-[90vh] object-contain"
          priority
        />
      </div>

      {/* Next button */}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
