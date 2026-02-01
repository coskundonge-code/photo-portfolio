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
  const [pageReady, setPageReady] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

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

  // Page fade-in on mount
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setPageReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

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

          {/* Fotoğraf Grid with 3D Frames */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu projede henüz fotoğraf yok.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12">
              {filteredPhotos.map((photo, index) => {
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
