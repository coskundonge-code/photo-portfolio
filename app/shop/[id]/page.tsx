'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import RoomPreview from '@/components/RoomPreview';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, Ruler, ZoomIn } from 'lucide-react';

// Varsayılan boyutlar
const defaultSizes = [
  { id: 'compact', name: 'Compact', dimensions: '42x37cm', price: 1500, scale: 0.7 },
  { id: 'regular', name: 'Regular', dimensions: '52x42cm', price: 2500, scale: 0.85 },
  { id: 'classical', name: 'Classical', dimensions: '63x52cm', price: 3500, scale: 1 },
];

// Varsayılan çerçeve renkleri
const defaultFrames = [
  { id: 'black', name: 'Siyah', color: '#1a1a1a', price: 0 },
  { id: 'white', name: 'Beyaz', color: '#ffffff', price: 0 },
  { id: 'natural', name: 'Doğal Meşe', color: '#c4a574', price: 200 },
  { id: 'walnut', name: 'Ceviz', color: '#5c4033', price: 200 },
];

const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Seçimler
  const [selectedStyle, setSelectedStyle] = useState<'mat' | 'fullbleed'>('mat');
  const [selectedSize, setSelectedSize] = useState(defaultSizes[1]);
  const [selectedFrame, setSelectedFrame] = useState(defaultFrames[0]);
  
  // Modals
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [roomPreviewOpen, setRoomPreviewOpen] = useState(false);

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

  // Fotoğraf orientation
  const isPortrait = product?.photos?.orientation === 'portrait' || 
    (product?.photos?.height && product?.photos?.width && product.photos.height > product.photos.width);

  // Toplam fiyat hesaplama
  const calculatePrice = () => {
    const basePrice = selectedSize.price || product?.base_price || 0;
    const framePrice = selectedFrame.price || 0;
    return basePrice + framePrice;
  };

  // Sepete ekle
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
    
    // Cart updated event
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Checkout'a yönlendir
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
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Sol: Ürün Önizleme */}
            <div className="relative">
              <div className="sticky top-24">
                {/* Ana Görsel - Tıklanabilir */}
                <div 
                  className="bg-[#e8e8e8] flex items-center justify-center cursor-pointer relative group"
                  style={{ minHeight: '500px' }}
                  onClick={() => setLightboxOpen(true)}
                >
                  {/* Zoom icon */}
                  <div className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5" />
                  </div>

                  {/* Çerçeve Önizleme - Scale ile boyut değişimi */}
                  <div 
                    className="relative transition-all duration-500 ease-out"
                    style={{ transform: `scale(${selectedSize.scale || 1})` }}
                  >
                    {/* Dış Çerçeve */}
                    <div 
                      className="relative transition-colors duration-300"
                      style={{ 
                        backgroundColor: selectedFrame.color,
                        padding: '6px',
                        boxShadow: '0 25px 50px -10px rgba(0, 0, 0, 0.4), 0 15px 30px -15px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {/* İç Mat */}
                      <div 
                        className={`transition-all duration-300 relative ${
                          selectedStyle === 'mat' ? 'bg-white' : ''
                        }`}
                        style={{ 
                          padding: selectedStyle === 'mat' 
                            ? (isPortrait ? '28px 22px' : '22px 28px') 
                            : '0' 
                        }}
                      >
                        {/* 3D Derinlik Çizgisi */}
                        {selectedStyle === 'mat' && (
                          <div 
                            className="absolute pointer-events-none"
                            style={{
                              top: isPortrait ? '26px' : '20px',
                              left: isPortrait ? '20px' : '26px',
                              right: isPortrait ? '20px' : '26px',
                              bottom: isPortrait ? '26px' : '20px',
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                            }}
                          />
                        )}
                        
                        {/* Fotoğraf */}
                        <div 
                          className="relative overflow-hidden"
                          style={{
                            width: isPortrait ? '220px' : '320px',
                            height: isPortrait ? '320px' : '220px',
                          }}
                        >
                          <Image
                            src={product.photos?.url || '/placeholder.jpg'}
                            alt={product.title}
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alt Gölge */}
                    <div 
                      className="absolute -bottom-4 left-[10%] right-[10%] h-8 -z-10"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)'
                      }}
                    />
                  </div>
                </div>
                
                {/* Boyut göstergesi */}
                <p className="text-center text-sm text-neutral-400 mt-4">
                  {selectedSize.dimensions}
                </p>
              </div>
            </div>

            {/* Sağ: Ürün Bilgileri & Seçenekler */}
            <div className="lg:pt-4">
              
              {/* Başlık */}
              <h1 className="text-2xl lg:text-3xl font-light text-black mb-2 tracking-wide">
                {product.title.toUpperCase()}
              </h1>
              
              {/* Edisyon */}
              <p className="text-neutral-500 mb-4">
                {product.edition_type === 'limited' 
                  ? `Sınırlı Baskı • ${product.edition_total} Adet — ${(product.edition_total || 0) - (product.edition_sold || 0)} kaldı`
                  : 'Açık Edisyon'}
              </p>

              {/* Fiyat */}
              <div className="mb-8">
                <p className="text-3xl font-medium text-black">
                  ₺{formatPrice(calculatePrice())}
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  KDV dahil. Kargo hesapta hesaplanır.
                </p>
              </div>

              {/* Stil Seçimi */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-3">
                  Stilinizi Seçin: <span className="font-normal text-neutral-500">{selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-6 py-2.5 border text-sm transition-all ${
                      selectedStyle === 'mat'
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    Mat
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-6 py-2.5 border text-sm transition-all ${
                      selectedStyle === 'fullbleed'
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    Full Bleed
                  </button>
                </div>
              </div>

              {/* Boyut Seçimi */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-3">
                  Çerçeve Boyutu: <span className="font-normal text-neutral-500">{selectedSize.name}</span>
                </h3>
                <div className="space-y-2">
                  {defaultSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-4 py-3 border transition-all ${
                        selectedSize.id === size.id
                          ? 'border-black'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{size.name}</span>
                      <span className="text-neutral-500 text-sm">{size.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Rengi - Yuvarlak Küreler */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-3">
                  Çerçeve Rengi: <span className="font-normal text-neutral-500">{selectedFrame.name}</span>
                </h3>
                <div className="flex gap-3">
                  {defaultFrames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative w-10 h-10 rounded-full transition-all ${
                        selectedFrame.id === frame.id
                          ? 'ring-2 ring-offset-2 ring-black'
                          : 'hover:scale-110'
                      }`}
                      style={{ 
                        backgroundColor: frame.color,
                        border: frame.color === '#ffffff' ? '1px solid #e5e5e5' : 'none'
                      }}
                      title={frame.name}
                    >
                      {selectedFrame.id === frame.id && (
                        <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                          frame.color === '#ffffff' || frame.color === '#c4a574' 
                            ? 'text-black' 
                            : 'text-white'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Guide */}
              <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors mb-8">
                <Ruler className="w-4 h-4" />
                <span className="underline">Boyut Rehberi</span>
              </button>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors mb-4"
              >
                Sepete Ekle — ₺{formatPrice(calculatePrice())}
              </button>

              {/* Odanda Görüntüle */}
              <button 
                onClick={() => setRoomPreviewOpen(true)}
                className="w-full py-4 bg-neutral-100 text-black text-sm tracking-wide hover:bg-neutral-200 transition-colors mb-4"
              >
                Odanda Görüntüle
              </button>

              {/* Hikaye */}
              {(product.description || (product as any).story) && (
                <div className="mt-10 pt-8 border-t border-neutral-200">
                  <h3 className="font-medium text-black mb-4">Bu Eser Hakkında</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {(product as any).story || product.description}
                  </p>
                </div>
              )}

              {/* Teknik Özellikler */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="font-medium text-black mb-4">Teknik Özellikler</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Kağıt</dt>
                    <dd className="text-black">{(product as any).paper_type || 'Hahnemühle Photo Rag 308gsm'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Baskı Tekniği</dt>
                    <dd className="text-black">{(product as any).print_method || 'Giclée (Arşivsel Pigment)'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Çerçeve</dt>
                    <dd className="text-black">Masif Ahşap</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Cam</dt>
                    <dd className="text-black">Müze Camı (UV Korumalı)</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={product.photos?.url || ''}
        title={product.title}
      />

      {/* Room Preview Modal */}
      <RoomPreview
        isOpen={roomPreviewOpen}
        onClose={() => setRoomPreviewOpen(false)}
        imageUrl={product.photos?.url || ''}
        frameColor={selectedFrame.color}
        size={selectedSize}
      />

      <Footer settings={settings} />
    </main>
  );
}
