'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, ShoppingBag } from 'lucide-react';

interface CartItem {
  productId: string;
  productTitle: string;
  photoUrl: string;
  style: string;
  size: { name: string; dimensions: string; price: number };
  frame: { name: string; color: string; price: number };
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    }
  }, [isOpen]);

  const removeItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-medium">Sepetim ({cartItems.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-neutral-500 mb-4">Sepetiniz boş</p>
              <button
                onClick={onClose}
                className="text-sm underline hover:no-underline"
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-neutral-100 relative flex-shrink-0">
                    {item.photoUrl && (
                      <Image
                        src={item.photoUrl}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.productTitle}</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.size?.name} • {item.size?.dimensions}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.frame?.name} Çerçeve • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                    </p>
                    <p className="font-medium mt-2">₺{formatPrice(item.price)}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-neutral-400 hover:text-red-500 self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Toplam</span>
              <span className="text-xl font-medium">₺{formatPrice(totalPrice)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full py-4 bg-black text-white text-center text-sm tracking-wide hover:bg-neutral-800 transition-colors"
            >
              ÖDEMEYE GEÇ
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-sm text-neutral-500 hover:text-black underline"
            >
              Sepeti Temizle
            </button>
          </div>
        )}
      </div>
    </>
  );
}
