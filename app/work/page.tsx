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
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 lg:gap-8">
              {filteredPhotos.map((photo, index) => {
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
