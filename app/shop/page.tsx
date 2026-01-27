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

  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const email = settings?.email || 'CoskunDonge@CoskunDonge.com';
  const instagram = settings?.instagram || 'https://instagram.com/coskundonge';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl text-neutral-900 mb-8">Shop</h1>
          
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-square bg-neutral-100 mb-4 overflow-hidden">
                    <Image
                      src={product.photos?.url || 'https://via.placeholder.com/400'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-neutral-900 font-medium mb-1">{product.title}</h3>
                  <p className="text-neutral-500">₺{product.base_price}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {product.edition_type === 'limited' ? 'Limitli Edisyon' : 'Açık Edisyon'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
