'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Photo tipi - projedeki mevcut tip ile uyumlu
interface Photo {
  id: string;
  url: string;
  title?: string;
  [key: string]: any;
}

interface LightboxProps {
  // Yeni API - fotoğraf dizisi ile çalışma
  photos?: Photo[];
  initialIndex?: number;
  
  // Eski API - tekil fotoğraf ile çalışma (geriye uyumluluk)
  isOpen?: boolean;
  imageUrl?: string;
  title?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  
  // Ortak
  onClose: () => void;
}

export default function Lightbox(props: LightboxProps) {
  const { 
    // Yeni API
    photos, 
    initialIndex = 0,
    
    // Eski API
    isOpen: isOpenProp,
    imageUrl: imageUrlProp,
    title: titleProp,
    onPrev: onPrevProp,
    onNext: onNextProp,
    hasPrev: hasPrevProp = false,
    hasNext: hasNextProp = false,
    
    // Ortak
    onClose 
  } = props;

  // Dizi modu mu tekil mod mu?
  const isArrayMode = Boolean(photos && photos.length > 0);
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // initialIndex değişince güncelle
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Mevcut fotoğraf bilgileri
  const currentPhoto = isArrayMode ? photos![currentIndex] : null;
  const imageUrl = isArrayMode ? currentPhoto?.url : imageUrlProp;
  const title = isArrayMode ? currentPhoto?.title : titleProp;
  
  // Navigasyon durumları
  const hasPrev = isArrayMode ? currentIndex > 0 : hasPrevProp;
  const hasNext = isArrayMode ? currentIndex < (photos?.length || 0) - 1 : hasNextProp;

  const goToPrev = useCallback(() => {
    if (isArrayMode && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (onPrevProp) {
      onPrevProp();
    }
  }, [isArrayMode, currentIndex, onPrevProp]);

  const goToNext = useCallback(() => {
    if (isArrayMode && currentIndex < (photos?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onNextProp) {
      onNextProp();
    }
  }, [isArrayMode, currentIndex, photos?.length, onNextProp]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) goToPrev();
      if (e.key === 'ArrowRight' && hasNext) goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goToPrev, goToNext, hasPrev, hasNext]);

  // Eski API modunda isOpen kontrolü
  if (!isArrayMode && isOpenProp === false) {
    return null;
  }

  // Gösterilecek resim yoksa
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white z-10 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Title & Counter */}
      <div className="absolute top-6 left-6 text-white/70 text-sm tracking-wide">
        {title && <span>{title}</span>}
        {isArrayMode && photos && (
          <span className={title ? 'ml-4' : ''}>
            {currentIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Previous Button */}
      {hasPrev && (
        <button
          onClick={goToPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Önceki"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Image
          src={imageUrl}
          alt={title || 'Photo'}
          width={1920}
          height={1080}
          className="max-w-full max-h-[90vh] object-contain"
          priority
        />
      </div>

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={goToNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Sonraki"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
