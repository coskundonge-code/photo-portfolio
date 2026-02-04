'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { useLanguage } from '@/lib/language';
import { Loader2, Check, ZoomIn } from 'lucide-react';

// Boyutlar
const defaultSizes = [
  { id: 'classic', name: 'Classic', dimensions: '30x20cm', price: 1500, scale: 0.55 },
  { id: 'medium', name: 'Medium', dimensions: '45x30cm', price: 2500, scale: 0.7 },
  { id: 'large', name: 'Large', dimensions: '60x40cm', price: 3500, scale: 0.85 },
  { id: 'luxe', name: 'Luxe', dimensions: '75x50cm', price: 4500, scale: 1 },
];

// Çerçeve renkleri - gerçek ahşap dokuları
const defaultFrames = [
  { 
    id: 'black', 
    name: 'Black', 
    color: '#1a1a1a', 
    texture: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 20%, #1a1a1a 50%, #0a0a0a 80%, #1a1a1a 100%)',
    buttonTexture: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)',
    price: 0 
  },
  { 
    id: 'white', 
    name: 'White', 
    color: '#f8f8f8', 
    texture: 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 20%, #f0f0f0 50%, #e8e8e8 80%, #f5f5f5 100%)',
    buttonTexture: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
    price: 0 
  },
  { 
    id: 'oak', 
    name: 'Oak', 
    color: '#c9a66b', 
    texture: `repeating-linear-gradient(
      90deg,
      #d4b07a 0px,
      #c9a66b 2px,
      #be9c5c 4px,
      #c9a66b 6px,
      #d4b07a 8px
    ), linear-gradient(180deg, #d4b07a 0%, #c9a66b 50%, #be9c5c 100%)`,
    buttonTexture: `repeating-linear-gradient(
      120deg,
      #d4b07a 0px,
      #c9a66b 3px,
      #be9c5c 6px
    )`,
    price: 200 
  },
  { 
    id: 'walnut', 
    name: 'Walnut', 
    color: '#5d4037', 
    texture: `repeating-linear-gradient(
      90deg,
      #6d5047 0px,
      #5d4037 2px,
      #4d3027 4px,
      #5d4037 6px,
      #6d5047 8px
    ), linear-gradient(180deg, #6d5047 0%, #5d4037 50%, #4d3027 100%)`,
    buttonTexture: `repeating-linear-gradient(
      120deg,
      #6d5047 0px,
      #5d4037 3px,
      #4d3027 6px
    )`,
    price: 200 
  },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedStyle, setSelectedStyle] = useState<'mat' | 'fullbleed'>('mat');
  const [selectedSize, setSelectedSize] = useState(defaultSizes[3]); // Luxe - en büyük
  const [selectedFrame, setSelectedFrame] = useState(defaultFrames[0]);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);

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

  // Floating cart gösterme
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCart(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  
  // Fotoğraf boyutları
  const basePhotoWidth = isPortrait ? 340 : 480;
  const basePhotoHeight = isPortrait ? 480 : 340;

  const calculatePrice = () => {
    return (selectedSize.price || product?.base_price || 0) + (selectedFrame.price || 0);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="text-2xl">{t('product.productNotFound')}</h1>
        </div>
        <Footer settings={settings} />
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Sol: Çerçeveli Fotoğraf - STICKY */}
            <div className="lg:w-[55%] lg:sticky lg:top-28 lg:self-start">
              <div 
                className="flex items-center justify-center cursor-pointer relative group"
                style={{ minHeight: '500px' }}
                onClick={() => setLightboxOpen(true)}
              >
                {/* Zoom icon */}
                <div className="absolute top-4 right-4 p-3 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg">
                  <ZoomIn className="w-5 h-5 text-neutral-700" />
                </div>

                {/* Çerçeve + Fotoğraf */}
                <div
                  className="relative transition-all duration-700 ease-out"
                  style={{ transform: `scale(${selectedSize.scale})` }}
                >
                  {/* ===== ÇERÇEVE - Ana sayfa ile aynı yapı ===== */}
                  <div
                    style={{
                      background: selectedFrame.texture,
                      padding: '12px',
                      boxShadow: '6px 6px 20px rgba(0,0,0,0.35), 3px 3px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* ===== PASSEPARTOUT / MAT ===== */}
                    <div
                      style={{
                        background: selectedStyle === 'mat' ? '#ffffff' : 'transparent',
                        padding: selectedStyle === 'mat'
                          ? (isPortrait ? '50px 40px' : '40px 50px')
                          : '0',
                        boxShadow: selectedStyle === 'mat'
                          ? 'inset 15px 15px 35px rgba(0,0,0,0.18), inset 5px 5px 15px rgba(0,0,0,0.12)'
                          : 'none'
                      }}
                    >
                      {/* V-groove - realistic bevel with depth */}
                      {selectedStyle === 'mat' ? (
                        <div
                          style={{
                            padding: '4px',
                            background: 'linear-gradient(145deg, #909090 0%, #b0b0b0 30%, #d0d0d0 70%, #e8e8e8 100%)',
                            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.6)'
                          }}
                        >
                          {/* Inner recessed area */}
                          <div
                            style={{
                              padding: '10px',
                              background: '#e8e8e8',
                              boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.15), inset 1px 1px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* ===== FOTOĞRAF ===== */}
                            <div
                              style={{
                                width: `${basePhotoWidth}px`,
                                height: `${basePhotoHeight}px`,
                                position: 'relative',
                                overflow: 'hidden',
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
                      ) : (
                        /* Full bleed - no V-groove */
                        <div
                          style={{
                            width: `${basePhotoWidth}px`,
                            height: `${basePhotoHeight}px`,
                            position: 'relative',
                            overflow: 'hidden',
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
                      )}
                    </div>
                  </div>

                  {/* Gölge */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '10%',
                      right: '10%',
                      height: '40px',
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)',
                      filter: 'blur(10px)',
                      zIndex: -1
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sağ: Ürün Detayları */}
            <div className="lg:w-[45%]">
              {/* Edisyon Badge */}
              <div className="inline-block bg-black text-white text-xs px-4 py-2 mb-4 tracking-wider">
                {product.edition_type === 'limited'
                  ? t('product.limitedEdition')
                  : t('product.openEdition')}
              </div>

              <div className="mb-8">
                <p className="text-3xl font-light">₺{formatPrice(calculatePrice())},00</p>
                <p className="text-sm text-neutral-500 mt-2">{t('product.vatIncluded')}</p>
              </div>

              {/* Stil Seçimi */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  {t('product.selectStyle')}: <span className="text-black font-medium">{selectedStyle === 'mat' ? t('product.mat') : t('product.fullBleed')}</span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-8 py-3 text-sm transition-all duration-300 border ${
                      selectedStyle === 'mat'
                        ? 'border-black bg-white'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {t('product.mat')}
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-8 py-3 text-sm transition-all duration-300 border ${
                      selectedStyle === 'fullbleed'
                        ? 'border-black bg-white'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {t('product.fullBleed')}
                  </button>
                </div>
              </div>

              {/* Boyut Seçimi */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  {t('product.selectFrameSize')}: <span className="text-black font-medium">{selectedSize.name}</span>
                </h3>
                <div className="space-y-2">
                  {defaultSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-300 border ${
                        selectedSize.id === size.id 
                          ? 'border-black' 
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="font-medium">{size.name}</span>
                      <span className="text-neutral-500">{size.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Rengi - Ahşap dokulu butonlar */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  {t('product.selectFrameColor')}: <span className="text-black font-medium">{selectedFrame.name}</span>
                </h3>
                <div className="flex gap-4">
                  {defaultFrames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative w-14 h-14 rounded-full transition-all duration-300 ${
                        selectedFrame.id === frame.id 
                          ? 'ring-2 ring-offset-4 ring-black scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        background: frame.buttonTexture,
                        border: frame.id === 'white' ? '1px solid #d0d0d0' : 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      {selectedFrame.id === frame.id && (
                        <Check className={`absolute inset-0 m-auto w-5 h-5 ${
                          frame.id === 'white' ? 'text-black' : 'text-white'
                        }`} strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Guide Link */}
              <button className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black mb-8 group">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="underline underline-offset-4">{t('product.sizeGuide')}</span>
              </button>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                className="w-full py-5 bg-black text-white text-sm tracking-widest hover:bg-neutral-800 transition-all duration-300"
              >
                {t('product.addToCart')}
              </button>

              {/* Ürün Bilgileri */}
              <div className="mt-16 pt-10 border-t border-neutral-200">
                <h3 className="text-2xl font-light mb-3 tracking-wide text-center">{t('product.qualityProtection')}</h3>
                <p className="text-sm text-neutral-500 text-center mb-10">
                  {t('product.qualityDesc')}
                </p>

                <div className="space-y-8 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 tracking-wide">{t('product.printQuality')}</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      {t('product.printQualityDesc')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 tracking-wide">{t('product.materialMatters')}</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      {t('product.materialDesc')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 tracking-wide">{t('product.certificate')}</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      {t('product.certificateDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Add to Cart - States Gallery tarzı */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          showFloatingCart ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden"
          style={{ 
            width: '380px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex">
            {/* 3D Çerçeve Önizleme */}
            <div className="w-24 h-28 relative bg-neutral-100 flex-shrink-0 flex items-center justify-center p-2">
              <div 
                style={{
                  background: selectedFrame.texture,
                  padding: '4px',
                  transform: 'perspective(200px) rotateY(-15deg)',
                  boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
                }}
              >
                <div className="w-14 h-16 relative bg-white p-1">
                  {product.photos?.url && (
                    <Image
                      src={product.photos.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Detaylar */}
            <div className="flex-1 p-4">
              <h4 className="font-medium text-sm mb-2">{product.title.toUpperCase()}</h4>
              <div className="text-xs text-neutral-500 space-y-0.5">
                <p>{t('product.selectStyle')}: {selectedStyle === 'mat' ? t('product.mat') : t('product.fullBleed')}</p>
                <p>{t('product.selectFrameSize').replace('Select ', '').replace('Seçin', '')}: {selectedSize.name}</p>
                <p>{t('product.selectFrameColor').replace('Select ', '').replace('Seçin', '')}: {selectedFrame.name}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-medium">₺{formatPrice(calculatePrice())},00</span>
                <button
                  onClick={scrollToTop}
                  className="text-xs text-neutral-500 hover:text-black underline underline-offset-2"
                >
                  {t('product.change')}
                </button>
              </div>
            </div>
          </div>

          {/* Sepete Ekle Butonu */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
          >
            {t('product.addToCart')}
          </button>
        </div>
      </div>

      <Footer settings={settings} />

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={product.photos?.url || ''}
        title={product.title}
      />
    </main>
  );
}
