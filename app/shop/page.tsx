'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const themes = [
  { id: 'all', label: 'Tümü', aliases: ['all', 'tümü', 'tumu', 'hepsi'] },
  { id: 'portrait', label: 'Portre', aliases: ['portrait', 'portre'] },
  { id: 'landscape', label: 'Manzara', aliases: ['landscape', 'manzara'] },
  { id: 'street', label: 'Sokak', aliases: ['street', 'sokak'] },
  { id: 'nature', label: 'Doğa', aliases: ['nature', 'doğa', 'doga'] },
  { id: 'blackwhite', label: 'Siyah Beyaz', aliases: ['blackwhite', 'black-white', 'siyah beyaz', 'siyahbeyaz', 'siyah-beyaz', 'bw'] },
  { id: 'travel', label: 'Seyahat', aliases: ['travel', 'seyahat'] },
  { id: 'documentary', label: 'Belgesel', aliases: ['documentary', 'belgesel'] },
];

const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

const normalizeTheme = (productTheme: string | undefined | null): string => {
  if (!productTheme) return '';
  const normalized = productTheme.toLowerCase().trim();
  
  for (const theme of themes) {
    if (theme.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return theme.id;
    }
  }
  return normalized;
};

export default function ShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, productsData] = await Promise.all([
        getSettings(), getProjects(), getProducts()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setLoading(false);

      // Simple page fade-in
      setTimeout(() => setPageReady(true), 100);
    };
    loadData();
  }, []);

  // Open filter with animation
  const openFilter = () => {
    setIsFilterOpen(true);
    setTimeout(() => setFilterVisible(true), 50);
  };

  // Close filter with animation
  const closeFilter = () => {
    setFilterVisible(false);
    setTimeout(() => setIsFilterOpen(false), 300);
  };

  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };

    themes.forEach(theme => {
      if (theme.id !== 'all') {
        counts[theme.id] = products.filter(p => {
          // Tema, photos içinde
          const productTheme = (p.photos as any)?.theme;
          const normalizedProductTheme = normalizeTheme(productTheme);
          return normalizedProductTheme === theme.id;
        }).length;
      }
    });

    return counts;
  }, [products]);

  useEffect(() => {
    let result = [...products];

    if (selectedTheme !== 'all') {
      result = result.filter(p => {
        // Tema, photos içinde
        const productTheme = (p.photos as any)?.theme;
        const normalizedProductTheme = normalizeTheme(productTheme);
        return normalizedProductTheme === selectedTheme;
      });
    }
    
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
    }
    setFilteredProducts(result);
  }, [products, selectedTheme, sortBy]);

  const isPhotoPortrait = (product: Product) => {
    const photo = product.photos;
    if (!photo) return false;
    if ((photo as any).orientation === 'portrait') return true;
    if ((photo as any).orientation === 'landscape') return false;
    if ((photo as any).width && (photo as any).height) {
      return (photo as any).height > (photo as any).width;
    }
    return false;
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

      <section
        className="pt-24 pb-16"
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            <button
              onClick={openFilter}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black"
              style={{ transition: 'color 0.3s ease' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>TEMALAR</span>
              {selectedTheme !== 'all' && (
                <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">1</span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black"
                style={{ transition: 'color 0.3s ease' }}
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown
                  className="w-4 h-4"
                  style={{
                    transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </button>

              <div
                className="absolute right-0 top-full mt-2 bg-white border shadow-lg z-50 min-w-[220px]"
                style={{
                  opacity: isSortOpen ? 1 : 0,
                  transform: isSortOpen ? 'translateY(0)' : 'translateY(-8px)',
                  pointerEvents: isSortOpen ? 'auto' : 'none',
                  transition: 'opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 transition-colors duration-200 ${
                      sortBy === option.value ? 'font-medium' : 'text-neutral-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {isSortOpen && <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />}
            </div>
          </div>

          <p className="text-sm text-neutral-400 mb-8">
            {filteredProducts.length} eser gösteriliyor
          </p>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu kategoride eser bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredProducts.map((product) => {
                const photo = product.photos;
                const isPortrait = isPhotoPortrait(product);

                const frameWidth = isPortrait ? 200 : 280;
                const frameHeight = isPortrait ? 280 : 200;
                const containerHeight = isPortrait ? 480 : 400;

                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group block"
                  >
                    <div
                      className="bg-[#f5f5f5] flex items-center justify-center"
                      style={{ minHeight: `${containerHeight}px` }}
                    >
                      {/* States Gallery exact style frame */}
                      <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                        {/* Frame border + shadow (light from top-left, sharp shadow on right/bottom) */}
                        <div
                          className="border-8 border-black"
                          style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}
                        >
                          {/* White inner border line */}
                          <div className="border border-white/80">
                            {/* White mat area with inner shadow (frame casts shadow inward at top/left) */}
                            <div
                              className="bg-white"
                              style={{
                                padding: isPortrait ? '32px 24px' : '24px 32px',
                                boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.12)'
                              }}
                            >
                              {/* Photo with thin mounting line */}
                              <div
                                className="relative overflow-hidden"
                                style={{
                                  width: `${frameWidth}px`,
                                  height: `${frameHeight}px`,
                                  boxShadow: 'inset 1px 1px 0 rgba(0,0,0,0.15), inset -1px -1px 0 rgba(255,255,255,0.5)'
                                }}
                              >
                                {photo?.url && (
                                  <Image
                                    src={photo.url}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-center">
                      <h3 className="text-sm font-medium tracking-wide group-hover:opacity-70 transition-opacity">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-sm mt-2">₺{formatPrice(product.base_price)}'den başlayan</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={closeFilter}
            style={{
              opacity: filterVisible ? 1 : 0,
              transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <div
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto"
            style={{
              transform: filterVisible ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-medium">TEMALAR</h2>
                <button
                  onClick={closeFilter}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {themes.map((theme) => {
                  const count = themeCounts[theme.id] || 0;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors duration-200 ${
                        selectedTheme === theme.id ? 'bg-black text-white' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <span>{theme.label}</span>
                      <span className={`text-xs ${
                        selectedTheme === theme.id ? 'text-white/70' : 'text-neutral-400'
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </>
      )}

      <Footer settings={settings} />
    </main>
  );
}
