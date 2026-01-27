'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 mb-4">
        {product.photo && (
          <Image
            src={product.photo.url}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ease-out-expo ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          />
        )}
        
        {/* Edition Badge */}
        {product.edition_type === 'collector' && (
          <div className="absolute top-4 left-4 bg-accent text-primary text-xs uppercase tracking-wider px-3 py-1 font-medium">
            Collector Edition
            {product.edition_size && ` · ${product.edition_size}`}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <span className="text-white text-sm uppercase tracking-wider border border-white px-6 py-2 hover:bg-white hover:text-primary transition-colors">
            View Details
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Artist Name */}
        {product.artist_name && (
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            {product.artist_name}
          </p>
        )}
        
        {/* Title */}
        <h3 className="text-white font-display text-lg group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        
        {/* Price */}
        <p className="text-neutral-400 text-sm">
          From {formatPrice(product.base_price)}
        </p>
      </div>
    </Link>
  );
}

// Grid component for products
interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8`}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
