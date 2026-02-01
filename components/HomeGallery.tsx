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
        className="px-4 md:px-6 lg:px-8"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12">
          {photos.map((photo, index) => {
            const isHovered = hoveredPhoto === photo.id;

            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
                className="block mb-10 md:mb-12 lg:mb-14 break-inside-avoid cursor-pointer"
              >
                {/* Frame Container with realistic shadow */}
                <div
                  className="relative"
                  style={{
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
                >
                  {/* Main Frame */}
                  <div
                    className="relative bg-[#1c1c1c]"
                    style={{
                      padding: '12px',
                      boxShadow: isHovered
                        ? `
                          0 50px 100px -20px rgba(0,0,0,0.5),
                          0 30px 60px -30px rgba(0,0,0,0.4),
                          inset 0 1px 0 0 rgba(255,255,255,0.1),
                          inset 0 -1px 0 0 rgba(0,0,0,0.3)
                        `
                        : `
                          0 25px 50px -12px rgba(0,0,0,0.35),
                          0 12px 24px -12px rgba(0,0,0,0.25),
                          inset 0 1px 0 0 rgba(255,255,255,0.08),
                          inset 0 -1px 0 0 rgba(0,0,0,0.2)
                        `,
                      transition: 'box-shadow 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
                    }}
                  >
                    {/* Inner frame edge for depth */}
                    <div
                      className="bg-[#0a0a0a]"
                      style={{
                        padding: '2px',
                      }}
                    >
                      {/* White Mat / Passepartout */}
                      <div
                        className="bg-white relative"
                        style={{
                          padding: 'clamp(20px, 5vw, 40px)',
                        }}
                      >
                        {/* Subtle mat texture shadow */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.04)',
                          }}
                        />

                        {/* Photo with subtle shadow */}
                        <div className="relative">
                          <Image
                            src={photo.url}
                            alt={photo.title || 'Photo'}
                            width={800}
                            height={600}
                            quality={90}
                            className="w-full h-auto block"
                            style={{
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Realistic floor/wall shadow */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                      bottom: '-40px',
                      width: '90%',
                      height: '50px',
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)',
                      filter: 'blur(8px)',
                      opacity: isHovered ? 0.9 : 0.7,
                      transform: isHovered ? 'scaleX(1.05) scaleY(1.3)' : 'scaleX(1) scaleY(1)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
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
          <div className="absolute inset-0 bg-neutral-900" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-white/40 hover:text-white/80"
            style={{ transition: 'color 0.3s ease' }}
          >
            <X className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white/80"
                style={{ transition: 'color 0.3s ease' }}
              >
                <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white/40 hover:text-white/80"
                style={{ transition: 'color 0.3s ease' }}
              >
                <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Framed Image in Lightbox */}
          <div
            className="relative z-40 mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
              transition: 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            {/* Frame with shadow */}
            <div
              className="relative bg-[#1c1c1c]"
              style={{
                padding: '14px',
                boxShadow: `
                  0 60px 120px -30px rgba(0,0,0,0.7),
                  0 30px 60px -20px rgba(0,0,0,0.5),
                  inset 0 1px 0 0 rgba(255,255,255,0.1),
                  inset 0 -1px 0 0 rgba(0,0,0,0.4)
                `,
              }}
            >
              {/* Inner frame edge */}
              <div
                className="bg-[#0a0a0a]"
                style={{ padding: '3px' }}
              >
                {/* White Mat */}
                <div
                  className="bg-white relative"
                  style={{
                    padding: 'clamp(24px, 4vw, 50px)',
                  }}
                >
                  {/* Mat texture */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.04)',
                    }}
                  />

                  {/* Photo */}
                  <Image
                    src={currentPhoto.url}
                    alt=""
                    width={1920}
                    height={1280}
                    quality={95}
                    className="max-w-[85vw] max-h-[70vh] w-auto h-auto object-contain block"
                    style={{
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Lightbox floor shadow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                bottom: '-60px',
                width: '80%',
                height: '60px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 80%)',
                filter: 'blur(12px)',
              }}
            />
          </div>

          {/* Counter */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-[0.2em] font-light"
            style={{
              opacity: lightboxVisible ? 1 : 0,
              transition: 'opacity 0.5s ease 0.2s',
            }}
          >
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
