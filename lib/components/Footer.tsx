'use client';

import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';
import { Settings } from '@/lib/types';

interface FooterProps {
  settings?: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const email = settings?.contact_email || 'info@example.com';
  const instagram = settings?.instagram_url;

  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Sol */}
          <div>
            <h3 className="text-lg font-semibold tracking-wider mb-4">{siteName}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Sınırlı sayıda üretilen, müze kalitesinde giclée baskılar ve el yapımı çerçeveler.
            </p>
          </div>

          {/* Orta */}
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wide">MENÜ</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-neutral-400 hover:text-white text-sm">Ana Sayfa</Link>
              <Link href="/work" className="block text-neutral-400 hover:text-white text-sm">Çalışmalar</Link>
              <Link href="/shop" className="block text-neutral-400 hover:text-white text-sm">Mağaza</Link>
              <Link href="/about" className="block text-neutral-400 hover:text-white text-sm">Hakkında</Link>
              <Link href="/contact" className="block text-neutral-400 hover:text-white text-sm">İletişim</Link>
            </nav>
          </div>

          {/* Sağ */}
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wide">İLETİŞİM</h4>
            <div className="space-y-3">
              <a 
                href={`mailto:${email}`} 
                className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm"
              >
                <Mail className="w-4 h-4" />
                {email}
              </a>
              {instagram && (
                <a 
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
