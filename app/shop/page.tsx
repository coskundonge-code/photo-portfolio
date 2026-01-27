'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

// Tema filtreleri
const themes = [
  { id: 'all', label: 'Tümü' },
  { id: 'adventure', label: 'Macera' },
  { id: 'black-white', label: 'Siyah Beyaz' },
  { id: 'iconic', label: 'İkonik' },
  { id: 'landscape', label: 'Manzara' },
  { id: 'portrait', label: 'Portre' },
  { id: 'street', label: 'Sokak' },
  { id: 'nature', label: 'Doğa' },
];

// Sıralama seçenekleri
const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'alpha-asc', label: 'A-Z' },
  { value: 'alpha-desc', label: 'Z-A' },
];

// Fiyat formatlama
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function ShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre & Sıralama
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Hover state
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

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
      setLoading(false);
    };
    loadData();
  }, []);

  // Fotoğraf orientation algılama (width/height veya aspect ratio)
  const getOrientation = (photo: any) => {
    if (photo?.width && photo?.height) {
      return photo.width > photo.height ? 'landscape' : 'portrait';
    }
    return photo?.orientation || 'landscape';
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
      
      <section className="pt-24 pb-16">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          
          {/* Header with Filter & Sort */}
          <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
            {/* Sol: TEMALAR butonu */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="uppercase tracking-wider">Temalar</span>
            </button>

            {/* Sağ: Sıralama dropdown */}
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
                  <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
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
          <p className="text-sm text-neutral-500 mb-8">
            {products.length} ürün gösteriliyor
          </p>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {products.map((product) => {
                const orientation = getOrientation(product.photos);
                const isHovered = hoveredProduct === product.id;
                
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group block"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Çerçeveli Önizleme */}
                    <div className="bg-[#f5f5f5] p-8 lg:p-12 flex items-center justify-center">
                      <div 
                        className={`relative transition-transform duration-500 ease-out ${
                          isHovered ? 'scale-105' : 'scale-100'
                        }`}
                      >
                        {/* Dış Çerçeve (Siyah) */}
                        <div 
                          className="relative bg-[#1a1a1a] p-[8px]"
                          style={{
                            boxShadow: isHovered 
                              ? '0 35px 70px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)'
                              : '0 25px 50px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.1)'
                          }}
                        >
                          {/* İç Mat / Passepartout (Beyaz) */}
                          <div className="bg-white p-3 lg:p-4 relative">
                            {/* 3D Derinlik Çizgisi - Fotoğrafa çok yakın */}
                            <div 
                              className="absolute inset-[10px] lg:inset-[14px] pointer-events-none"
                              style={{
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08), inset 0 2px 4px rgba(0,0,0,0.04)'
                              }}
                            />
                            
                            {/* Fotoğraf - Dikey/Yatay otomatik */}
                            <div className={`relative overflow-hidden ${
                              orientation === 'portrait' 
                                ? 'aspect-[3/4] w-[180px] lg:w-[220px]' 
                                : 'aspect-[4/3] w-[240px] lg:w-[300px]'
                            }`}>
                              <Image
                                src={product.photos?.url || '/placeholder.jpg'}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Alt Gölge */}
                        <div 
                          className={`absolute -bottom-3 left-[10%] right-[10%] h-6 -z-10 transition-opacity duration-500 ${
                            isHovered ? 'opacity-60' : 'opacity-40'
                          }`}
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="mt-4 text-center">
                      <h3 className="text-base text-black font-medium group-hover:opacity-70 transition-opacity">
                        {product.title}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {product.edition_type === 'limited' 
                          ? `Sınırlı Sayıda ${product.edition_total} Adet`
                          : 'Açık Edisyon'}
                      </p>
                      <p className="text-black font-medium mt-2">
                        ₺{formatPrice(product.base_price)}'dan başlayan
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tema Filtre Paneli (Sol'dan açılır) */}
      {isFilterOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium">Temalar</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
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
                  className="flex-1 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer settings={settings} />
    </main>
  );
}
