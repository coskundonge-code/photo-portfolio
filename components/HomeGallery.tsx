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
  const [pageReady, setPageReady] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    setTimeout(() => setLightboxVisible(true), 50);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setTimeout(() => setLightboxOpen(false), 500);
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
      <div
        className="px-4 md:px-6 lg:px-8 py-20 text-center"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        <p className="text-neutral-500">Henüz fotoğraf eklenmemiş.</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div
        className="px-4 md:px-6 lg:px-8 bg-[#f5f5f5] py-8"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="block mb-12 md:mb-14 lg:mb-16 break-inside-avoid cursor-pointer group"
            >
              {/* States Gallery exact style frame */}
              <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                {/* Black frame border + shadow */}
                <div
                  className="border-[10px] border-black"
                  style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                >
                  {/* White inner border (passe-partout line) */}
                  <div className="border-2 border-white">
                    {/* White mat area */}
                    <div className="bg-white p-8 md:p-10 lg:p-12">
                      {/* Photo with 3D inset border effect */}
                      <div
                        style={{
                          borderTop: '3px solid #e8e8e8',
                          borderLeft: '3px solid #e8e8e8',
                          borderBottom: '3px solid #a0a0a0',
                          borderRight: '3px solid #a0a0a0',
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.title || 'Photo'}
                          width={800}
                          height={600}
                          quality={90}
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]"
          onClick={closeLightbox}
          style={{
            opacity: lightboxVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white/80 transition-colors"
              >
                <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white/80 transition-colors"
              >
                <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Framed Image */}
          <div
            className="relative z-40 mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxVisible ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.4s ease',
            }}
          >
            {/* States Gallery exact style frame */}
            <div
              className="border-[12px] border-black"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            >
              {/* White inner border (passe-partout line) */}
              <div className="border-2 border-white">
                {/* White mat area */}
                <div className="bg-white p-10 md:p-14">
                  {/* Photo with 3D inset border effect */}
                  <div
                    style={{
                      borderTop: '3px solid #e8e8e8',
                      borderLeft: '3px solid #e8e8e8',
                      borderBottom: '3px solid #a0a0a0',
                      borderRight: '3px solid #a0a0a0',
                    }}
                  >
                    <Image
                      src={currentPhoto.url}
                      alt=""
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

          {/* Counter */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-[0.2em] font-light"
            style={{
              opacity: lightboxVisible ? 1 : 0,
              transition: 'opacity 0.4s ease 0.2s',
            }}
          >
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
