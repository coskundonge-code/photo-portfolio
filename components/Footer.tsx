'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Mail } from 'lucide-react';
import { Settings } from '@/lib/types';

interface FooterProps {
  settings?: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const email = settings?.email || '';
  const instagram = settings?.instagram || '';
  const linkedin = settings?.linkedin || '';
  const footerText = settings?.footer_text || '© 2024 Tüm hakları saklıdır.';

  return (
    <footer className="bg-white border-t border-neutral-100">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">{footerText}</p>

          <div className="flex items-center gap-6">
            {email && (
              <a 
                href={`mailto:${email}`} 
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
            {instagram && (
              <a 
                href={instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {linkedin && (
              <a 
                href={linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>

          <Link 
            href="/admin" 
            className="text-xs text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
