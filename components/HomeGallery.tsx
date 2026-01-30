'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Photo, Project } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeGalleryProps {
  photos: Photo[];
  projects: Project[];
}

export default function HomeGallery({ photos, projects }: HomeGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      setLightboxOpen(false);
    } else if (e.key === 'ArrowLeft') {
      setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    }
  }, [lightboxOpen, photos.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (photos.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-20 text-center">
        <p className="text-neutral-500">Henüz fotoğraf eklenmemiş.</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div className="px-2 md:px-4 lg:px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 lg:gap-6">
          {photos.map((photo, index) => {
            const isPortrait = photo.orientation === 'portrait' ||
              (photo.width && photo.height && photo.height > photo.width);

            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className={`block mb-4 md:mb-5 lg:mb-6 break-inside-avoid cursor-pointer transition-all duration-500 group ${
                  loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Çerçeve */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 20%, #1a1a1a 50%, #0a0a0a 80%, #1a1a1a 100%)',
                    padding: '8px',
                    position: 'relative',
                    boxShadow: `
                      0 10px 30px -10px rgba(0,0,0,0.4),
                      0 5px 15px -5px rgba(0,0,0,0.3),
                      inset 0 1px 0 0 rgba(255,255,255,0.1),
                      inset 0 -1px 0 0 rgba(0,0,0,0.2)
                    `
                  }}
                  className="transition-transform duration-500 group-hover:scale-[1.02]"
                >
                  {/* İç çerçeve çizgisi */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '3px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Mat / Passepartout */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: isPortrait ? '12px 10px' : '10px 12px',
                      position: 'relative'
                    }}
                  >
                    {/* V-Groove */}
                    <div
                      style={{
                        position: 'absolute',
                        top: isPortrait ? '10px' : '8px',
                        left: isPortrait ? '8px' : '10px',
                        right: isPortrait ? '8px' : '10px',
                        bottom: isPortrait ? '10px' : '8px',
                        boxShadow: 'inset 1px 1px 0 0 rgba(0,0,0,0.04), inset -1px -1px 0 0 rgba(255,255,255,0.9)',
                        pointerEvents: 'none'
                      }}
                    />
                    {/* Fotoğraf */}
                    <Image
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      width={800}
                      height={600}
                      quality={90}
                      className="w-full h-auto block"
                      onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox - Clean, no text */}
      {lightboxOpen && currentPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" />
          
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/50 hover:text-white transition-colors"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            </>
          )}

          {/* Image with Frame */}
          <div
            className="relative z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              // Fotoğrafın portrait/landscape durumunu belirle
              const isPortrait = currentPhoto.orientation === 'portrait' ||
                (currentPhoto.width && currentPhoto.height && currentPhoto.height > currentPhoto.width);

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
                      src={currentPhoto.url}
                      alt=""
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
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
