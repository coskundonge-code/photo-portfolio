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
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  // Simple page fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Gallery Grid - whole section fades in together */}
      <div
        className="px-4 md:px-6 lg:px-8"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 lg:gap-8">
          {photos.map((photo, index) => {
            const isHovered = hoveredPhoto === photo.id;

            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
                className="block mb-4 md:mb-6 lg:mb-8 break-inside-avoid cursor-pointer"
              >
                {/* Framed photo - 3D realistic */}
                <div
                  className="relative"
                  style={{
                    transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
                    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* 3D Frame with depth */}
                  <div
                    className="relative"
                    style={{
                      boxShadow: isHovered
                        ? '0 35px 60px -15px rgba(0,0,0,0.5), 0 15px 25px -10px rgba(0,0,0,0.3)'
                        : '0 20px 40px -15px rgba(0,0,0,0.4), 0 10px 20px -10px rgba(0,0,0,0.2)',
                      transition: 'box-shadow 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    {/* Outer frame - black with 3D edge */}
                    <div
                      className="bg-[#1a1a1a] p-[10px]"
                      style={{
                        boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.1), inset -2px -2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Inner frame edge - creates depth */}
                      <div
                        className="bg-[#0d0d0d] p-[3px]"
                        style={{
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* White mat */}
                        <div className="bg-[#fafafa] p-3 md:p-4 relative">
                          {/* Mat inner shadow for depth */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.08)',
                            }}
                          />
                          {/* Inner border line */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: '10px',
                              left: '10px',
                              right: '10px',
                              bottom: '10px',
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                            }}
                          />
                          {/* Photo */}
                          <Image
                            src={photo.url}
                            alt={photo.title || 'Photo'}
                            width={800}
                            height={600}
                            quality={90}
                            className="w-full h-auto relative"
                            style={{
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wall shadow - makes it look like hanging */}
                  <div
                    className="absolute -bottom-4 left-[5%] right-[5%] h-8 -z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)',
                      opacity: isHovered ? 0.8 : 0.5,
                      transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox with framed photo */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          style={{
            opacity: lightboxVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-white/30 hover:text-white/70"
            style={{ transition: 'color 0.4s ease' }}
          >
            <X className="w-6 h-6" strokeWidth={1} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/30 hover:text-white/70"
                style={{ transition: 'color 0.4s ease' }}
              >
                <ChevronLeft className="w-10 h-10" strokeWidth={1} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-2 text-white/30 hover:text-white/70"
                style={{ transition: 'color 0.4s ease' }}
              >
                <ChevronRight className="w-10 h-10" strokeWidth={1} />
              </button>
            </>
          )}

          {/* Framed Image in Lightbox */}
          <div
            className="relative z-40"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxVisible ? 'scale(1)' : 'scale(0.97)',
              transition: 'transform 0.6s ease',
            }}
          >
            {/* 3D Frame */}
            <div
              style={{
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 20px 40px -15px rgba(0,0,0,0.4)',
              }}
            >
              {/* Outer frame - black with 3D edge */}
              <div
                className="bg-[#1a1a1a] p-[12px]"
                style={{
                  boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.1), inset -2px -2px 6px rgba(0,0,0,0.4)',
                }}
              >
                {/* Inner frame edge */}
                <div
                  className="bg-[#0d0d0d] p-[4px]"
                  style={{
                    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.8), inset -1px -1px 3px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* White mat */}
                  <div className="bg-[#fafafa] p-5 md:p-8 relative">
                    {/* Mat inner shadow */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.08)',
                      }}
                    />
                    {/* Inner border line */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: '16px',
                        left: '16px',
                        right: '16px',
                        bottom: '16px',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                      }}
                    />
                    {/* Photo */}
                    <Image
                      src={currentPhoto.url}
                      alt=""
                      width={1920}
                      height={1280}
                      quality={95}
                      className="max-w-[80vw] max-h-[75vh] w-auto h-auto object-contain"
                      style={{
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Counter */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-sm tracking-widest"
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
