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
  size: { id: string; name: string; dimensions: string; price: number };
  frame: { id: string; name: string; color: string; price: number };
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [isOpen]);

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-medium tracking-wide">SEPETİNİZ</h2>
          <button onClick={onClose} className="p-2 hover:opacity-60 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" strokeWidth={1} />
              <p className="text-lg font-medium mb-2">SEPETİNİZ BOŞ</p>
              <p className="text-neutral-500 text-sm mb-6">
                Henüz sepetinize ürün eklemediniz.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4">
                  {/* Ürün görseli */}
                  <div className="relative w-24 h-24 bg-neutral-100 flex-shrink-0">
                    <Image
                      src={item.photoUrl || '/placeholder.jpg'}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Ürün bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate">{item.productTitle}</h3>
                    <p className="text-xs text-neutral-500 mb-1">
                      {item.size.name} • {item.size.dimensions}
                    </p>
                    <p className="text-xs text-neutral-500 mb-2">
                      {item.frame.name} Çerçeve • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                    </p>
                    <p className="font-medium">₺{formatPrice(item.price)}</p>
                  </div>

                  {/* Sil butonu */}
                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Checkout */}
        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Ara Toplam</span>
              <span className="font-medium">₺{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-neutral-500">
              Kargo ücreti ödeme adımında hesaplanacaktır.
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full py-4 bg-black text-white text-center text-sm tracking-wide hover:bg-neutral-800 transition-colors"
            >
              ÖDEMEYE GEÇ
            </Link>
            <button
              onClick={onClose}
              className="block w-full py-3 text-center text-sm text-neutral-600 hover:text-black transition-colors underline"
            >
              Alışverişe Devam Et
            </button>
          </div>
        )}
      </div>
    </>
  );
}
