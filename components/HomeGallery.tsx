'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Photo, Project } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeGalleryProps {
  photos: Photo[];
  projects: Project[];
}

export default function HomeGallery({ photos, projects }: HomeGalleryProps) {
  const searchParams = useSearchParams();
  const scrollToPhotoId = searchParams.get('photoId');
  const photoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [pageReady, setPageReady] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedPhoto, setHighlightedPhoto] = useState<string | null>(null);

  // Fotoğrafın dikey mi yatay mı olduğunu belirle
  const isPortrait = (photo: Photo) => {
    if (photo.orientation === 'portrait') return true;
    if (photo.orientation === 'landscape') return false;
    if (photo.width && photo.height) {
      return photo.height > photo.width;
    }
    return false; // varsayılan yatay
  };

  // Fotoğrafları dikey ve yatay olarak ayır, sonra 3'lü gruplar halinde sırala
  const organizedPhotos = useMemo(() => {
    const portraits = photos.filter(p => isPortrait(p));
    const landscapes = photos.filter(p => !isPortrait(p));

    const result: Photo[] = [];
    let pIndex = 0;
    let lIndex = 0;
    let usePortrait = true; // İlk önce dikey fotoğraflarla başla

    while (pIndex < portraits.length || lIndex < landscapes.length) {
      if (usePortrait && pIndex < portraits.length) {
        // 3 dikey fotoğraf ekle
        for (let i = 0; i < 3 && pIndex < portraits.length; i++) {
          result.push(portraits[pIndex++]);
        }
      } else if (!usePortrait && lIndex < landscapes.length) {
        // 3 yatay fotoğraf ekle
        for (let i = 0; i < 3 && lIndex < landscapes.length; i++) {
          result.push(landscapes[lIndex++]);
        }
      }

      // Eğer bir grup bittiyse diğerine geç
      if (usePortrait && pIndex >= portraits.length && lIndex < landscapes.length) {
        usePortrait = false;
      } else if (!usePortrait && lIndex >= landscapes.length && pIndex < portraits.length) {
        usePortrait = true;
      } else {
        usePortrait = !usePortrait;
      }
    }

    return result;
  }, [photos]);

  // Scroll to photo when coming from intro page
  useEffect(() => {
    if (scrollToPhotoId && pageReady) {
      const timer = setTimeout(() => {
        const photoElement = photoRefs.current.get(scrollToPhotoId);
        if (photoElement) {
          photoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedPhoto(scrollToPhotoId);
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
      setCurrentIndex(prev => (prev === 0 ? organizedPhotos.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex(prev => (prev === organizedPhotos.length - 1 ? 0 : prev + 1));
    }
  }, [lightboxOpen, organizedPhotos.length]);

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
    setCurrentIndex(prev => (prev === 0 ? organizedPhotos.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === organizedPhotos.length - 1 ? 0 : prev + 1));
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

  const currentPhoto = organizedPhotos[currentIndex];

  // 3'lü gruplar halinde fotoğrafları ayır
  const photoGroups: Photo[][] = [];
  for (let i = 0; i < organizedPhotos.length; i += 3) {
    photoGroups.push(organizedPhotos.slice(i, i + 3));
  }

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
        {photoGroups.map((group, groupIndex) => {
          const groupIsPortrait = isPortrait(group[0]);

          return (
            <div
              key={groupIndex}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-10 md:mb-12"
            >
              {group.map((photo) => {
                const photoIndex = organizedPhotos.findIndex(p => p.id === photo.id);
                const photoIsPortrait = isPortrait(photo);

                return (
                  <div
                    key={photo.id}
                    ref={(el) => {
                      if (el) photoRefs.current.set(photo.id, el);
                    }}
                    data-photo-id={photo.id}
                    onClick={() => openLightbox(photoIndex)}
                    className={`cursor-pointer group transition-all duration-500 flex justify-center ${
                      highlightedPhoto === photo.id ? 'ring-4 ring-neutral-400 ring-offset-4 rounded-sm' : ''
                    }`}
                  >
                    {/* Realistic frame - light from top-left */}
                    <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                      {/* Frame border - black */}
                      <div
                        className="border-[8px] border-black"
                        style={{
                          boxShadow: '4px 4px 12px rgba(0,0,0,0.35), 2px 2px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        {/* White mat with inner shadow from top-left light */}
                        <div
                          className="bg-white"
                          style={{
                            padding: photoIsPortrait ? '24px 20px' : '20px 24px',
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
                              {/* Fixed size container for consistent layout */}
                              <div
                                className="relative overflow-hidden"
                                style={{
                                  width: photoIsPortrait ? '200px' : '280px',
                                  height: photoIsPortrait ? '280px' : '200px',
                                }}
                              >
                                <Image
                                  src={photo.url}
                                  alt={photo.title || 'Photo'}
                                  fill
                                  quality={90}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
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

          {/* Framed Image - hanging on wall effect */}
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
              className="border-[10px] border-black"
              style={{
                boxShadow: '6px 6px 20px rgba(0,0,0,0.35), 3px 3px 10px rgba(0,0,0,0.2)'
              }}
            >
              {/* White mat with inner shadow from top-left light */}
              <div
                className="bg-white p-10 md:p-14"
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
                    style={{
                      padding: '12px',
                      background: '#e8e8e8',
                      boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.15), inset 1px 1px 4px rgba(0,0,0,0.1)'
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
