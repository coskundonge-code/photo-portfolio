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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

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
    };
    loadData();
  }, []);

  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    
    themes.forEach(theme => {
      if (theme.id !== 'all') {
        counts[theme.id] = products.filter(p => {
          const productTheme = (p as any).theme;
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
        const productTheme = (p as any).theme;
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
      
      <section className="pt-24 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
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
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white border shadow-lg z-50 min-w-[220px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                        className={`block w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 ${
                          sortBy === option.value ? 'font-medium' : 'text-neutral-600'
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

          <p className="text-sm text-neutral-400 mb-8">{filteredProducts.length} eser gösteriliyor</p>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu kategoride eser bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isHovered = hoveredProduct === product.id;
                const photo = product.photos;
                const isPortrait = isPhotoPortrait(product);
                
                const frameWidth = isPortrait ? 220 : 320;
                const frameHeight = isPortrait ? 320 : 220;
                const containerHeight = isPortrait ? 580 : 480;
                
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group block"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div 
                      className="bg-[#e8e8e8] flex items-center justify-center"
                      style={{ minHeight: `${containerHeight}px` }}
                    >
                      <div className={`relative transition-all duration-500 ${isHovered ? 'scale-[1.03]' : 'scale-100'}`}>
                        {/* Outer Frame - Black with 3D depth */}
                        <div
                          className="relative"
                          style={{
                            padding: '12px',
                            background: 'linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 15%, #1a1a1a 85%, #0a0a0a 100%)',
                            boxShadow: isHovered
                              ? '8px 12px 28px rgba(0,0,0,0.45), 2px 4px 12px rgba(0,0,0,0.3)'
                              : '6px 10px 24px rgba(0,0,0,0.35), 2px 3px 10px rgba(0,0,0,0.25)',
                          }}
                        >
                          {/* Inner frame edge highlight */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.12), inset -1px -1px 0 rgba(0,0,0,0.3)',
                            }}
                          />

                          {/* Mat / Passepartout */}
                          <div
                            className="relative"
                            style={{
                              background: '#fafafa',
                              padding: isPortrait ? '36px 28px' : '28px 36px',
                              boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.08), inset 1px 1px 4px rgba(0,0,0,0.05)',
                            }}
                          >
                            {/* V-Groove - Beveled cut line */}
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                top: isPortrait ? '32px' : '24px',
                                left: isPortrait ? '24px' : '32px',
                                right: isPortrait ? '24px' : '32px',
                                bottom: isPortrait ? '32px' : '24px',
                                boxShadow: `
                                  inset 2px 2px 0 rgba(255,255,255,0.9),
                                  inset -2px -2px 0 rgba(0,0,0,0.12),
                                  inset 3px 3px 2px rgba(255,255,255,0.5),
                                  inset -3px -3px 2px rgba(0,0,0,0.08)
                                `,
                              }}
                            />

                            {/* Photo container */}
                            <div
                              className="relative overflow-hidden bg-neutral-100"
                              style={{
                                width: `${frameWidth}px`,
                                height: `${frameHeight}px`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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

                        {/* Floor shadow */}
                        <div
                          className={`absolute -bottom-4 left-[10%] right-[10%] h-8 -z-10 transition-opacity duration-500 ${
                            isHovered ? 'opacity-50' : 'opacity-35'
                          }`}
                          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)' }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 text-left px-2">
                      {(product as any).artist && (
                        <p className="text-xs text-neutral-500 tracking-wider uppercase mb-1">
                          {(product as any).artist}
                        </p>
                      )}
                      <h3 className="text-base font-medium tracking-wide group-hover:opacity-70 transition-opacity">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-2">
                        From ₺{formatPrice(product.base_price)}
                      </p>
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
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-medium">TEMALAR</h2>
                <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-1">
                {themes.map((theme) => {
                  const count = themeCounts[theme.id] || 0;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${
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

              <div className="mt-8 pt-6 border-t flex gap-3">
                <button onClick={() => setSelectedTheme('all')} className="flex-1 py-3 border text-sm">Temizle</button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 bg-black text-white text-sm">Uygula</button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer settings={settings} />
    </main>
  );
}
