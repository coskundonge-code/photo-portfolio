'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

// Tema kategorileri - TÜRKÇE
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

// Sıralama seçenekleri - TÜRKÇE
const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'alpha-asc', label: 'A-Z' },
  { value: 'alpha-desc', label: 'Z-A' },
];

// Fiyat formatı (nokta ile binlik ayracı)
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function ShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtreler
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  // Sıralama
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'oldest':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case 'price-asc':
        return a.base_price - b.base_price;
      case 'price-desc':
        return b.base_price - a.base_price;
      case 'alpha-asc':
        return a.title.localeCompare(b.title, 'tr');
      case 'alpha-desc':
        return b.title.localeCompare(a.title, 'tr');
      default:
        return 0;
    }
  });

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
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          
          {/* Üst Bar - Filtreler */}
          <div className="flex items-center justify-between mb-8 py-4 border-b border-neutral-200">
            {/* Sol: Tema Filtresi */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">TEMALAR</span>
            </button>

            {/* Sağ: Sıralama Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black transition-colors"
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sıralama Menüsü */}
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 shadow-lg z-50 min-w-[220px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-blue-500 text-white'
                            : 'text-neutral-700 hover:bg-neutral-50'
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
            {sortedProducts.length} ürün
          </p>
          
          {/* Ürün Grid - States Gallery Tarzı */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {sortedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group block"
                >
                  {/* Çerçeve Konteyneri - Gri Arka Plan */}
                  <div className="bg-[#f0f0f0] p-10 lg:p-14 aspect-[4/5] flex items-center justify-center">
                    {/* Gölgeli Çerçeve */}
                    <div className="relative w-full max-w-[80%]">
                      {/* Dış Çerçeve (Siyah) */}
                      <div 
                        className="relative bg-[#1a1a1a] p-[10px]"
                        style={{
                          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* İç Mat / Passepartout (Beyaz) */}
                        <div className="bg-white p-5 lg:p-7 relative">
                          {/* Derinlik Çizgisi (3D Efekt) */}
                          <div 
                            className="absolute inset-4 lg:inset-5 pointer-events-none"
                            style={{
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 3px 6px rgba(0,0,0,0.06)'
                            }}
                          />
                          
                          {/* Fotoğraf - Kesilmeden Sığdırılmış */}
                          <div className="relative aspect-[4/3] bg-white flex items-center justify-center">
                            <Image
                              src={product.photos?.url || 'https://via.placeholder.com/800x600'}
                              alt={product.title}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Çerçeve Alt Gölgesi */}
                      <div 
                        className="absolute -bottom-4 left-[8%] right-[8%] h-8 -z-10"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Ürün Bilgisi */}
                  <div className="mt-5 text-center">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                      {product.edition_type === 'limited' ? 'Sınırlı Sayıda' : 'Açık Edisyon'}
                    </p>
                    <h3 className="text-base text-neutral-900 font-medium group-hover:text-neutral-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      ₺{formatPrice(product.base_price)}'dan başlayan
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Filtre Paneli (Soldan Açılan) */}
      {isFilterOpen && (
        <>
          {/* Arka Plan */}
          <div 
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Başlık */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-semibold">FİLTRELE VE SIRALA</h2>
                  <p className="text-sm text-neutral-500 mt-1">{sortedProducts.length} ürün</p>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Temalar */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">TEMALAR</h3>
                <div className="space-y-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`block w-full text-left py-2 text-sm transition-colors ${
                        selectedTheme === theme.id
                          ? 'text-black font-medium'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {theme.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ayırıcı */}
              <div className="border-t border-neutral-200 my-6" />

              {/* Butonlar */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedTheme('all');
                  }}
                  className="flex-1 py-3 text-sm font-medium text-neutral-700 hover:text-black transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
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
