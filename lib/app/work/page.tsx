'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import { getSettings, getProjects, getPhotosByProject, getPhotos } from '@/lib/supabase';
import { Settings, Project, Photo } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function WorkPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, allPhotos] = await Promise.all([
        getSettings(), getProjects(), getPhotos()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setPhotos(allPhotos);
      setLoading(false);
    };
    loadData();
  }, []);

  // Proje değişince fotoğrafları filtrele
  useEffect(() => {
    const loadPhotos = async () => {
      if (selectedProject) {
        const projectPhotos = await getPhotosByProject(selectedProject);
        setPhotos(projectPhotos);
      } else {
        const allPhotos = await getPhotos();
        setPhotos(allPhotos);
      }
    };
    if (!loading) loadPhotos();
  }, [selectedProject, loading]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-24 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          
          {/* PROJE SEKMELERİ */}
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex flex-wrap gap-1">
              {/* Tümü sekmesi */}
              <button
                onClick={() => setSelectedProject(null)}
                className={`px-6 py-3 text-sm transition-colors relative ${
                  selectedProject === null ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Tümü
                {selectedProject === null && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>
              
              {/* Proje sekmeleri */}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`px-6 py-3 text-sm transition-colors relative ${
                    selectedProject === project.id ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {project.title}
                  {selectedProject === project.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-neutral-400 mb-8">{photos.length} fotoğraf</p>

          {/* Fotoğraf Grid - Masonry */}
          {photos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu projede henüz fotoğraf yok.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="mb-4 break-inside-avoid cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative overflow-hidden bg-neutral-100">
                    <Image
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      width={800}
                      height={600}
                      className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  {photo.title && (
                    <p className="mt-2 text-sm text-neutral-600 group-hover:text-black">
                      {photo.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX - Fotoğrafa tıklayınca açılır */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={photos[lightboxIndex]?.url || ''}
        title={photos[lightboxIndex]?.title}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex < photos.length - 1}
        onPrev={() => setLightboxIndex(i => Math.max(0, i - 1))}
        onNext={() => setLightboxIndex(i => Math.min(photos.length - 1, i + 1))}
      />

      <Footer settings={settings} />
    </main>
  );
}
