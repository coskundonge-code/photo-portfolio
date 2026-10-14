'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Photo, Project } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import MasonryGrid from './MasonryGrid';

interface HomeGalleryProps {
  photos: Photo[];
  projects: Project[];
}

const photoKey = (photo: Photo) => photo.id;
const photoAspect = (photo: Photo) =>
  photo.width && photo.height ? photo.height / photo.width : undefined;

export default function HomeGallery({ photos, projects }: HomeGalleryProps) {
  const searchParams = useSearchParams();
  const scrollToPhotoId = searchParams.get('photoId');
  const photoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [pageReady, setPageReady] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedPhoto, setHighlightedPhoto] = useState<string | null>(null);
  // Lightbox'ta gerçek görsel yönü (veritabanındaki metadata yanlış olabilir)
  const [lightboxPortrait, setLightboxPortrait] = useState<boolean | null>(null);

  // Scroll to photo when coming from intro page
  useEffect(() => {
    if (scrollToPhotoId && pageReady) {
      const timer = setTimeout(() => {
        const photoElement = photoRefs.current.get(scrollToPhotoId);
        if (photoElement) {
          photoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedPhoto(scrollToPhotoId);
          // Remove highlight after animation
          setTimeout(() => setHighlightedPhoto(null), 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scrollToPhotoId, pageReady]);

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

  const currentPhoto = photos[currentIndex];

  // Gerçek görsel boyutlarını tespit et
  useEffect(() => {
    if (!lightboxOpen || !currentPhoto?.url) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setLightboxPortrait(img.naturalHeight > img.naturalWidth);
    };
    img.src = currentPhoto.url;
    return () => {
      cancelled = true;
    };
  }, [lightboxOpen, currentPhoto?.url]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxPortrait(null);
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

  const isPortrait =
    lightboxPortrait !== null
      ? lightboxPortrait
      : currentPhoto?.orientation === 'portrait' ||
        (!!currentPhoto?.width && !!currentPhoto?.height && currentPhoto.height > currentPhoto.width);

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
        <MasonryGrid
          items={photos}
          getKey={photoKey}
          getAspect={photoAspect}
          className="gap-8 md:gap-10 lg:gap-12"
          renderItem={(photo, index) => (
            <div
              ref={(el) => {
                if (el) photoRefs.current.set(photo.id, el);
              }}
              data-photo-id={photo.id}
              onClick={() => openLightbox(index)}
              className={`block mb-12 md:mb-14 lg:mb-16 cursor-pointer group transition-all duration-500 ${
                highlightedPhoto === photo.id ? 'ring-4 ring-neutral-400 ring-offset-4 rounded-sm' : ''
              }`}
            >
              {/* Realistic frame - light from top-left, scaled down 15% */}
              <div
                className="relative transition-transform duration-300 group-hover:-translate-y-1"
                style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
              >
                {/* Frame border - black */}
                <div
                  className="border-[8px] border-black"
                  style={{
                    boxShadow: '4px 4px 12px rgba(0,0,0,0.35), 2px 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* White mat with inner shadow from top-left light */}
                  <div
                    className="bg-white p-5 md:p-6 lg:p-8"
                    style={{
                      boxShadow: 'inset 15px 15px 35px rgba(0,0,0,0.18), inset 5px 5px 15px rgba(0,0,0,0.12)'
                    }}
                  >
                    {/* V-groove - realistic bevel with depth */}
                    <div
                      style={{
                        padding: '3px',
                        background: 'linear-gradient(145deg, #909090 0%, #b0b0b0 30%, #d0d0d0 70%, #e8e8e8 100%)',
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 1px rgba(255,255,255,0.6)'
                      }}
                    >
                      {/* Inner recessed area */}
                      <div
                        style={{
                          padding: '8px',
                          background: '#e8e8e8',
                          boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.15), inset 1px 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.title || 'Photo'}
                          width={800}
                          height={600}
                          quality={90}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Lightbox - White wall background */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f5f5f5]"
          onClick={closeLightbox}
          style={{
            opacity: lightboxVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-neutral-400 hover:text-neutral-800 transition-colors"
              >
                <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-neutral-400 hover:text-neutral-800 transition-colors"
              >
                <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Framed Image - hanging on wall effect.
              The photo is sized with calc() so that photo + mat + frame always fit the
              viewport; previously landscape photos were cut off on phones. */}
          <div
            className="relative z-40 mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxVisible ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.4s ease',
            }}
          >
            {/* Frame border - black */}
            <div
              className="border-[6px] sm:border-[10px] border-black"
              style={{
                boxShadow: '6px 6px 20px rgba(0,0,0,0.35), 3px 3px 10px rgba(0,0,0,0.2)'
              }}
            >
              {/* White mat with inner shadow from top-left light */}
              <div
                className="bg-white p-4 sm:p-10 md:p-14"
                style={{
                  boxShadow: 'inset 20px 20px 45px rgba(0,0,0,0.18), inset 8px 8px 20px rgba(0,0,0,0.12)'
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
                    className="p-2 sm:p-3"
                    style={{
                      background: '#e8e8e8',
                      boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.15), inset 1px 1px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Image
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      alt={currentPhoto.title || ''}
                      width={isPortrait ? 1280 : 1920}
                      height={isPortrait ? 1920 : 1280}
                      quality={95}
                      sizes="100vw"
                      className="block w-auto h-auto object-contain max-w-[calc(100vw-100px)] sm:max-w-[calc(100vw-164px)] md:max-w-[calc(100vw-196px)] max-h-[calc(100vh-168px)] sm:max-h-[calc(100vh-252px)] md:max-h-[calc(100vh-284px)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Counter */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 text-sm tracking-[0.2em] font-light"
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
