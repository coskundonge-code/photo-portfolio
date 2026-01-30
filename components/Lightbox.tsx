'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Görsel boyutları için state tipi
interface ImageDimensions {
  width: number;
  height: number;
}

// Photo tipi - projedeki mevcut tip ile uyumlu
interface Photo {
  id: string;
  url: string;
  title?: string;
  width?: number;
  height?: number;
  orientation?: string;
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
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  // initialIndex değişince güncelle
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageDimensions(null);
  }, [initialIndex]);

  // currentIndex değişince dimensions sıfırla
  useEffect(() => {
    setImageDimensions(null);
  }, [currentIndex]);

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

      {/* Image with Frame */}
      <div className="relative">
        {(() => {
          // Fotoğrafın portrait/landscape durumunu belirle
          // 1. Önce photo objesinden orientation/width/height
          // 2. Yoksa yüklenen görselin naturalWidth/naturalHeight değerlerinden
          const isPortrait = currentPhoto?.orientation === 'portrait' ||
            (currentPhoto?.width && currentPhoto?.height && currentPhoto.height > currentPhoto.width) ||
            (imageDimensions && imageDimensions.height > imageDimensions.width);

          return (
            <div
              style={{
                background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 20%, #1a1a1a 50%, #0a0a0a 80%, #1a1a1a 100%)',
                padding: '14px',
                position: 'relative',
                boxShadow: `
                  0 40px 80px -20px rgba(0,0,0,0.5),
                  0 20px 40px -20px rgba(0,0,0,0.4),
                  inset 0 2px 0 0 rgba(255,255,255,0.15),
                  inset 0 -2px 0 0 rgba(0,0,0,0.2)
                `
              }}
            >
              {/* İç çerçeve çizgisi */}
              <div
                style={{
                  position: 'absolute',
                  inset: '5px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  pointerEvents: 'none'
                }}
              />
              {/* Mat / Passepartout */}
              <div
                style={{
                  background: '#ffffff',
                  padding: isPortrait ? '28px 22px' : '22px 28px',
                  position: 'relative'
                }}
              >
                {/* V-Groove */}
                <div
                  style={{
                    position: 'absolute',
                    top: isPortrait ? '24px' : '18px',
                    left: isPortrait ? '18px' : '24px',
                    right: isPortrait ? '18px' : '24px',
                    bottom: isPortrait ? '24px' : '18px',
                    boxShadow: 'inset 1px 1px 0 0 rgba(0,0,0,0.05), inset -1px -1px 0 0 rgba(255,255,255,0.9)',
                    pointerEvents: 'none'
                  }}
                />
                {/* Fotoğraf */}
                <Image
                  src={imageUrl}
                  alt={title || 'Photo'}
                  width={isPortrait ? 600 : 900}
                  height={isPortrait ? 900 : 600}
                  quality={95}
                  className="block"
                  style={{
                    maxWidth: isPortrait ? '42vw' : '65vw',
                    maxHeight: isPortrait ? '65vh' : '50vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  priority
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!imageDimensions) {
                      setImageDimensions({
                        width: img.naturalWidth,
                        height: img.naturalHeight
                      });
                    }
                  }}
                />
              </div>
            </div>
          );
        })()}
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
