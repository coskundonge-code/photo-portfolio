'use client';

import Link from 'next/link';
import { Instagram, Mail, Phone } from 'lucide-react';
import { Settings } from '@/lib/types';

interface FooterProps {
  settings?: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const email = settings?.email || 'info@coskundunge.com';
  const instagram = settings?.instagram;

  return (
    <footer className="bg-neutral-100 border-t border-neutral-200">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          
          {/* Logo & Açıklama */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold tracking-wider mb-4 text-black">{siteName}</h3>
            <p className="text-neutral-600 text-sm leading-relaxed max-w-md">
              Sınırlı sayıda üretilen, müze kalitesinde giclée baskılar ve el yapımı çerçeveler ile 
              fotoğraf sanatını evinize taşıyın.
            </p>
          </div>

          {/* Menü */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-black tracking-wide">MENÜ</h4>
            <nav className="space-y-3">
              <Link href="/" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/work" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                Çalışmalar
              </Link>
              <Link href="/shop" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                Mağaza
              </Link>
              <Link href="/about" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                Hakkında
              </Link>
              <Link href="/contact" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                İletişim
              </Link>
            </nav>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-black tracking-wide">İLETİŞİM</h4>
            <div className="space-y-3">
              <a 
                href={`mailto:${email}`} 
                className="flex items-center gap-3 text-neutral-600 hover:text-black text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                {email}
              </a>
              {instagram && (
                <a 
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-600 hover:text-black text-sm transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="/privacy" className="hover:text-black transition-colors">Gizlilik Politikası</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
