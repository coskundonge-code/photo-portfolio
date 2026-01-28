'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPhotos, getProducts, getProjects } from '@/lib/supabase';
import { Photo, Product, Project } from '@/lib/types';
import { Loader2, ArrowLeft, ShoppingBag, Check } from 'lucide-react';

const sizeOptions = [
  { id: 'small', label: '30x40 cm', price: 0 },
  { id: 'medium', label: '50x70 cm', price: 1500 },
  { id: 'large', label: '70x100 cm', price: 3000 },
];

const frameOptions = [
  { id: 'black', label: 'Siyah', color: '#1a1a1a' },
  { id: 'white', label: 'Beyaz', color: '#f5f5f5' },
  { id: 'natural', label: 'Doğal Ahşap', color: '#8B7355' },
];

export default function ShopDetailPage() {
  const params = useParams();
  const photoId = params?.id as string;

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState('small');
  const [selectedFrame, setSelectedFrame] = useState('black');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [photosData, productsData, projectsData] = await Promise.all([
          getPhotos(),
          getProducts(),
          getProjects()
        ]);
        
        const foundPhoto = photosData.find(p => p.id === photoId);
        const foundProduct = productsData.find(p => p.photo_id === photoId);
        
        if (foundPhoto) {
          setPhoto(foundPhoto);
          const foundProject = projectsData.find(p => p.id === foundPhoto.project_id);
          setProject(foundProject || null);
        }
        
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    
    loadData();
  }, [photoId]);

  const calculatePrice = () => {
    const basePrice = (product as any)?.price || 2950;
    const sizePrice = sizeOptions.find(s => s.id === selectedSize)?.price || 0;
    return basePrice + sizePrice;
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = {
      id: `${photoId}-${selectedSize}-${selectedFrame}`,
      photoId,
      photoUrl: photo?.url,
      title: photo?.title || product?.title || 'İsimsiz',
      size: selectedSize,
      sizeLabel: sizeOptions.find(s => s.id === selectedSize)?.label,
      frame: selectedFrame,
      frameLabel: frameOptions.find(f => f.id === selectedFrame)?.label,
      price: calculatePrice(),
      quantity: 1,
    };
    
    const existingIndex = cart.findIndex((i: any) => i.id === item.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <p className="text-neutral-500 mb-4">Fotoğraf bulunamadı</p>
        <Link href="/shop" className="text-blue-500 hover:underline">
          Mağazaya Dön
        </Link>
      </div>
    );
  }

  const isPortrait = (photo as any).orientation === 'portrait';
  const frameColor = frameOptions.find(f => f.id === selectedFrame)?.color || '#1a1a1a';

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        
        {/* Geri Butonu */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Mağazaya Dön
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Sol: Fotoğraf Önizleme */}
          <div>
            {/* Ana Çerçeve Görseli */}
            <div className="bg-neutral-100 flex items-center justify-center p-8 lg:p-12 rounded-lg">
              
              {/* Çerçeve - States Gallery Stili */}
              <div 
                className="relative"
                style={{
                  padding: '10px',
                  backgroundColor: frameColor,
                  boxShadow: `
                    inset 2px 2px 0 0 rgba(255,255,255,0.15),
                    inset -2px -2px 0 0 rgba(0,0,0,0.2),
                    0 30px 60px -15px rgba(0,0,0,0.4),
                    0 15px 30px -10px rgba(0,0,0,0.25)
                  `,
                }}
              >
                {/* Beyaz Passepartout */}
                <div 
                  style={{
                    padding: isPortrait ? '28px 22px' : '22px 28px',
                    backgroundColor: '#fafafa',
                    boxShadow: `
                      inset 1px 1px 0 0 rgba(0,0,0,0.06),
                      inset -1px -1px 0 0 rgba(255,255,255,0.95),
                      inset 3px 3px 6px 0 rgba(0,0,0,0.03)
                    `,
                  }}
                >
                  {/* Fotoğraf */}
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      width: isPortrait ? '280px' : '380px',
                      height: isPortrait ? '380px' : '280px',
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.title || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Alt Gölge */}
              <div 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-6"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
                  filter: 'blur(5px)',
                }}
              />
            </div>
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div>
            {/* Sanatçı / Proje */}
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">
              {project?.title || 'Coşkun Dönge'}
            </p>

            {/* Başlık */}
            <h1 className="text-3xl lg:text-4xl font-light mb-4">
              {photo.title || product?.title || 'İsimsiz'}
            </h1>

            {/* Fiyat */}
            <p className="text-2xl font-semibold mb-6">
              ₺{calculatePrice().toLocaleString('tr-TR')}
            </p>

            {/* Açıklama */}
            {product?.description && (
              <p className="text-neutral-600 mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Boyut Seçimi */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Boyut</h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-4 py-3 border rounded-lg transition-all ${
                      selectedSize === size.id
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <span className="block text-sm font-medium">{size.label}</span>
                    {size.price > 0 && (
                      <span className="block text-xs opacity-70">+₺{size.price.toLocaleString('tr-TR')}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Çerçeve Seçimi */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3">Çerçeve</h3>
              <div className="flex gap-3">
                {frameOptions.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`flex flex-col items-center gap-2 p-3 border rounded-lg transition-all ${
                      selectedFrame === frame.id
                        ? 'border-black ring-1 ring-black'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded border border-neutral-200"
                      style={{ backgroundColor: frame.color }}
                    />
                    <span className="text-xs">{frame.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sepete Ekle */}
            <button
              onClick={addToCart}
              disabled={addedToCart}
              className={`w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-black hover:bg-neutral-800 text-white'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Sepete Eklendi!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Sepete Ekle
                </>
              )}
            </button>

            {/* Ürün Detayları */}
            <div className="mt-10 pt-8 border-t border-neutral-200">
              <h3 className="text-sm font-medium mb-4">Ürün Detayları</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>• Müze kalitesinde Giclée baskı</li>
                <li>• Premium artist-grade kağıt</li>
                <li>• Tru Vue Museum cam</li>
                <li>• El yapımı çerçeve</li>
                <li>• Asılmaya hazır teslim</li>
                <li>• Sertifikalı orijinallik belgesi</li>
              </ul>
            </div>

            {/* Kargo Bilgisi */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-600">
                🚚 Ücretsiz kargo (2-3 iş günü) • 14 gün iade garantisi
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
