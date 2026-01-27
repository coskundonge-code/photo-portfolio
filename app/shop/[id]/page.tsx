'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProductById } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleAddToCart = () => {
    toast.success('Ürün sepete eklendi!');
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
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative aspect-square bg-neutral-100">
              <Image
                src={product.photos?.url || 'https://via.placeholder.com/800'}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <h1 className="font-display text-3xl md:text-4xl text-neutral-900 mb-4">
                {product.title}
              </h1>
              
              {product.description && (
                <p className="text-neutral-600 mb-6">{product.description}</p>
              )}

              <p className="text-2xl font-display text-neutral-900 mb-2">
                ₺{product.base_price}
              </p>

              <p className="text-sm text-neutral-500 mb-8">
                {product.edition_type === 'limited' 
                  ? `Limitli Edisyon - ${product.edition_total ? product.edition_total - (product.edition_sold || 0) : 0} adet kaldı`
                  : 'Açık Edisyon'}
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm text-neutral-600">Adet:</span>
                <div className="flex items-center border border-neutral-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-neutral-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Sepete Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
