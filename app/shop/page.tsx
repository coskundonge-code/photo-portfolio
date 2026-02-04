'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { useLanguage } from '@/lib/language';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const themeIds = ['all', 'portrait', 'landscape', 'street', 'nature', 'blackwhite', 'travel', 'documentary'] as const;
const themeAliases: Record<string, string[]> = {
  all: ['all', 'tümü', 'tumu', 'hepsi'],
  portrait: ['portrait', 'portre'],
  landscape: ['landscape', 'manzara'],
  street: ['street', 'sokak'],
  nature: ['nature', 'doğa', 'doga'],
  blackwhite: ['blackwhite', 'black-white', 'siyah beyaz', 'siyahbeyaz', 'siyah-beyaz', 'bw'],
  travel: ['travel', 'seyahat'],
  documentary: ['documentary', 'belgesel'],
};

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

const normalizeTheme = (productTheme: string | undefined | null): string => {
  if (!productTheme) return '';
  const normalized = productTheme.toLowerCase().trim();

  for (const themeId of themeIds) {
    if (themeAliases[themeId].some(alias => alias.toLowerCase() === normalized)) {
      return themeId;
    }
  }
  return normalized;
};

export default function ShopPage() {
  const { t } = useLanguage();
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

  const themes = themeIds.map(id => ({
    id,
    label: t(`shop.${id}`),
    aliases: themeAliases[id]
  }));

  const sortOptions = [
    { value: 'featured', label: t('shop.featured') },
    { value: 'newest', label: t('shop.newest') },
    { value: 'price-asc', label: t('shop.priceLowHigh') },
    { value: 'price-desc', label: t('shop.priceHighLow') },
  ];

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
              <span>{t('shop.themes')}</span>
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">{t('shop.noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const photo = product.photos;
                const isPortrait = isPhotoPortrait(product);

                const frameWidth = isPortrait ? 240 : 340;
                const frameHeight = isPortrait ? 340 : 240;

                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group block"
                  >
                    <div
                      className="bg-[#f5f5f5] flex items-center justify-center"
                      style={{ height: 'calc(100vh - 260px)' }}
                    >
                      {/* Realistic frame - same as home page */}
                      <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                        {/* Frame border - black */}
                        <div
                          className="border-[8px] border-black"
                          style={{
                            boxShadow: '4px 4px 12px rgba(0,0,0,0.35), 2px 2px 6px rgba(0,0,0,0.2)'
                          }}
                        >
                          {/* White mat with inner shadow from top-left light */}
                          <div
                            className="bg-white"
                            style={{
                              padding: isPortrait ? '40px 32px' : '32px 40px',
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
                                {/* Photo */}
                                <div
                                  className="relative overflow-hidden"
                                  style={{
                                    width: `${frameWidth}px`,
                                    height: `${frameHeight}px`,
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
                    </div>

                    <div className="mt-5 text-center">
                      <h3 className="text-sm font-medium tracking-wide group-hover:opacity-70 transition-opacity">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-sm mt-2">{t('shop.startingFrom')} ₺{formatPrice(product.base_price)}</p>
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
                <h2 className="text-sm font-medium">{t('shop.themes')}</h2>
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
