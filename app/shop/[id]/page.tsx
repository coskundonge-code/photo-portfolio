'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProductById, getFrameOptions, getProductSizes } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, Ruler } from 'lucide-react';

// Varsayılan boyutlar (veritabanından gelmezse)
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

// Fiyat formatlama
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
  const [selectedSize, setSelectedSize] = useState(defaultSizes[1]); // Regular varsayılan
  const [selectedFrame, setSelectedFrame] = useState(defaultFrames[0]); // Siyah varsayılan
  
  // Boyut/Çerçeve seçenekleri (veritabanından)
  const [sizes, setSizes] = useState(defaultSizes);
  const [frames, setFrames] = useState(defaultFrames);

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
      
      // Ürüne özel boyutları yükle (varsa)
      // const productSizes = await getProductSizes(params.id as string);
      // if (productSizes.length > 0) setSizes(productSizes);
      
      // Çerçeve seçeneklerini yükle
      // const frameOptions = await getFrameOptions();
      // if (frameOptions.length > 0) setFrames(frameOptions);
      
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  // Fotoğraf orientation
  const getOrientation = () => {
    if (product?.photos?.width && product?.photos?.height) {
      return product.photos.width > product.photos.height ? 'landscape' : 'portrait';
    }
    return product?.photos?.orientation || 'landscape';
  };

  // Toplam fiyat hesaplama
  const calculatePrice = () => {
    const basePrice = selectedSize.price || product?.base_price || 0;
    const framePrice = selectedFrame.price || 0;
    return basePrice + framePrice;
  };

  // Sepete ekle
  const handleAddToCart = () => {
    // Sepet verilerini localStorage'a kaydet
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
    
    // Checkout sayfasına yönlendir
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

  const orientation = getOrientation();

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Sol: Ürün Önizleme - Boyut değiştikçe büyür/küçülür */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="bg-[#f5f5f5] rounded-lg flex items-center justify-center min-h-[500px] lg:min-h-[600px] p-8">
                  
                  {/* Çerçeve Önizleme - Scale ile boyut değişimi */}
                  <div 
                    className="relative transition-all duration-500 ease-out"
                    style={{ transform: `scale(${selectedSize.scale || 1})` }}
                  >
                    {/* Dış Çerçeve */}
                    <div 
                      className="relative p-[10px] transition-colors duration-300"
                      style={{ 
                        backgroundColor: selectedFrame.color,
                        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* İç Mat (sadece mat seçiliyse) */}
                      <div 
                        className={`transition-all duration-300 ${
                          selectedStyle === 'mat' ? 'bg-white p-6 lg:p-8' : ''
                        }`}
                      >
                        {/* 3D Derinlik Çizgisi */}
                        {selectedStyle === 'mat' && (
                          <div 
                            className="absolute inset-[22px] lg:inset-[30px] pointer-events-none"
                            style={{
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08), inset 0 2px 4px rgba(0,0,0,0.03)'
                            }}
                          />
                        )}
                        
                        {/* Fotoğraf */}
                        <div className={`relative overflow-hidden ${
                          orientation === 'portrait' 
                            ? 'aspect-[3/4] w-[220px] lg:w-[280px]' 
                            : 'aspect-[4/3] w-[300px] lg:w-[380px]'
                        }`}>
                          <Image
                            src={product.photos?.url || '/placeholder.jpg'}
                            alt={product.title}
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alt Gölge */}
                    <div 
                      className="absolute -bottom-4 left-[8%] right-[8%] h-8 -z-10"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)'
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
              <h1 className="text-2xl lg:text-3xl font-light text-black mb-2">
                {product.title}
              </h1>
              
              {/* Edisyon bilgisi */}
              <p className="text-neutral-500 mb-4">
                {product.edition_type === 'limited' 
                  ? `Sınırlı Sayıda ${product.edition_total} Adet — ${(product.edition_total || 0) - (product.edition_sold || 0)} kaldı`
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

              {/* Stil Seçimi: Mat / Full Bleed */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-3">
                  Stilinizi Seçin: <span className="font-normal text-neutral-500">{selectedStyle === 'mat' ? 'Mat' : 'Full Bleed'}</span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStyle('mat')}
                    className={`px-6 py-2.5 border rounded transition-all ${
                      selectedStyle === 'mat'
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    Mat
                  </button>
                  <button
                    onClick={() => setSelectedStyle('fullbleed')}
                    className={`px-6 py-2.5 border rounded transition-all ${
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
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                        selectedSize.id === size.id
                          ? 'border-black'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="font-medium">{size.name}</span>
                      <span className="text-neutral-500">{size.dimensions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Çerçeve Rengi Seçimi - Yuvarlak Küreler */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-3">
                  Çerçeve Rengi: <span className="font-normal text-neutral-500">{selectedFrame.name}</span>
                </h3>
                <div className="flex gap-3">
                  {frames.map((frame) => (
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

              {/* Sepete Ekle Butonu */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white font-medium rounded hover:bg-neutral-800 transition-colors mb-4"
              >
                Sepete Ekle — ₺{formatPrice(calculatePrice())}
              </button>

              {/* Odanda Görüntüle */}
              <button className="w-full py-4 bg-neutral-100 text-black font-medium rounded hover:bg-neutral-200 transition-colors mb-4">
                Odanda Görüntüle
              </button>

              {/* Hikaye / Açıklama */}
              {(product.description || product.story) && (
                <div className="mt-10 pt-8 border-t border-neutral-200">
                  <h3 className="font-medium text-black mb-4">Bu Eser Hakkında</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {product.story || product.description}
                  </p>
                </div>
              )}

              {/* Teknik Özellikler */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="font-medium text-black mb-4">Teknik Özellikler</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Kağıt</dt>
                    <dd className="text-black">{product.paper_type || 'Hahnemühle Photo Rag 308gsm'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Baskı Tekniği</dt>
                    <dd className="text-black">{product.print_method || 'Giclée (Arşivsel Pigment)'}</dd>
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
                    <dd className="text-black">Asitsiz Mat Board</dd>
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
