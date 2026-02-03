'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
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
  const [pageReady, setPageReady] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

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

      // URL'de proje parametresi yoksa ilk projeyi seç
      if (!projectParam && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }

      initialLoadDone.current = true;
      setLoading(false);
    };
    loadData();
  }, []);

  // Page fade-in on mount
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setPageReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // URL'den gelen project parametresi değişince (kullanıcı Tümü'ye tıkladığında)
  useEffect(() => {
    // Sadece ilk yükleme tamamlandıktan sonra URL değişikliklerini dinle
    if (initialLoadDone.current) {
      setSelectedProject(projectParam);
    }
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

      <section
        className="pt-24 pb-16"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">

          {/* Proje Tabs */}
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex items-center gap-8 overflow-x-auto pb-4">
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
            </div>
          </div>

          {/* Fotoğraf Grid with 3D Frames */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu projede henüz fotoğraf yok.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12 bg-[#f5f5f5] p-6 -mx-4 lg:-mx-8">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="block mb-12 md:mb-14 lg:mb-16 break-inside-avoid cursor-pointer group"
                >
                  {/* Realistic frame - same as home page, scaled down 15% */}
                  <div
                    className="relative transition-transform duration-300 group-hover:-translate-y-1"
                    style={{ transform: 'scale(0.85)' }}
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
