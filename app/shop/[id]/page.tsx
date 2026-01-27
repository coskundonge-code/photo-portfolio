'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, Truck, Shield, RotateCcw } from 'lucide-react';

// Boyut seçenekleri - TÜRKÇE
const sizes = [
  { id: 'small', label: 'Küçük', dimensions: '30 × 40 cm', priceMultiplier: 1 },
  { id: 'medium', label: 'Orta', dimensions: '50 × 70 cm', priceMultiplier: 1.8 },
  { id: 'large', label: 'Büyük', dimensions: '70 × 100 cm', priceMultiplier: 2.5 },
  { id: 'xlarge', label: 'Çok Büyük', dimensions: '100 × 140 cm', priceMultiplier: 3.5 },
];

// Çerçeve seçenekleri - TÜRKÇE
const frames = [
  { id: 'none', label: 'Çerçevesiz', color: 'transparent', price: 0 },
  { id: 'black', label: 'Siyah', color: '#1a1a1a', price: 500 },
  { id: 'white', label: 'Beyaz', color: '#ffffff', price: 500 },
  { id: 'natural', label: 'Doğal Meşe', color: '#c4a574', price: 700 },
  { id: 'walnut', label: 'Ceviz', color: '#5c4033', price: 700 },
];

// Fiyat formatı (nokta ile binlik ayracı)
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function ProductPage() {
  const params = useParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [selectedFrame, setSelectedFrame] = useState(frames[1]);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, productData] = await Promise.all([
        getSettings(),
        getProjects(),
        getProductById(params.id as string)
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setProduct(productData);
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = product.base_price * selectedSize.priceMultiplier;
    const framePrice = selectedFrame.price;
    return Math.round(basePrice + framePrice);
  };

  const handleAddToCart = () => {
    alert('Sepete eklendi!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation projects={projects} settings={settings} />
        <div className="pt-32 pb-16 px-6 text-center">
          <h1 className="text-2xl text-neutral-900">Ürün bulunamadı</h1>
        </div>
        <Footer settings={settings} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Sol: Ürün Önizleme - Çerçeveli */}
            <div className="relative">
              <div className="sticky top-28">
                {/* Duvar Arka Planı - States Gallery tarzı */}
                <div className="bg-[#f0f0f0] p-12 lg:p-16 flex items-center justify-center min-h-[500px]">
                  {/* Çerçeve Önizleme */}
                  <div className="relative w-full max-w-md">
                    {/* Dış Çerçeve */}
                    <div 
                      className="relative p-[10px] transition-all duration-300"
                      style={{ 
                        backgroundColor: selectedFrame.id === 'none' ? 'transparent' : selectedFrame.color,
                        boxShadow: selectedFrame.id === 'none' 
                          ? 'none' 
                          : '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Mat / Passepartout */}
                      <div 
                        className={`relative transition-all duration-300 ${
                          selectedFrame.id === 'none' ? '' : 'bg-white p-6 lg:p-8'
                        }`}
                      >
                        {/* Derinlik Çizgisi (3D Efekt) */}
                        {selectedFrame.id !== 'none' && (
                          <div 
                            className="absolute inset-4 lg:inset-6 pointer-events-none"
                            style={{
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 3px 6px rgba(0,0,0,0.06)'
                            }}
                          />
                        )}
                        
                        {/* Fotoğraf - Kesilmeden Sığdırılmış */}
                        <div className="relative aspect-[4/3] bg-white flex items-center justify-center">
                          <Image
                            src={product.photos?.url || 'https://via.placeholder.com/800'}
                            alt={product.title}
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Çerçeve Alt Gölgesi */}
                    {selectedFrame.id !== 'none' && (
                      <div 
                        className="absolute -bottom-4 left-[10%] right-[10%] h-8 -z-10"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)'
                        }}
                      />
                    )}
                  </div>
                </div>
                
                {/* Boyut göstergesi */}
                <p className="text-center text-sm text-neutral-400 mt-4">
                  {selectedSize.dimensions}
                </p>
              </div>
            </div>

            {/* Sağ: Ürün Seçenekleri */}
            <div className="lg:pt-4">
              {/* Başlık ve Edisyon */}
              <div className="mb-8">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">
                  {product.edition_type === 'limited' ? 'Sınırlı Sayıda' : 'Açık Edisyon'}
                </p>
                <h1 className="text-3xl lg:text-4xl font-light text-black mb-2">
                  {product.title}
                </h1>
                {product.edition_type === 'limited' && (
                  <p className="text-neutral-500">
                    {product.edition_total} adet üretildi — {(product.edition_total || 0) - (product.edition_sold || 0)} adet kaldı
                  </p>
                )}
              </div>

              {/* Fiyat */}
              <div className="mb-8">
                <p className="text-3xl font-medium text-black">
                  ₺{formatPrice(calculatePrice())}
                </p>
                <p className="text-sm text-neutral-400 mt-1">KDV dahil. Kargo ücreti hesaplanacak.</p>
              </div>

              {/* Boyut Seçimi */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-4 uppercase tracking-wider">Boyut</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 border text-left transition-all ${
                        selectedSize.id === size.id
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="block font-medium">{size.label}</span>
                      <span className={`text-sm ${selectedSize.id === size.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {size.dimensions}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Seçimi */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-4 uppercase tracking-wider">Çerçeve</h3>
                <div className="flex flex-wrap gap-3">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative flex items-center gap-3 px-4 py-3 border transition-all ${
                        selectedFrame.id === frame.id
                          ? 'border-black'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {frame.id === 'none' ? (
                        <div className="w-6 h-6 rounded border-2 border-dashed border-neutral-300" />
                      ) : (
                        <div 
                          className="w-6 h-6 rounded border border-neutral-200"
                          style={{ backgroundColor: frame.color }}
                        />
                      )}
                      <span className="text-sm">{frame.label}</span>
                      {frame.price > 0 && (
                        <span className="text-xs text-neutral-400">+₺{formatPrice(frame.price)}</span>
                      )}
                      {selectedFrame.id === frame.id && (
                        <Check className="w-4 h-4 text-black absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white font-medium hover:bg-neutral-800 transition-colors uppercase tracking-wider"
              >
                Sepete Ekle — ₺{formatPrice(calculatePrice())}
              </button>

              {/* Ürün Bilgileri */}
              <div className="mt-10 pt-8 border-t border-neutral-200 space-y-6">
                <div className="flex items-start gap-4">
                  <Truck className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Ücretsiz Kargo</h4>
                    <p className="text-sm text-neutral-500">5-7 iş günü içinde teslimat</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Kalite Garantisi</h4>
                    <p className="text-sm text-neutral-500">Müze kalitesinde arşivsel baskı</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RotateCcw className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Kolay İade</h4>
                    <p className="text-sm text-neutral-500">30 gün içinde para iade garantisi</p>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              {product.description && (
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <h3 className="font-medium text-black mb-4">Bu Baskı Hakkında</h3>
                  <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Teknik Özellikler */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="font-medium text-black mb-4">Teknik Özellikler</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Kağıt</dt>
                    <dd className="text-black">Hahnemühle Photo Rag 308gsm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Baskı Tekniği</dt>
                    <dd className="text-black">Giclée (Arşivsel Pigment)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Çerçeve Malzemesi</dt>
                    <dd className="text-black">Masif Ahşap</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Cam</dt>
                    <dd className="text-black">Müze Camı (UV Korumalı)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Montaj</dt>
                    <dd className="text-black">Asitsiz Pasparto</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
