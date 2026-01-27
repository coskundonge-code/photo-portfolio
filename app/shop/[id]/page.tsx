'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

// Boyut seçenekleri
const sizes = [
  { id: 'small', label: 'Small', dimensions: '30 × 40 cm', priceMultiplier: 1 },
  { id: 'medium', label: 'Medium', dimensions: '50 × 70 cm', priceMultiplier: 1.8 },
  { id: 'large', label: 'Large', dimensions: '70 × 100 cm', priceMultiplier: 2.5 },
  { id: 'xlarge', label: 'X-Large', dimensions: '100 × 140 cm', priceMultiplier: 3.5 },
];

// Çerçeve seçenekleri
const frames = [
  { id: 'none', label: 'No Frame', color: 'transparent', price: 0 },
  { id: 'black', label: 'Black', color: '#1a1a1a', price: 500 },
  { id: 'white', label: 'White', color: '#ffffff', price: 500 },
  { id: 'natural', label: 'Natural Oak', color: '#c4a574', price: 700 },
  { id: 'walnut', label: 'Walnut', color: '#5c4033', price: 700 },
];

export default function ProductPage() {
  const params = useParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState(sizes[1]); // Default: Medium
  const [selectedFrame, setSelectedFrame] = useState(frames[1]); // Default: Black
  const [quantity, setQuantity] = useState(1);

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
    toast.success('Added to cart!');
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
            
            {/* Left: Product Preview with Frame */}
            <div className="relative">
              <div className="sticky top-28">
                {/* Wall background */}
                <div className="bg-neutral-100 p-12 lg:p-16 rounded-lg">
                  {/* Frame Preview */}
                  <div className="relative max-w-md mx-auto">
                    {/* Outer frame */}
                    <div 
                      className="relative p-3 shadow-2xl transition-all duration-300"
                      style={{ 
                        backgroundColor: selectedFrame.id === 'none' ? 'transparent' : selectedFrame.color,
                        boxShadow: selectedFrame.id === 'none' ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      {/* Mat / Passepartout */}
                      <div 
                        className={`${selectedFrame.id === 'none' ? '' : 'bg-white p-6'} transition-all duration-300`}
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={product.photos?.url || 'https://via.placeholder.com/800'}
                            alt={product.title}
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Shadow under frame */}
                    {selectedFrame.id !== 'none' && (
                      <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/10 blur-xl -z-10" />
                    )}
                  </div>
                  
                  {/* Size indicator */}
                  <p className="text-center text-sm text-neutral-400 mt-8">
                    {selectedSize.dimensions}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Product Options */}
            <div className="lg:pt-4">
              {/* Title & Price */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-light text-black mb-2">
                  {product.title}
                </h1>
                <p className="text-neutral-500">
                  {product.edition_type === 'limited' 
                    ? `Limited Edition of ${product.edition_total} — ${(product.edition_total || 0) - (product.edition_sold || 0)} remaining`
                    : 'Open Edition'}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <p className="text-3xl font-medium text-black">
                  ₺{calculatePrice().toLocaleString()}
                </p>
                <p className="text-sm text-neutral-400 mt-1">Tax included. Shipping calculated at checkout.</p>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-4">SIZE</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 border rounded-lg text-left transition-all ${
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

              {/* Frame Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-black mb-4">FRAME</h3>
                <div className="flex flex-wrap gap-3">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative flex items-center gap-3 px-4 py-3 border rounded-lg transition-all ${
                        selectedFrame.id === frame.id
                          ? 'border-black'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {/* Frame color swatch */}
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
                        <span className="text-xs text-neutral-400">+₺{frame.price}</span>
                      )}
                      {selectedFrame.id === frame.id && (
                        <Check className="w-4 h-4 text-black absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Add to Cart — ₺{calculatePrice().toLocaleString()}
              </button>

              {/* Product Info */}
              <div className="mt-10 pt-8 border-t border-neutral-200 space-y-6">
                <div className="flex items-start gap-4">
                  <Truck className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Free Shipping</h4>
                    <p className="text-sm text-neutral-500">Delivery in 5-7 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Quality Guarantee</h4>
                    <p className="text-sm text-neutral-500">Museum-quality archival prints</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RotateCcw className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black">Easy Returns</h4>
                    <p className="text-sm text-neutral-500">30-day money-back guarantee</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <h3 className="font-medium text-black mb-4">About this print</h3>
                  <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Specifications */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="font-medium text-black mb-4">Specifications</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Paper</dt>
                    <dd className="text-black">Hahnemühle Photo Rag 308gsm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Print Method</dt>
                    <dd className="text-black">Giclée (Archival Pigment)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Frame Material</dt>
                    <dd className="text-black">Solid Wood</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Glazing</dt>
                    <dd className="text-black">Museum Glass (UV Protection)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Mounting</dt>
                    <dd className="text-black">Acid-free Mat Board</dd>
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
