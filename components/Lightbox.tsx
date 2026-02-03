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
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-800 z-10 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-7 h-7" strokeWidth={1.5} />
      </button>

      {/* Previous Button */}
      {hasPrev && (
        <button
          onClick={goToPrev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-neutral-400 hover:text-neutral-800 transition-colors"
          aria-label="Önceki"
        >
          <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
        </button>
      )}

      {/* Framed Image */}
      <div className="relative z-40 mx-4">
        {/* Frame border - black */}
        <div
          className="border-[10px] border-black"
          style={{
            boxShadow: '6px 6px 20px rgba(0,0,0,0.35), 3px 3px 10px rgba(0,0,0,0.2)'
          }}
        >
          {/* White mat with inner shadow from top-left light */}
          <div
            className="bg-white p-10 md:p-14"
            style={{
              boxShadow: 'inset 12px 12px 30px rgba(0,0,0,0.1), inset 5px 5px 12px rgba(0,0,0,0.06)'
            }}
          >
            {/* V-groove - realistic bevel with depth */}
            <div
              style={{
                padding: '4px',
                background: 'linear-gradient(145deg, #909090 0%, #b0b0b0 30%, #d0d0d0 70%, #e8e8e8 100%)',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.6)'
              }}
            >
              {/* Inner recessed area */}
              <div
                style={{
                  padding: '12px',
                  background: '#e8e8e8',
                  boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.15), inset 1px 1px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Image
                  src={imageUrl}
                  alt={title || 'Photo'}
                  width={1920}
                  height={1280}
                  quality={95}
                  className="max-w-[85vw] max-h-[70vh] w-auto h-auto object-contain block"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-neutral-400 hover:text-neutral-800 transition-colors"
          aria-label="Sonraki"
        >
          <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
        </button>
      )}

      {/* Counter */}
      {isArrayMode && photos && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 text-sm tracking-[0.2em] font-light">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
