'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import { getSettings, getProjects, getPhotos } from '@/lib/supabase';
import { Settings, Project, Photo } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Ana içerik bileşeni - useSearchParams burada
function WorkContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(projectParam);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, photosData] = await Promise.all([
        getSettings(),
        getProjects(),
        getPhotos()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setPhotos(photosData);
      setLoading(false);
    };
    loadData();
  }, []);

  // URL'den gelen project parametresi değişince
  useEffect(() => {
    setSelectedProject(projectParam);
  }, [projectParam]);

  // Fotoğrafları filtrele
  useEffect(() => {
    if (selectedProject) {
      setFilteredPhotos(photos.filter(p => p.project_id === selectedProject));
    } else {
      setFilteredPhotos(photos);
    }
  }, [photos, selectedProject]);

  const handleProjectClick = (projectId: string | null) => {
    setSelectedProject(projectId);
    // URL'i güncelle
    if (projectId) {
      window.history.pushState({}, '', `/work?project=${projectId}`);
    } else {
      window.history.pushState({}, '', '/work');
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getSelectedProjectTitle = () => {
    if (!selectedProject) return 'Tümü';
    const project = projects.find(p => p.id === selectedProject);
    return project?.title || 'Tümü';
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
          
          {/* Proje Tabs */}
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex items-center gap-8 overflow-x-auto pb-4">
              <button
                onClick={() => handleProjectClick(null)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  !selectedProject 
                    ? 'text-black border-black' 
                    : 'text-neutral-500 border-transparent hover:text-black'
                }`}
              >
                Tümü
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    selectedProject === project.id 
                      ? 'text-black border-black' 
                      : 'text-neutral-500 border-transparent hover:text-black'
                  }`}
                >
                  {project.title}
                </button>
              ))}
            </div>
          </div>

          {/* Fotoğraf Sayısı */}
          <p className="text-sm text-neutral-400 mb-8">
            {filteredPhotos.length} fotoğraf
            {selectedProject && ` • ${getSelectedProjectTitle()}`}
          </p>

          {/* Fotoğraf Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu projede henüz fotoğraf yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo, index) => {
                const isPortrait = photo.orientation === 'portrait' ||
                  (photo.width && photo.height && photo.height > photo.width);

                return (
                  <div
                    key={photo.id}
                    className="cursor-pointer group"
                    onClick={() => openLightbox(index)}
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
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <Image
                            src={photo.url}
                            alt={photo.title || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Fotoğraf Başlığı */}
                    {photo.title && (
                      <p className="mt-3 text-sm text-neutral-600 text-center">{photo.title}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />

      {/* Lightbox */}
      {lightboxOpen && filteredPhotos.length > 0 && (
        <Lightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </main>
  );
}

// Loading fallback
function WorkLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
    </div>
  );
}

// Ana sayfa bileşeni - Suspense boundary ile sarılı
export default function WorkPage() {
  return (
    <Suspense fallback={<WorkLoading />}>
      <WorkContent />
    </Suspense>
  );
}
