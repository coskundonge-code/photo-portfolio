'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPhotos, getProducts, getProjects } from '@/lib/supabase';
import { Photo, Product, Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const themeOptions = [
  { id: 'portrait', label: 'Portre' },
  { id: 'landscape', label: 'Manzara' },
  { id: 'street', label: 'Sokak' },
  { id: 'nature', label: 'Doğa' },
  { id: 'blackwhite', label: 'Siyah Beyaz' },
  { id: 'travel', label: 'Seyahat' },
  { id: 'documentary', label: 'Belgesel' },
];

export default function ShopPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [photosData, productsData, projectsData] = await Promise.all([
          getPhotos(),
          getProducts(),
          getProjects()
        ]);
        setPhotos(photosData);
        setProducts(productsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Fotoğrafları filtrele
  const filteredPhotos = photos.filter(photo => {
    if (selectedTheme && (photo as any).theme !== selectedTheme) return false;
    if (selectedProject && photo.project_id !== selectedProject) return false;
    return true;
  });

  // Fotoğrafın fiyatını bul
  const getPhotoPrice = (photoId: string) => {
    const product = products.find(p => p.photo_id === photoId);
    return (product as any)?.price || 2950;
  };

  // Fotoğrafın sanatçı adını bul (proje adı kullan)
  const getArtistName = (photo: Photo) => {
    const project = projects.find(p => p.id === photo.project_id);
    return project?.title || 'Coşkun Dönge';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-white">
      {/* Banner */}
      <div className="bg-neutral-100 py-8 lg:py-12 mb-8">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-light tracking-wide text-center">Mağaza</h1>
          <p className="text-center text-neutral-500 mt-2 text-sm">
            Tüm eserler müze kalitesinde basılmış ve el yapımı çerçevelenmiştir.
          </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="flex gap-8">
          
          {/* Sol Sidebar - Filtreler */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              
              {/* Çalışmalar (Projeler) */}
              {projects.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-semibold tracking-wider text-neutral-400 mb-4">ÇALIŞMALAR</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className={`block w-full text-left text-sm py-1 transition-colors ${
                        selectedProject === null ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      Tümü
                    </button>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project.id)}
                        className={`block w-full text-left text-sm py-1 transition-colors ${
                          selectedProject === project.id ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Temalar */}
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-neutral-400 mb-4">TEMALAR</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTheme(null)}
                    className={`block w-full text-left text-sm py-1 transition-colors ${
                      selectedTheme === null ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Tümü
                  </button>
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`block w-full text-left text-sm py-1 transition-colors ${
                        selectedTheme === theme.id ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtreleri Temizle */}
              {(selectedTheme || selectedProject) && (
                <button
                  onClick={() => {
                    setSelectedTheme(null);
                    setSelectedProject(null);
                  }}
                  className="mt-6 text-sm text-neutral-400 hover:text-black underline"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>

          {/* Sağ: Fotoğraf Grid */}
          <div className="flex-1">
            {/* Sonuç Sayısı */}
            <div className="mb-6 text-sm text-neutral-500">
              {filteredPhotos.length} eser
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
              {filteredPhotos.map((photo) => {
                const isPortrait = (photo as any).orientation === 'portrait';
                
                return (
                  <Link key={photo.id} href={`/shop/${photo.id}`} className="group block">
                    {/* Çerçeve Container - States Gallery Stili */}
                    <div className="relative bg-neutral-100 flex items-center justify-center p-6 lg:p-8">
                      
                      {/* Çerçeve */}
                      <div 
                        className="relative"
                        style={{
                          // Siyah dış çerçeve
                          padding: '8px',
                          backgroundColor: '#1a1a1a',
                          boxShadow: `
                            inset 1px 1px 0 0 #3a3a3a,
                            inset -1px -1px 0 0 #0a0a0a,
                            0 25px 50px -12px rgba(0,0,0,0.35),
                            0 12px 24px -8px rgba(0,0,0,0.2)
                          `,
                        }}
                      >
                        {/* Beyaz Passepartout (Mat) - Daha dar */}
                        <div 
                          style={{
                            padding: isPortrait ? '20px 16px' : '16px 20px',
                            backgroundColor: '#fafafa',
                            boxShadow: `
                              inset 1px 1px 0 0 rgba(0,0,0,0.08),
                              inset -1px -1px 0 0 rgba(255,255,255,0.9),
                              inset 2px 2px 4px 0 rgba(0,0,0,0.04)
                            `,
                          }}
                        >
                          {/* Fotoğraf - Daha büyük */}
                          <div 
                            className="relative overflow-hidden"
                            style={{
                              width: isPortrait ? '180px' : '260px',
                              height: isPortrait ? '260px' : '180px',
                            }}
                          >
                            <Image
                              src={photo.url}
                              alt={photo.title || ''}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Alt Gölge */}
                      <div 
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4"
                        style={{
                          background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
                          filter: 'blur(4px)',
                        }}
                      />
                    </div>

                    {/* Fotoğraf Bilgileri - SOLDA (States Gallery gibi) */}
                    <div className="mt-4 text-left">
                      <p className="text-xs text-neutral-400 uppercase tracking-wider">
                        {getArtistName(photo)}
                      </p>
                      <h3 className="text-sm font-semibold text-black mt-1 group-hover:opacity-70 transition-opacity">
                        {photo.title || 'İsimsiz'}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        ₺{getPhotoPrice(photo.id).toLocaleString('tr-TR')}'den başlayan
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Boş State */}
            {filteredPhotos.length === 0 && (
              <div className="text-center py-20">
                <p className="text-neutral-500">Bu filtrelere uygun eser bulunamadı.</p>
                <button
                  onClick={() => {
                    setSelectedTheme(null);
                    setSelectedProject(null);
                  }}
                  className="mt-4 text-sm underline hover:text-black"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filtreler */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-30">
        <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="flex-shrink-0 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white"
            >
              <option value="">Tüm Çalışmalar</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            
            <select
              value={selectedTheme || ''}
              onChange={(e) => setSelectedTheme(e.target.value || null)}
              className="flex-shrink-0 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white"
            >
              <option value="">Tüm Temalar</option>
              {themeOptions.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Mobile */}
      <div className="h-32 lg:hidden" />
    </div>
  );
}
