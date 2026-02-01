'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, ZoomIn } from 'lucide-react';

// Boyutlar
const defaultSizes = [
  { id: 'classic', name: 'Classic', dimensions: '20×30 cm', price: 1500, scale: 0.5 },
  { id: 'medium', name: 'Medium', dimensions: '40×60 cm', price: 2500, scale: 0.65 },
  { id: 'large', name: 'Large', dimensions: '60×90 cm', price: 3500, scale: 0.8 },
  { id: 'luxe', name: 'Luxe', dimensions: '100×150 cm', price: 5000, scale: 1 },
];

// Çerçeve renkleri - States Gallery tarzı
const defaultFrames = [
  {
    id: 'black',
    name: 'Black',
    color: '#1a1a1a',
    buttonColor: '#1a1a1a',
    buttonBorder: 'none',
    price: 0
  },
  {
    id: 'white',
    name: 'White',
    color: '#ffffff',
    buttonColor: 'transparent',
    buttonBorder: '1px solid #c0c0c0',
    price: 0
  },
  {
    id: 'oak',
    name: 'Oak',
    color: '#c9a66b',
    buttonColor: '#c9a66b',
    buttonBorder: 'none',
    price: 200
  },
  {
    id: 'walnut',
    name: 'Walnut',
    color: '#6d4c3d',
    buttonColor: '#6d4c3d',
    buttonBorder: 'none',
    price: 200
  },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

// Çerçeve dokusu stilleri - States Gallery tarzı gerçekçi ahşap
const getFrameStyle = (frameId: string) => {
  switch (frameId) {
    case 'black':
      return {
        background: '#1a1a1a',
      };
    case 'white':
      return {
        background: '#ffffff',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
      };
    case 'oak':
      return {
        backgroundColor: '#c9a66b',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.15'%3E%3Cpath fill='%23000' d='M0 0h10v2H0zM20 0h15v1H20zM45 0h5v3h-5zM60 0h20v1H60zM90 0h10v2H90z'/%3E%3Cpath fill='%23fff' d='M5 5h8v1H5zM25 4h10v2H25zM50 3h8v2h-8zM70 5h15v1H70z'/%3E%3Cpath fill='%23000' d='M0 10h12v1H0zM30 8h20v2H30zM65 10h25v1H65z'/%3E%3Cpath fill='%23fff' d='M10 15h15v1H10zM40 12h10v2H40zM75 14h20v1H75z'/%3E%3Cpath fill='%23000' d='M0 20h8v2H0zM20 18h25v1H20zM55 20h30v1H55z'/%3E%3Cpath fill='%23fff' d='M5 25h20v1H5zM45 22h15v2H45zM80 24h15v1H80z'/%3E%3Cpath fill='%23000' d='M0 30h15v1H0zM25 28h20v2H25zM60 30h25v1H60z'/%3E%3Cpath fill='%23fff' d='M10 35h12v1H10zM35 32h18v2H35zM70 34h20v1H70z'/%3E%3Cpath fill='%23000' d='M0 40h20v1H0zM30 38h15v2H30zM55 40h35v1H55z'/%3E%3Cpath fill='%23fff' d='M8 45h15v1H8zM40 42h20v2H40zM75 44h18v1H75z'/%3E%3Cpath fill='%23000' d='M0 50h10v2H0zM22 48h25v1H22zM60 50h30v1H60z'/%3E%3Cpath fill='%23fff' d='M5 55h18v1H5zM35 52h15v2H35zM70 54h25v1H70z'/%3E%3Cpath fill='%23000' d='M0 60h25v1H0zM40 58h20v2H40zM75 60h20v1H75z'/%3E%3Cpath fill='%23fff' d='M12 65h15v1H12zM50 62h18v2H50zM82 64h15v1H82z'/%3E%3Cpath fill='%23000' d='M0 70h18v1H0zM28 68h22v2H28zM65 70h28v1H65z'/%3E%3Cpath fill='%23fff' d='M8 75h20v1H8zM42 72h15v2H42zM78 74h18v1H78z'/%3E%3Cpath fill='%23000' d='M0 80h12v2H0zM20 78h30v1H20zM58 80h35v1H58z'/%3E%3Cpath fill='%23fff' d='M5 85h22v1H5zM38 82h20v2H38zM72 84h22v1H72z'/%3E%3Cpath fill='%23000' d='M0 90h15v1H0zM25 88h18v2H25zM55 90h40v1H55z'/%3E%3Cpath fill='%23fff' d='M10 95h18v1H10zM45 92h15v2H45zM80 94h15v1H80z'/%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundSize: '100px 100px',
      };
    case 'walnut':
      return {
        backgroundColor: '#6d4c3d',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.2'%3E%3Cpath fill='%23000' d='M0 0h8v3H0zM15 0h20v2H15zM42 0h8v3h-8zM58 0h25v2H58zM92 0h8v3H92z'/%3E%3Cpath fill='%23fff' d='M3 6h12v1H3zM22 5h18v2H22zM48 6h12v1H48zM68 5h20v2H68z'/%3E%3Cpath fill='%23000' d='M0 12h18v2H0zM25 10h22v3H25zM55 12h30v2H55z'/%3E%3Cpath fill='%23fff' d='M8 18h15v1H8zM35 16h15v2H35zM65 18h25v1H65z'/%3E%3Cpath fill='%23000' d='M0 24h12v3H0zM18 22h28v2H18zM52 24h38v2H52z'/%3E%3Cpath fill='%23fff' d='M5 30h22v1H5zM32 28h20v2H32zM70 30h22v1H70z'/%3E%3Cpath fill='%23000' d='M0 36h20v2H0zM28 34h25v3H28zM60 36h32v2H60z'/%3E%3Cpath fill='%23fff' d='M10 42h18v1H10zM38 40h18v2H38zM72 42h20v1H72z'/%3E%3Cpath fill='%23000' d='M0 48h15v3H0zM22 46h30v2H22zM58 48h35v2H58z'/%3E%3Cpath fill='%23fff' d='M6 54h20v1H6zM40 52h15v2H40zM68 54h25v1H68z'/%3E%3Cpath fill='%23000' d='M0 60h22v2H0zM30 58h22v3H30zM60 60h30v2H60z'/%3E%3Cpath fill='%23fff' d='M12 66h18v1H12zM42 64h15v2H42zM75 66h18v1H75z'/%3E%3Cpath fill='%23000' d='M0 72h18v3H0zM25 70h28v2H25zM62 72h32v2H62z'/%3E%3Cpath fill='%23fff' d='M8 78h22v1H8zM38 76h20v2H38zM78 78h18v1H78z'/%3E%3Cpath fill='%23000' d='M0 84h15v2H0zM22 82h25v3H22zM55 84h38v2H55z'/%3E%3Cpath fill='%23fff' d='M5 90h20v1H5zM35 88h18v2H35zM70 90h25v1H70z'/%3E%3Cpath fill='%23000' d='M0 96h12v3H0zM20 94h28v2H20zM58 96h35v2H58z'/%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundSize: '100px 100px',
      };
    default:
      return { background: '#1a1a1a' };
  }
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
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
          <h1 className="text-2xl">Ürün bulunamadı</h1>
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
                  {/* ===== ÇERÇEVE - States Gallery tarzı ===== */}
                  <div
                    style={{
                      ...getFrameStyle(selectedFrame.id),
                      padding: '18px',
                      position: 'relative',
                      boxShadow: `
                        0 30px 60px -20px rgba(0,0,0,0.35),
                        0 15px 30px -15px rgba(0,0,0,0.25),
                        inset 0 2px 0 0 rgba(255,255,255,0.15),
                        inset 0 -2px 0 0 rgba(0,0,0,0.2),
                        inset 2px 0 0 0 rgba(255,255,255,0.1),
                        inset -2px 0 0 0 rgba(0,0,0,0.15)
                      `
                    }}
                  >
                    {/* İç çerçeve çizgisi */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: '6px',
                        border: selectedFrame.id === 'white' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.15)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* ===== PASSEPARTOUT / MAT ===== */}
                    <div 
                      style={{ 
                        background: selectedStyle === 'mat' ? '#ffffff' : 'transparent',
                        padding: selectedStyle === 'mat' 
                          ? (isPortrait ? '50px 40px' : '40px 50px') 
                          : '0',
                        position: 'relative',
                        boxShadow: selectedStyle === 'mat' 
                          ? 'inset 0 0 30px rgba(0,0,0,0.03)' 
                          : 'none'
                      }}
                    >
                      {/* V-Groove */}
                      {selectedStyle === 'mat' && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: isPortrait ? '45px' : '35px',
                            left: isPortrait ? '35px' : '45px',
                            right: isPortrait ? '35px' : '45px',
                            bottom: isPortrait ? '45px' : '35px',
                            boxShadow: `
                              inset 1px 1px 0 0 rgba(0,0,0,0.06),
                              inset -1px -1px 0 0 rgba(255,255,255,0.8)
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

            {/* Sağ: Ürün Detayları - States Gallery Tarzı */}
            <div className="lg:w-[45%]">
              {/* Başlık */}
              <h1 className="text-3xl font-bold tracking-tight mb-3">{product.title.toUpperCase()}</h1>

              {/* Edisyon Badge */}
              <div className="inline-block bg-black text-white text-[11px] px-3 py-1.5 mb-4 tracking-wider">
                {product.edition_type === 'limited'
                  ? `SINIRLI EDİSYON`
                  : 'AÇIK EDİSYON'}
              </div>

              {/* Fiyat */}
              <div className="mb-6">
                <p className="text-2xl font-normal">₺{formatPrice(calculatePrice())},00</p>
                <p className="text-sm text-neutral-500 mt-1">
                  KDV dahil. <span className="underline cursor-pointer">Kargo</span> ödeme sırasında hesaplanır.
                </p>
              </div>

              {/* Stil Seçimi */}
              <div className="mb-6 pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 mb-3">
                  Stil Seçin: <span className="text-black">{selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</span>
                </p>
                <div className="flex gap-0">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-8 py-2.5 text-sm border transition-colors ${
                      selectedStyle === 'mat'
                        ? 'border-black bg-white'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    Mat
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-8 py-2.5 text-sm border-t border-b border-r transition-colors ${
                      selectedStyle === 'fullbleed'
                        ? 'border-black bg-white border-l'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    Full Bleed
                  </button>
                </div>
              </div>

              {/* Boyut Seçimi - States Gallery Tarzı */}
              <div className="mb-6">
                <p className="text-sm text-neutral-600 mb-3">
                  Çerçeve Boyutu Seçin: <span className="text-black">{selectedSize.name}</span>
                </p>
                <div className="border border-neutral-200">
                  {defaultSizes.map((size, index) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors relative ${
                        index !== 0 ? 'border-t border-neutral-200' : ''
                      } ${selectedSize.id === size.id ? 'bg-white' : 'hover:bg-neutral-50'}`}
                    >
                      {/* Sol kenar çizgisi - seçili için */}
                      {selectedSize.id === size.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
                      )}
                      <span className={selectedSize.id === size.id ? 'font-medium' : ''}>{size.name}</span>
                      <span className="text-neutral-500">{size.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Rengi - States Gallery Tarzı */}
              <div className="mb-8">
                <p className="text-sm text-neutral-600 mb-3">
                  Çerçeve Rengi Seçin: <span className="text-black">{selectedFrame.name}</span>
                </p>
                <div className="flex gap-3">
                  {defaultFrames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedFrame.id === frame.id
                          ? 'ring-2 ring-offset-2 ring-black'
                          : ''
                      }`}
                      style={{
                        backgroundColor: frame.buttonColor,
                        border: frame.buttonBorder,
                        backgroundImage: frame.id === 'oak'
                          ? 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)'
                          : frame.id === 'walnut'
                          ? 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)'
                          : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Guide Link - States Gallery Tarzı */}
              <button className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black mb-8">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 21H3M21 21V3M21 21L3 3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="underline underline-offset-4">Boyut Rehberi</span>
              </button>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white text-sm tracking-wider hover:bg-neutral-800 transition-colors"
              >
                SEPETE EKLE
              </button>

              {/* Ürün Bilgileri */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-medium mb-3 tracking-wide">KALİTE KORUMASI</h3>
                <p className="text-sm text-neutral-500 mb-8">
                  Kendi bünyemizde yapılan baskı ve çerçeveleme sürecimiz, en yüksek müze kalitesinde çerçeveli parçalar üretir.
                </p>

                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">BASKI KALİTESİ</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Resimlerimizi bastığımız kağıt, mümkün olan en iyi görüntü kalitesini sunan gümüş halojenür fotoğraf substratıdır.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">MALZEME ÖNEMLİ</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Müze camı gibi müze kalitesinde malzemeler kullanan ikonik çerçeveleme, parçanın korunmasını sağlar.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">SERTİFİKA</h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Her parça, sanatçı tarafından imzalanmış bir orijinallik sertifikası içerir.
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
                  ...getFrameStyle(selectedFrame.id),
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
                <p>Stil Seçin: {selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</p>
                <p>Çerçeve Boyutu: {selectedSize.name}</p>
                <p>Çerçeve Rengi: {selectedFrame.name}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-medium">₺{formatPrice(calculatePrice())},00</span>
                <button 
                  onClick={scrollToTop}
                  className="text-xs text-neutral-500 hover:text-black underline underline-offset-2"
                >
                  Değiştir
                </button>
              </div>
            </div>
          </div>
          
          {/* Sepete Ekle Butonu */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Sepete Ekle
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
