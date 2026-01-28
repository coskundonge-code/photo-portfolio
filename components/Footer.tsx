'use client';

import Link from 'next/link';
import { Instagram, Mail, Phone } from 'lucide-react';

interface FooterProps {
  settings?: {
    site_name?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    about_text?: string;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = settings?.site_name || 'Coşkun Dönge';

  return (
    <footer className="bg-neutral-100 border-t border-neutral-200">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        
        {/* Ana Footer İçeriği */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Hakkında */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">{siteName}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-md">
                {settings?.about_text || 
                  'Profesyonel fotoğraf sanatçısı. Doğa, portre ve belgesel fotoğrafçılığı alanlarında çalışmalar üretiyorum. Her bir eser, müze kalitesinde basılmış ve el yapımı çerçevelenmiştir.'
                }
              </p>
            </div>

            {/* Hızlı Linkler */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                Keşfet
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/work" className="text-sm text-neutral-600 hover:text-black transition-colors">
                    Çalışmalar
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-sm text-neutral-600 hover:text-black transition-colors">
                    Mağaza
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-neutral-600 hover:text-black transition-colors">
                    Hakkında
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-neutral-600 hover:text-black transition-colors">
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                İletişim
              </h4>
              <ul className="space-y-3">
                {settings?.email && (
                  <li>
                    <a 
                      href={`mailto:${settings.email}`}
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings?.phone && (
                  <li>
                    <a 
                      href={`tel:${settings.phone}`}
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.instagram && (
                  <li>
                    <a 
                      href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      {settings.instagram}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-neutral-200 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            © {currentYear} {siteName}. Tüm hakları saklıdır.
          </p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-neutral-500 hover:text-black transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="text-xs text-neutral-500 hover:text-black transition-colors">
              Kullanım Koşulları
            </Link>
            
            {/* Admin Linki - Sağ Altta */}
            <Link 
              href="/admin" 
              className="text-xs text-neutral-400 hover:text-black transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
