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
import { Loader2, Check, ZoomIn, ArrowLeft, ShoppingBag } from 'lucide-react';

// Yeni boyutlar - States Gallery tarzı
const defaultSizes = [
  { id: 'classic', name: 'Classic', dimensions: '42x32cm', price: 1500, scale: 0.6 },
  { id: 'medium', name: 'Medium', dimensions: '57x42cm', price: 2500, scale: 0.75 },
  { id: 'large', name: 'Large', dimensions: '72x52cm', price: 3500, scale: 0.9 },
  { id: 'luxe', name: 'Luxe', dimensions: '87x62cm', price: 4500, scale: 1 },
];

// Çerçeve renkleri - ahşap dokulu
const defaultFrames = [
  { id: 'black', name: 'Black', color: '#1a1a1a', texture: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)' },
  { id: 'white', name: 'White', color: '#f5f5f5', texture: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)' },
  { id: 'natural', name: 'Natural Oak', color: '#c4a574', texture: 'linear-gradient(135deg, #d4b584 0%, #c4a574 25%, #b49564 50%, #a48554 75%, #c4a574 100%)' },
  { id: 'walnut', name: 'Walnut', color: '#5c4033', texture: 'linear-gradient(135deg, #6c5043 0%, #5c4033 25%, #4c3023 50%, #5c4033 75%, #6c5043 100%)' },
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
  const [selectedSize, setSelectedSize] = useState(defaultSizes[0]);
  const [selectedFrame, setSelectedFrame] = useState(defaultFrames[0]);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [roomPreviewOpen, setRoomPreviewOpen] = useState(false);
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
      const scrollY = window.scrollY;
      setShowFloatingCart(scrollY > 400);
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
  
  // Büyük fotoğraf boyutları
  const basePhotoWidth = isPortrait ? 320 : 450;
  const basePhotoHeight = isPortrait ? 450 : 320;

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
            <span>Back to Shop</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Sol: Çerçeveli Fotoğraf - STICKY */}
            <div className="lg:w-[55%] lg:sticky lg:top-28 lg:self-start">
              <div 
                className="flex items-center justify-center cursor-pointer relative group py-8"
                onClick={() => setLightboxOpen(true)}
              >
                {/* Zoom icon */}
                <div className="absolute top-4 right-4 p-2 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <ZoomIn className="w-5 h-5 text-neutral-600" />
                </div>

                {/* Çerçeve + Fotoğraf - Smooth scale animasyonu */}
                <div 
                  className="relative transition-all duration-700 ease-out"
                  style={{ transform: `scale(${selectedSize.scale})` }}
                >
                  {/* ===== ÇERÇEVE - Ahşap dokulu ===== */}
                  <div 
                    style={{
                      background: selectedFrame.texture,
                      padding: '16px',
                      position: 'relative',
                      boxShadow: `
                        0 25px 60px -15px rgba(0,0,0,0.3),
                        0 10px 20px -10px rgba(0,0,0,0.2),
                        inset 0 1px 0 0 rgba(255,255,255,0.1),
                        inset 0 -1px 0 0 rgba(0,0,0,0.2)
                      `
                    }}
                  >
                    {/* İç çerçeve detayı */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: '4px',
                        border: selectedFrame.id === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* ===== PASSEPARTOUT / MAT ===== */}
                    <div 
                      style={{ 
                        background: selectedStyle === 'mat' ? '#ffffff' : 'transparent',
                        padding: selectedStyle === 'mat' 
                          ? (isPortrait ? '45px 35px' : '35px 45px') 
                          : '0',
                        position: 'relative',
                        boxShadow: selectedStyle === 'mat' 
                          ? 'inset 0 0 20px rgba(0,0,0,0.03), inset 0 0 1px rgba(0,0,0,0.1)' 
                          : 'none'
                      }}
                    >
                      {/* V-Groove */}
                      {selectedStyle === 'mat' && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: isPortrait ? '40px' : '30px',
                            left: isPortrait ? '30px' : '40px',
                            right: isPortrait ? '30px' : '40px',
                            bottom: isPortrait ? '40px' : '30px',
                            boxShadow: `
                              inset 1px 1px 0 0 rgba(0,0,0,0.08),
                              inset -1px -1px 0 0 rgba(255,255,255,0.9)
                            `,
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                      
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

                  {/* Gölge */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-25px',
                      left: '5%',
                      right: '5%',
                      height: '30px',
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      zIndex: -1
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sağ: Ürün Detayları */}
            <div className="lg:w-[45%]">
              <h1 className="text-3xl lg:text-4xl font-light mb-3 tracking-wide">
                {product.title.toUpperCase()}
              </h1>
              
              <p className="text-neutral-500 mb-6 text-sm">
                {product.edition_type === 'limited' 
                  ? `Limited Edition • ${product.edition_total} pieces`
                  : 'Open Edition'}
              </p>

              <div className="mb-10">
                <p className="text-3xl font-light">€{formatPrice(calculatePrice())}</p>
                <p className="text-xs text-neutral-400 mt-1">Tax included</p>
              </div>

              {/* Stil Seçimi */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  Choose Your Style: <span className="text-black">{selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-8 py-3 text-sm transition-all duration-300 ${
                      selectedStyle === 'mat' 
                        ? 'bg-black text-white' 
                        : 'bg-transparent text-black border border-neutral-200 hover:border-black'
                    }`}
                  >
                    Mat
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-8 py-3 text-sm transition-all duration-300 ${
                      selectedStyle === 'fullbleed' 
                        ? 'bg-black text-white' 
                        : 'bg-transparent text-black border border-neutral-200 hover:border-black'
                    }`}
                  >
                    Full Bleed
                  </button>
                </div>
              </div>

              {/* Boyut Seçimi */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  Choose Your Frame Size: <span className="text-black">{selectedSize.name}</span>
                </h3>
                <div className="space-y-2">
                  {defaultSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-300 ${
                        selectedSize.id === size.id 
                          ? 'border-2 border-black' 
                          : 'border border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="font-medium">{size.name}</span>
                      <span className="text-neutral-500">{size.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Rengi */}
              <div className="mb-10">
                <h3 className="text-sm text-neutral-600 mb-4">
                  Choose Your Frame Color: <span className="text-black">{selectedFrame.name}</span>
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
                        background: frame.texture,
                        border: frame.id === 'white' ? '1px solid #e0e0e0' : 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {selectedFrame.id === frame.id && (
                        <Check className={`absolute inset-0 m-auto w-5 h-5 ${
                          frame.id === 'white' ? 'text-black' : 'text-white'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                className="w-full py-5 bg-black text-white text-sm tracking-widest hover:bg-neutral-800 transition-all duration-300 mb-4"
              >
                ADD TO CART
              </button>

              <button 
                onClick={() => setRoomPreviewOpen(true)}
                className="w-full py-4 text-sm text-neutral-600 hover:text-black transition-colors underline"
              >
                View in your room
              </button>

              {/* Ürün Bilgileri */}
              <div className="mt-12 pt-8 border-t border-neutral-100">
                <h3 className="font-medium mb-6 text-lg">QUALITY PRESERVED</h3>
                
                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">PRINT QUALITY</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      The paper we print our images on is a silver halide photographic substrate that offers the best possible image quality.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">MATERIALS MATTER</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Iconic framing using museum-quality materials like museum glass ensures the preservation of the piece.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">CERTIFICATE</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Every piece includes a certificate of authenticity signed by the artist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Add to Cart - Scroll sonrası görünür */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-4 px-6 z-40 transition-all duration-500 ${
          showFloatingCart ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative">
              {product.photos?.url && (
                <Image
                  src={product.photos.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{product.title.toUpperCase()}</p>
              <p className="text-xs text-neutral-500">
                {selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'} • {selectedSize.name} • {selectedFrame.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-lg font-light">€{formatPrice(calculatePrice())}</span>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-8 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to cart
            </button>
          </div>
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
