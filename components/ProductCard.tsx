'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 mb-4">
        {product.photos && (
          <Image
            src={product.photos.url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {!product.photos && (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="text-neutral-900 font-medium mb-1 group-hover:text-neutral-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-neutral-600">₺{product.base_price}</p>
        <p className="text-xs text-neutral-400 mt-1">
          {product.edition_type === 'limited' 
            ? `Limitli Edisyon (${product.edition_sold || 0}/${product.edition_total})` 
            : 'Açık Edisyon'}
        </p>
      </div>
    </Link>
  );
}
