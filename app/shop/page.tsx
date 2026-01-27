'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

// Tema filtreleri
const themes = [
  { id: 'all', label: 'Tümü' },
  { id: 'portrait', label: 'Portre' },
  { id: 'landscape', label: 'Manzara' },
  { id: 'street', label: 'Sokak' },
  { id: 'nature', label: 'Doğa' },
  { id: 'blackwhite', label: 'Siyah Beyaz' },
  { id: 'travel', label: 'Seyahat' },
  { id: 'documentary', label: 'Belgesel' },
];

// Sıralama seçenekleri
const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'alpha-asc', label: 'A-Z' },
];

const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function ShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre & Sıralama
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Hover & Lightbox
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, productsData] = await Promise.all([
        getSettings(),
        getProjects(),
        getProducts()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filtreleme
  useEffect(() => {
    let result = [...products];
    
    // Tema filtresi
    if (selectedTheme !== 'all') {
      result = result.filter(p => (p as any).theme === selectedTheme);
    }
    
    // Sıralama
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'alpha-asc':
        result.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedTheme, sortBy]);

  // Lightbox açma
  const openLightbox = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-24 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            {/* Sol: Temalar */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="tracking-wide">TEMALAR</span>
              {selectedTheme !== 'all' && (
                <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">1</span>
              )}
            </button>

            {/* Sağ: Sıralama */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 shadow-lg z-50 min-w-[220px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                        className={`block w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 transition-colors ${
                          sortBy === option.value ? 'text-black font-medium' : 'text-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ürün Sayısı */}
          <p className="text-sm text-neutral-400 mb-8">
            {filteredProducts.length} eser gösteriliyor
          </p>

          {/* Products Grid - States Gallery Style */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu kategoride eser bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => {
                const isHovered = hoveredProduct === product.id;
                // Fotoğraf orientation - varsayılan landscape
                const photo = product.photos;
                const isPortrait = photo?.orientation === 'portrait' || 
                  (photo?.height && photo?.width && photo.height > photo.width);
                
                return (
                  <div
                    key={product.id}
                    className="group"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Çerçeveli Önizleme - States Gallery Style */}
                    <div 
                      className="bg-[#e8e8e8] flex items-center justify-center cursor-pointer"
                      style={{ minHeight: isPortrait ? '520px' : '420px' }}
                      onClick={(e) => openLightbox(index, e)}
                    >
                      <div 
                        className={`relative transition-all duration-500 ease-out ${
                          isHovered ? 'scale-[1.03]' : 'scale-100'
                        }`}
                      >
                        {/* Dış Çerçeve (Siyah) */}
                        <div 
                          className="relative bg-[#1a1a1a]"
                          style={{
                            padding: '6px',
                            boxShadow: isHovered 
                              ? '0 30px 60px -10px rgba(0, 0, 0, 0.5), 0 18px 36px -18px rgba(0, 0, 0, 0.4)'
                              : '0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 12px 24px -12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          {/* İç Mat / Passepartout (Beyaz) - Fotoğrafa yakın */}
                          <div 
                            className="bg-white relative"
                            style={{ padding: isPortrait ? '20px 16px' : '16px 20px' }}
                          >
                            {/* 3D Derinlik İnce Çizgi - States Gallery gibi fotoğrafa çok yakın */}
                            <div 
                              className="absolute pointer-events-none"
                              style={{
                                top: isPortrait ? '18px' : '14px',
                                left: isPortrait ? '14px' : '18px',
                                right: isPortrait ? '14px' : '18px',
                                bottom: isPortrait ? '18px' : '14px',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                              }}
                            />
                            
                            {/* Fotoğraf - Dikey/Yatay otomatik, KESMEDEN */}
                            <div 
                              className="relative overflow-hidden"
                              style={{
                                width: isPortrait ? '200px' : '280px',
                                height: isPortrait ? '280px' : '200px',
                              }}
                            >
                              <Image
                                src={photo?.url || '/placeholder.jpg'}
                                alt={product.title}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Alt Gölge */}
                        <div 
                          className={`absolute -bottom-3 left-[15%] right-[15%] h-6 -z-10 transition-opacity duration-500 ${
                            isHovered ? 'opacity-50' : 'opacity-30'
                          }`}
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Ürün Bilgileri */}
                    <Link href={`/shop/${product.id}`} className="block mt-5 text-center">
                      <h3 className="text-sm font-medium text-black tracking-wide group-hover:opacity-70 transition-opacity">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {product.edition_type === 'limited' 
                          ? `Sınırlı Baskı • ${product.edition_total} Adet`
                          : 'Açık Edisyon'}
                      </p>
                      <p className="text-sm text-black mt-2">
                        ₺{formatPrice(product.base_price)}'dan başlayan
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tema Filtre Paneli */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-medium tracking-wide">TEMALAR</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-1">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                      selectedTheme === theme.id 
                        ? 'bg-black text-white' 
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t flex gap-3">
                <button
                  onClick={() => setSelectedTheme('all')}
                  className="flex-1 py-3 border border-neutral-300 text-sm hover:bg-neutral-50 transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={filteredProducts[lightboxIndex]?.photos?.url || ''}
        title={filteredProducts[lightboxIndex]?.title}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex < filteredProducts.length - 1}
        onPrev={() => setLightboxIndex(i => Math.max(0, i - 1))}
        onNext={() => setLightboxIndex(i => Math.min(filteredProducts.length - 1, i + 1))}
      />

      <Footer settings={settings} />
    </main>
  );
}
