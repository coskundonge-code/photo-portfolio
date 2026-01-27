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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-3 lg:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className={`block mb-2 md:mb-3 lg:mb-4 break-inside-avoid cursor-pointer transition-opacity duration-500 ${
                loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative group overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  width={800}
                  height={600}
                  quality={90}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>
            </div>
          ))}
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

          {/* Image only - no text */}
          <div 
            className="relative z-40"
            onClick={(e) => e.stopPropagation()}
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
        </div>
      )}
    </>
  );
}
