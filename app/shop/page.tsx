'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ProductGrid } from '@/components/ProductCard';
import { Product, Project } from '@/lib/types';
import { SlidersHorizontal, Grid, LayoutGrid } from 'lucide-react';

// Demo data
const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

const demoProducts: Product[] = [
  {
    id: '1',
    photo_id: '1',
    title: 'Mountain Vista',
    description: 'Majestic peaks touching the clouds',
    artist_name: 'Your Name',
    edition_type: 'open',
    base_price: 295,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', order_index: 1, created_at: '', updated_at: '' },
  },
  {
    id: '2',
    photo_id: '2',
    title: 'Ocean Waves',
    description: 'The eternal dance of the sea',
    artist_name: 'Your Name',
    edition_type: 'collector',
    edition_size: 25,
    base_price: 895,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800', order_index: 2, created_at: '', updated_at: '' },
  },
  {
    id: '3',
    photo_id: '3',
    title: 'Forest Path',
    description: 'Journey into the unknown',
    artist_name: 'Your Name',
    edition_type: 'open',
    base_price: 295,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', order_index: 3, created_at: '', updated_at: '' },
  },
  {
    id: '4',
    photo_id: '4',
    title: 'City Lights',
    description: 'Urban poetry at night',
    artist_name: 'Your Name',
    edition_type: 'collector',
    edition_size: 15,
    base_price: 1250,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '4', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800', order_index: 4, created_at: '', updated_at: '' },
  },
  {
    id: '5',
    photo_id: '5',
    title: 'Desert Sunset',
    description: 'Golden hour in the wilderness',
    artist_name: 'Your Name',
    edition_type: 'open',
    base_price: 350,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '5', title: 'Desert Sunset', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', order_index: 5, created_at: '', updated_at: '' },
  },
  {
    id: '6',
    photo_id: '6',
    title: 'Northern Lights',
    description: 'Nature\'s most spectacular show',
    artist_name: 'Your Name',
    edition_type: 'collector',
    edition_size: 10,
    base_price: 1950,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: { id: '6', title: 'Northern Lights', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', order_index: 6, created_at: '', updated_at: '' },
  },
];

type FilterType = 'all' | 'open' | 'collector';
type SortType = 'newest' | 'price-asc' | 'price-desc';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  // Filter and sort products
  const filteredProducts = products
    .filter(p => filter === 'all' || p.edition_type === filter)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.base_price - b.base_price;
      if (sort === 'price-desc') return b.base_price - a.base_price;
      return 0; // newest - keep original order
    });

  const openCount = products.filter(p => p.edition_type === 'open').length;
  const collectorCount = products.filter(p => p.edition_type === 'collector').length;

  return (
    <main className="min-h-screen bg-primary">
      <Navigation projects={demoProjects} siteName="PORTFOLIO" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 opacity-0 animate-fade-up">
            Shop
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl opacity-0 animate-fade-up stagger-1">
            Limited edition fine art prints. Each piece is printed on museum-quality paper 
            and comes with a certificate of authenticity.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="px-6 lg:px-12 pb-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Edition Filter */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setFilter('all')}
              className={`text-sm uppercase tracking-wider transition-colors ${
                filter === 'all' ? 'text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`text-sm uppercase tracking-wider transition-colors ${
                filter === 'open' ? 'text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Open Editions ({openCount})
            </button>
            <button
              onClick={() => setFilter('collector')}
              className={`text-sm uppercase tracking-wider transition-colors ${
                filter === 'collector' ? 'text-accent' : 'text-neutral-500 hover:text-accent'
              }`}
            >
              Collector Editions ({collectorCount})
            </button>
          </div>

          {/* Sort & Grid Options */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Sort</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 bg-primary-light border border-neutral-800 py-2 min-w-[150px] z-10">
                  <button
                    onClick={() => { setSort('newest'); setIsFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      sort === 'newest' ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => { setSort('price-asc'); setIsFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      sort === 'price-asc' ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => { setSort('price-desc'); setIsFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      sort === 'price-desc' ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              )}
            </div>

            {/* Grid Toggle */}
            <div className="hidden lg:flex items-center space-x-2 border-l border-neutral-800 pl-4">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1 transition-colors ${gridCols === 3 ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1 transition-colors ${gridCols === 4 ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} columns={gridCols} />
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-400">No products found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="px-6 lg:px-12 py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-xl mb-4">Open Editions</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Unlimited prints available at accessible prices. Perfect for collectors 
              beginning their journey or those who want to enjoy art without limits.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl mb-4 text-accent">Collector Editions</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Limited numbered prints for serious collectors. Each comes with a 
              hand-signed certificate of authenticity and premium framing options.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl mb-4">Custom Orders</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Looking for a specific size or framing? Contact us for custom orders 
              and we'll work together to create your perfect piece.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
