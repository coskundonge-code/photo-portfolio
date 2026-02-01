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
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-10 lg:gap-12 bg-[#f5f5f5] p-6 -mx-4 lg:-mx-8">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="block mb-12 md:mb-14 lg:mb-16 break-inside-avoid cursor-pointer group"
                >
                  {/* States Gallery exact style frame */}
                  <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                    {/* Black frame border + shadow */}
                    <div
                      className="border-[10px] border-black"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                    >
                      {/* White inner border (passe-partout line) */}
                      <div className="border-2 border-white">
                        {/* White mat area */}
                        <div className="bg-white p-8 md:p-10 lg:p-12">
                          {/* Photo with thin border for 3D depth */}
                          <div className="border border-neutral-300">
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
