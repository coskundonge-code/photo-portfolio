'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, Shield, Truck, Award } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Product, Project } from '@/lib/types';
import toast from 'react-hot-toast';

// Demo data
const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
];

const demoProduct: Product = {
  id: '1',
  photo_id: '1',
  title: 'Mountain Vista',
  description: 'A breathtaking view of mountain peaks emerging through morning clouds. This photograph captures the raw majesty of nature at its finest, taken during golden hour when the light creates an ethereal atmosphere.',
  artist_name: 'Your Name',
  edition_type: 'collector',
  edition_size: 25,
  base_price: 895,
  sizes: [
    { id: '1', name: '30 × 40 cm', price_modifier: 0, frame_options: [] },
    { id: '2', name: '50 × 70 cm', price_modifier: 200, frame_options: [] },
    { id: '3', name: '70 × 100 cm', price_modifier: 450, frame_options: [] },
    { id: '4', name: '100 × 150 cm', price_modifier: 850, frame_options: [] },
  ],
  is_available: true,
  created_at: '',
  updated_at: '',
  photo: { 
    id: '1', 
    title: 'Mountain Vista', 
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', 
    order_index: 1, 
    created_at: '', 
    updated_at: '' 
  },
};

const frameOptions = [
  { id: 'none', name: 'Unframed', price: 0 },
  { id: 'black', name: 'Black Wood', price: 150 },
  { id: 'white', name: 'White Wood', price: 150 },
  { id: 'oak', name: 'Natural Oak', price: 200 },
  { id: 'walnut', name: 'Dark Walnut', price: 250 },
];

const paperOptions = [
  { id: 'hahnemuhle', name: 'Hahnemühle Photo Rag', price: 0 },
  { id: 'baryta', name: 'Baryta Fine Art', price: 50 },
  { id: 'metallic', name: 'Metallic Pearl', price: 75 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product>(demoProduct);
  const [selectedSize, setSelectedSize] = useState(demoProduct.sizes[0]);
  const [selectedFrame, setSelectedFrame] = useState(frameOptions[0]);
  const [selectedPaper, setSelectedPaper] = useState(paperOptions[0]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const totalPrice = product.base_price + 
    (selectedSize?.price_modifier || 0) + 
    selectedFrame.price + 
    selectedPaper.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    toast.success('Added to cart!');
    // TODO: Implement cart functionality
  };

  const handleInquiry = () => {
    window.location.href = `/contact?subject=Inquiry about ${product.title}`;
  };

  return (
    <main className="min-h-screen bg-primary">
      <Navigation projects={demoProjects} siteName="PORTFOLIO" />
      
      <section className="pt-28 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/shop"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Section */}
            <div className="space-y-4">
              <div className={`relative aspect-[4/5] bg-neutral-900 overflow-hidden ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-500`}>
                {product.photo && (
                  <Image
                    src={product.photo.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                    onLoad={() => setIsImageLoaded(true)}
                  />
                )}
                
                {/* Edition Badge */}
                {product.edition_type === 'collector' && (
                  <div className="absolute top-4 left-4 bg-accent text-primary text-xs uppercase tracking-wider px-3 py-1 font-medium">
                    Limited Edition · {product.edition_size} prints
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <Shield className="w-5 h-5 mx-auto text-neutral-500 mb-2" />
                  <p className="text-xs text-neutral-500">Secure Payment</p>
                </div>
                <div className="text-center">
                  <Truck className="w-5 h-5 mx-auto text-neutral-500 mb-2" />
                  <p className="text-xs text-neutral-500">Worldwide Shipping</p>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 mx-auto text-neutral-500 mb-2" />
                  <p className="text-xs text-neutral-500">Certificate Included</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Title & Artist */}
              <div>
                {product.artist_name && (
                  <p className="text-neutral-500 uppercase tracking-wider text-sm mb-2">
                    {product.artist_name}
                  </p>
                )}
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                  {product.title}
                </h1>
                {product.description && (
                  <p className="text-neutral-400 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-neutral-800 py-6">
                <p className="text-3xl font-display text-accent">
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-neutral-500 text-sm mt-1">
                  Including tax. Shipping calculated at checkout.
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
                  Size
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 border text-left transition-all ${
                        selectedSize?.id === size.id
                          ? 'border-accent bg-accent/10'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <span className="block text-white">{size.name}</span>
                      <span className="text-sm text-neutral-500">
                        {size.price_modifier === 0 
                          ? 'Base price' 
                          : `+${formatPrice(size.price_modifier)}`
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Selection */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
                  Frame
                </h3>
                <div className="space-y-2">
                  {frameOptions.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`w-full p-4 border flex items-center justify-between transition-all ${
                        selectedFrame.id === frame.id
                          ? 'border-accent bg-accent/10'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedFrame.id === frame.id && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                        <span className="text-white">{frame.name}</span>
                      </div>
                      <span className="text-neutral-500">
                        {frame.price === 0 ? '—' : `+${formatPrice(frame.price)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Selection */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
                  Paper
                </h3>
                <div className="space-y-2">
                  {paperOptions.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={`w-full p-4 border flex items-center justify-between transition-all ${
                        selectedPaper.id === paper.id
                          ? 'border-accent bg-accent/10'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedPaper.id === paper.id && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                        <span className="text-white">{paper.name}</span>
                      </div>
                      <span className="text-neutral-500">
                        {paper.price === 0 ? 'Included' : `+${formatPrice(paper.price)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full btn-primary py-4 text-center"
                >
                  Add to Cart — {formatPrice(totalPrice)}
                </button>
                <button 
                  onClick={handleInquiry}
                  className="w-full btn-secondary py-4 text-center"
                >
                  Inquire About This Piece
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-sm text-neutral-500 space-y-2 pt-4 border-t border-neutral-800">
                <p>• Printed on archival quality {selectedPaper.name}</p>
                <p>• Ships within 5-7 business days</p>
                <p>• 14-day return policy</p>
                {product.edition_type === 'collector' && (
                  <p>• Hand-signed and numbered certificate of authenticity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
