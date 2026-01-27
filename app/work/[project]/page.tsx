'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Photo, Project } from '@/lib/types';

// Demo data
const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', description: 'Capturing the raw beauty of nature across continents.', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', description: 'The pulse of city life through a different lens.', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

const demoPhotos: Photo[] = [
  { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', project_id: '1', order_index: 1, created_at: '', updated_at: '' },
  { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200', project_id: '1', order_index: 2, created_at: '', updated_at: '' },
  { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200', project_id: '1', order_index: 3, created_at: '', updated_at: '' },
  { id: '4', title: 'Desert Sunset', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200', project_id: '1', order_index: 4, created_at: '', updated_at: '' },
  { id: '5', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200', project_id: '2', order_index: 1, created_at: '', updated_at: '' },
  { id: '6', title: 'Street Scene', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200', project_id: '2', order_index: 2, created_at: '', updated_at: '' },
];

export default function ProjectPage() {
  const params = useParams();
  const slug = params.project as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Demo data kullan
    const foundProject = demoProjects.find(p => p.slug === slug);
    if (foundProject) {
      setProject(foundProject);
      const projectPhotos = demoPhotos.filter(p => p.project_id === foundProject.id);
      setPhotos(projectPhotos);
    }
  }, [slug]);

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos.length]);

  if (!project) {
    return (
      <main className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-primary">
      <Navigation projects={demoProjects} siteName="PORTFOLIO" />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Link>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 opacity-0 animate-fade-up">
            {project.title}
          </h1>
          
          {project.description && (
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl opacity-0 animate-fade-up stagger-1">
              {project.description}
            </p>
          )}
          
          <p className="text-neutral-500 mt-4 opacity-0 animate-fade-up stagger-2">
            {photos.length} photographs
          </p>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="px-4 pb-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`break-inside-avoid cursor-pointer opacity-0 ${
                loadedImages.has(photo.id) ? 'animate-fade-in' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openLightbox(index)}
            >
              <div className="relative overflow-hidden bg-neutral-900 group">
                <Image
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  width={800}
                  height={600}
                  className="w-full h-auto transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                  <span className="text-white text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View
                  </span>
                </div>
              </div>
              
              {photo.title && (
                <p className="text-neutral-500 text-sm mt-2 px-1">{photo.title}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && photos[currentPhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={prevPhoto}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <button
            onClick={nextPhoto}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh] relative">
            <Image
              src={photos[currentPhotoIndex].url}
              alt={photos[currentPhotoIndex].title || 'Photo'}
              width={1600}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono">
            {currentPhotoIndex + 1} / {photos.length}
          </div>

          {/* Title */}
          {photos[currentPhotoIndex].title && (
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-display text-lg">{photos[currentPhotoIndex].title}</p>
            </div>
          )}

          {/* Buy Print Button */}
          <Link
            href={`/shop/${photos[currentPhotoIndex].id}`}
            className="absolute bottom-6 right-6 btn-secondary text-sm"
          >
            Buy Print
          </Link>
        </div>
      )}

      <Footer />
    </main>
  );
}
