'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProducts } from '@/lib/supabase';
import { Settings, Project, Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ShopPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData, productsData] = await Promise.all([
        getSettings(),
        getProjects(),
        getProducts()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setProducts(productsData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
              {settings?.menu_shop || 'Shop'}
            </h1>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Museum quality prints, handcrafted frames, ready to hang
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center gap-6 mb-12 border-b border-neutral-200 pb-4">
            <button className="text-sm text-black border-b-2 border-black pb-2 px-2">
              All Prints
            </button>
            <button className="text-sm text-neutral-400 hover:text-black pb-2 px-2 transition-colors">
              Open Editions
            </button>
            <button className="text-sm text-neutral-400 hover:text-black pb-2 px-2 transition-colors">
              Limited Editions
            </button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group"
                >
                  {/* Frame Preview */}
                  <div className="relative bg-white p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    {/* Wall texture background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-100 to-white" />
                    
                    {/* Frame */}
                    <div className="relative">
                      <div className="relative bg-black p-2 shadow-xl">
                        {/* Mat (passepartout) */}
                        <div className="bg-white p-4">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                              src={product.photos?.url || 'https://via.placeholder.com/400'}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Frame shadow */}
                      <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/10 blur-sm -z-10" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg text-black font-medium group-hover:opacity-70 transition-opacity">
                      {product.title}
                    </h3>
                    <p className="text-neutral-500 text-sm mt-1">
                      {product.edition_type === 'limited' 
                        ? `Limited Edition of ${product.edition_total}`
                        : 'Open Edition'}
                    </p>
                    <p className="text-black font-medium mt-2">
                      From ₺{product.base_price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-black mb-2">Museum Quality</h3>
              <p className="text-sm text-neutral-500">Archival inks on premium fine art paper</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-medium text-black mb-2">Ready to Hang</h3>
              <p className="text-sm text-neutral-500">Handcrafted frames with all hardware included</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-black mb-2">Made to Order</h3>
              <p className="text-sm text-neutral-500">Each print is crafted specifically for you</p>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
