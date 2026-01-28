'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

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

const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

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

  useEffect(() => {
    let result = [...products];
    if (selectedTheme !== 'all') {
      result = result.filter(p => (p as any).theme === selectedTheme);
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
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
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

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Bu kategoride eser bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isHovered = hoveredProduct === product.id;
                const photo = product.photos;
                const isPortrait = isPhotoPortrait(product);
                
                // DİKEY/YATAY BOYUTLAR - States Gallery oranları (BÜYÜK)
                const photoWidth = isPortrait ? 200 : 300;
                const photoHeight = isPortrait ? 280 : 200;
                const containerHeight = isPortrait ? 500 : 420;
                
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group block"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* STATES GALLERY 3D ÇERÇEVE */}
                    <div 
                      className="bg-[#f5f5f5] flex items-center justify-center relative"
                      style={{ minHeight: `${containerHeight}px` }}
                    >
                      {/* Ana Çerçeve Container */}
                      <div 
                        className={`relative transition-all duration-500 ease-out ${
                          isHovered ? 'scale-[1.02]' : 'scale-100'
                        }`}
                      >
                        {/* ===== DIŞ ÇERÇEVE - Kalın Siyah ===== */}
                        <div 
                          style={{
                            background: '#1a1a1a',
                            padding: '10px',
                            position: 'relative',
                            // 3D Çerçeve efekti - üst ve sol kenar açık, alt ve sağ koyu
                            boxShadow: `
                              inset 1px 1px 0 0 #3a3a3a,
                              inset 2px 2px 0 0 #2a2a2a,
                              inset -1px -1px 0 0 #0a0a0a,
                              inset -2px -2px 0 0 #000000,
                              0 20px 40px -10px rgba(0,0,0,0.4),
                              0 10px 20px -5px rgba(0,0,0,0.2)
                            `
                          }}
                        >
                          {/* ===== PASSEPARTOUT / MAT ===== */}
                          <div 
                            style={{ 
                              background: '#ffffff',
                              padding: isPortrait ? '35px 30px' : '30px 35px',
                              position: 'relative',
                              // Mat üzerinde hafif gölge
                              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* ===== V-GROOVE / İÇ ÇİZGİ - 3D Derinlik ===== */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: isPortrait ? '30px' : '25px',
                                left: isPortrait ? '25px' : '30px',
                                right: isPortrait ? '25px' : '30px',
                                bottom: isPortrait ? '30px' : '25px',
                                // Çift çizgi ile 3D efekt - üst/sol gölge, alt/sağ highlight
                                boxShadow: `
                                  inset 1px 1px 0 0 rgba(0,0,0,0.15),
                                  inset -1px -1px 0 0 rgba(255,255,255,0.8),
                                  inset 2px 2px 3px 0 rgba(0,0,0,0.08)
                                `,
                                pointerEvents: 'none'
                              }}
                            />
                            
                            {/* ===== FOTOĞRAF ===== */}
                            <div 
                              style={{
                                width: `${photoWidth}px`,
                                height: `${photoHeight}px`,
                                position: 'relative',
                                overflow: 'hidden',
                                // Fotoğraf etrafında ince gölge
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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

                        {/* ===== ALT GÖLGE ===== */}
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: '-15px',
                            left: '10%',
                            right: '10%',
                            height: '20px',
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
                            filter: 'blur(3px)',
                            zIndex: -1
                          }}
                        />
                      </div>
                    </div>

                    {/* Ürün Bilgileri - SOLDA */}
                    <div className="mt-6 text-left">
                      <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                        {product.edition_type === 'limited' ? 'Sınırlı Baskı' : 'Açık Edisyon'}
                      </p>
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

      {/* Tema Filtre Paneli */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-medium">TEMALAR</h2>
                <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-1">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`block w-full text-left px-4 py-3 text-sm ${
                      selectedTheme === theme.id ? 'bg-black text-white' : 'hover:bg-neutral-100'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
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
