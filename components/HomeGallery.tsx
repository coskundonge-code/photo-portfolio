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
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Staggered reveal on mount
  useEffect(() => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        setVisibleImages(prev => new Set(prev).add(photo.id));
      }, 100 + index * 80); // Staggered delay
    });
  }, [photos]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (e.key === 'Escape') {
      closeLightbox();
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
    // Delay for smooth animation
    setTimeout(() => setLightboxVisible(true), 50);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setTimeout(() => setLightboxOpen(false), 400);
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
      <div className="px-4 md:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <p className="text-neutral-500">Henüz fotoğraf eklenmemiş.</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div className="px-2 md:px-4 lg:px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-3 lg:gap-4">
          {photos.map((photo, index) => {
            const isLoaded = loadedImages.has(photo.id);
            const isVisible = visibleImages.has(photo.id);

            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="block mb-2 md:mb-3 lg:mb-4 break-inside-avoid cursor-pointer"
                style={{
                  opacity: isVisible && isLoaded ? 1 : 0,
                  transform: isVisible && isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div className="relative group overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.title || 'Photo'}
                    width={800}
                    height={600}
                    quality={90}
                    className="w-full h-auto"
                    style={{
                      transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                      filter: isLoaded ? 'blur(0)' : 'blur(10px)',
                      transform: isLoaded ? 'scale(1)' : 'scale(1.02)',
                    }}
                    onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10"
                    style={{ transition: 'background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                  {/* Subtle scale on hover */}
                  <style jsx>{`
                    .group:hover img {
                      transform: scale(1.03) !important;
                    }
                  `}</style>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox with smooth transitions */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          style={{
            opacity: lightboxVisible ? 1 : 0,
            transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-white/40 hover:text-white/90"
            style={{ transition: 'color 0.4s ease' }}
          >
            <X className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/40 hover:text-white/90"
                style={{ transition: 'color 0.4s ease' }}
              >
                <ChevronLeft className="w-10 h-10" strokeWidth={1} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/40 hover:text-white/90"
                style={{ transition: 'color 0.4s ease' }}
              >
                <ChevronRight className="w-10 h-10" strokeWidth={1} />
              </button>
            </>
          )}

          {/* Image with fade transition */}
          <div
            className="relative z-40"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxVisible ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Image
              src={currentPhoto.url}
              alt=""
              width={1920}
              height={1280}
              quality={95}
              className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"
              priority
            />
          </div>

          {/* Counter */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-widest"
            style={{
              opacity: lightboxVisible ? 1 : 0,
              transition: 'opacity 0.6s ease 0.2s',
            }}
          >
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
