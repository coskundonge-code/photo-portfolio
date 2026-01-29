'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import RoomPreview from '@/components/RoomPreview';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, Ruler, ZoomIn, ArrowLeft } from 'lucide-react';

const defaultSizes = [
  { id: 'compact', name: 'Compact', dimensions: '42x37cm', price: 1500, scale: 0.7 },
  { id: 'regular', name: 'Regular', dimensions: '52x42cm', price: 2500, scale: 0.85 },
  { id: 'classical', name: 'Classical', dimensions: '63x52cm', price: 3500, scale: 1 },
];

const defaultFrames = [
  { id: 'black', name: 'Siyah', color: '#1a1a1a', price: 0 },
  { id: 'white', name: 'Beyaz', color: '#ffffff', price: 0 },
  { id: 'natural', name: 'Doğal Meşe', color: '#c4a574', price: 200 },
  { id: 'walnut', name: 'Ceviz', color: '#5c4033', price: 200 },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedStyle, setSelectedStyle] = useState<'mat' | 'fullbleed'>('mat');
  const [selectedSize, setSelectedSize] = useState(defaultSizes[1]);
  const [selectedFrame, setSelectedFrame] = useState(defaultFrames[0]);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [roomPreviewOpen, setRoomPreviewOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, productData] = await Promise.all([
        getSettings(), getProjects(), getProductById(params.id as string)
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setProduct(productData);
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  const isPhotoPortrait = () => {
    const photo = product?.photos;
    if (!photo) return false;
    if ((photo as any).orientation === 'portrait') return true;
    if ((photo as any).orientation === 'landscape') return false;
    if ((photo as any).width && (photo as any).height) {
      return (photo as any).height > (photo as any).width;
    }
    return false;
  };

  const isPortrait = isPhotoPortrait();
  const photoWidth = isPortrait ? 180 : 280;
  const photoHeight = isPortrait ? 260 : 180;

  const calculatePrice = () => {
    return (selectedSize.price || product?.base_price || 0) + (selectedFrame.price || 0);
  };

  const getFrameStyle = (color: string) => {
    const isWhite = color === '#ffffff';
    const isLight = color === '#c4a574';
    
    return {
      background: color,
      boxShadow: `
        inset 1px 1px 0 0 ${isWhite ? '#ffffff' : isLight ? '#d4b584' : '#3a3a3a'},
        inset 2px 2px 0 0 ${isWhite ? '#f8f8f8' : isLight ? '#c4a574' : '#2a2a2a'},
        inset -1px -1px 0 0 ${isWhite ? '#e8e8e8' : isLight ? '#a48854' : '#0a0a0a'},
        inset -2px -2px 0 0 ${isWhite ? '#e0e0e0' : isLight ? '#8a7044' : '#000000'},
        0 25px 50px -15px rgba(0,0,0,0.35)
      `
    };
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: product?.id,
      productTitle: product?.title,
      photoUrl: product?.photos?.url,
      style: selectedStyle,
      size: selectedSize,
      frame: selectedFrame,
      price: calculatePrice(),
      quantity: 1,
    };
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    router.push('/checkout');
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
          <h1 className="text-2xl">Ürün bulunamadı</h1>
        </div>
        <Footer settings={settings} />
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Geri Butonu */}
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mağazaya Dön</span>
          </Link>

          {/* Desktop: Yan yana, Mobile: Alt alta */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            {/* Sol: Fotoğraf */}
            <div className="lg:w-1/2">
              <div 
                className="bg-[#f5f5f5] flex items-center justify-center cursor-pointer relative group"
                style={{ minHeight: '400px' }}
                onClick={() => setLightboxOpen(true)}
              >
                {/* Zoom icon */}
                <div className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ZoomIn className="w-5 h-5" />
                </div>

                <div 
                  className="relative transition-all duration-500"
                  style={{ transform: `scale(${selectedSize.scale || 1})` }}
                >
                  {/* ===== DIŞ ÇERÇEVE ===== */}
                  <div 
                    style={{
                      ...getFrameStyle(selectedFrame.color),
                      padding: '12px',
                      position: 'relative',
                    }}
                  >
                    {/* ===== PASSEPARTOUT / MAT ===== */}
                    <div 
                      style={{ 
                        background: selectedStyle === 'mat' ? '#ffffff' : 'transparent',
                        padding: selectedStyle === 'mat' 
                          ? (isPortrait ? '40px 35px' : '35px 40px') 
                          : '0',
                        position: 'relative',
                        boxShadow: selectedStyle === 'mat' ? 'inset 0 0 15px rgba(0,0,0,0.04)' : 'none'
                      }}
                    >
                      {/* ===== V-GROOVE / İÇ ÇİZGİ ===== */}
                      {selectedStyle === 'mat' && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: isPortrait ? '35px' : '30px',
                            left: isPortrait ? '30px' : '35px',
                            right: isPortrait ? '30px' : '35px',
                            bottom: isPortrait ? '35px' : '30px',
                            boxShadow: `
                              inset 1px 1px 0 0 rgba(0,0,0,0.12),
                              inset -1px -1px 0 0 rgba(255,255,255,0.9),
                              inset 2px 2px 4px 0 rgba(0,0,0,0.06)
                            `,
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                      
                      {/* ===== FOTOĞRAF ===== */}
                      <div 
                        style={{
                          width: `${photoWidth}px`,
                          height: `${photoHeight}px`,
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {product.photos?.url && (
                          <Image
                            src={product.photos.url}
                            alt={product.title}
                            fill
                            className="object-cover"
                            priority
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ===== ALT GÖLGE ===== */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-18px',
                      left: '8%',
                      right: '8%',
                      height: '25px',
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
                      filter: 'blur(4px)',
                      zIndex: -1
                    }}
                  />
                </div>
              </div>
              
              <p className="text-center text-sm text-neutral-400 mt-4">{selectedSize.dimensions}</p>
            </div>

            {/* Sağ: Satın Alma Seçenekleri */}
            <div className="lg:w-1/2">
              <h1 className="text-2xl lg:text-3xl font-light mb-2 tracking-wide">
                {product.title.toUpperCase()}
              </h1>
              
              <p className="text-neutral-500 mb-4">
                {product.edition_type === 'limited' 
                  ? `Sınırlı Baskı • ${product.edition_total} Adet`
                  : 'Açık Edisyon'}
              </p>

              <div className="mb-8">
                <p className="text-3xl font-medium">₺{formatPrice(calculatePrice())}</p>
                <p className="text-sm text-neutral-400 mt-1">KDV dahil</p>
              </div>

              {/* Stil */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">
                  Stil: <span className="font-normal text-neutral-500">{selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-6 py-2.5 border text-sm transition-all ${
                      selectedStyle === 'mat' ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    Mat
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-6 py-2.5 border text-sm transition-all ${
                      selectedStyle === 'fullbleed' ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    Full Bleed
                  </button>
                </div>
              </div>

              {/* Boyut */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">
                  Boyut: <span className="font-normal text-neutral-500">{selectedSize.name}</span>
                </h3>
                <div className="space-y-2">
                  {defaultSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-4 py-3 border transition-all ${
                        selectedSize.id === size.id ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="font-medium text-sm">{size.name}</span>
                      <span className="text-neutral-500 text-sm">{size.dimensions} — ₺{formatPrice(size.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">
                  Çerçeve: <span className="font-normal text-neutral-500">{selectedFrame.name}</span>
                  {selectedFrame.price > 0 && <span className="text-neutral-400"> (+₺{selectedFrame.price})</span>}
                </h3>
                <div className="flex gap-3">
                  {defaultFrames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative w-12 h-12 rounded-full transition-all ${
                        selectedFrame.id === frame.id ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: frame.color,
                        border: frame.color === '#ffffff' ? '1px solid #e0e0e0' : 'none',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
                      }}
                    >
                      {selectedFrame.id === frame.id && (
                        <Check className={`absolute inset-0 m-auto w-5 h-5 ${
                          frame.color === '#ffffff' || frame.color === '#c4a574' ? 'text-black' : 'text-white'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-8">
                <Ruler className="w-4 h-4" />
                <span className="underline">Boyut Rehberi</span>
              </button>

              {/* SEPETE EKLE */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors mb-4 font-medium"
              >
                SEPETE EKLE — ₺{formatPrice(calculatePrice())}
              </button>

              <button 
                onClick={() => setRoomPreviewOpen(true)}
                className="w-full py-4 bg-neutral-100 text-sm hover:bg-neutral-200 transition-colors mb-8"
              >
                Odanda Görüntüle
              </button>

              <div className="pt-8 border-t">
                <h3 className="font-medium mb-4">Teknik Özellikler</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Kağıt</dt>
                    <dd>Hahnemühle Photo Rag 308gsm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Baskı</dt>
                    <dd>Giclée (Arşivsel Pigment)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Çerçeve</dt>
                    <dd>Masif Ahşap</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Cam</dt>
                    <dd>Müze Camı (UV Korumalı)</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={product.photos?.url || ''}
        title={product.title}
      />

      {/* Room Preview */}
      <RoomPreview
        isOpen={roomPreviewOpen}
        onClose={() => setRoomPreviewOpen(false)}
        imageUrl={product.photos?.url || ''}
        frameColor={selectedFrame.color}
        size={selectedSize}
      />
    </main>
  );
}
