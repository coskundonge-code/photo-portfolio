'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Instagram, Mail, X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Settings } from '@/lib/types';
import { useAdminStore } from '@/lib/store';
import { useLanguage } from '@/lib/language';

interface FooterProps {
  settings?: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const router = useRouter();
  const { login, checkAuth } = useAdminStore();
  const { t } = useLanguage();

  const siteName = settings?.site_name || 'COSKUN DONGE';
  const email = settings?.email || 'info@coskundunge.com';
  const instagram = settings?.instagram;

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Hem Zustand hem localStorage kontrolü
    const zustandAuth = checkAuth();
    const legacyAuth = localStorage.getItem('adminAuth') === 'true';
    
    if (zustandAuth || legacyAuth) {
      router.push('/admin');
      return;
    }
    
    // Değilse modal aç
    setShowAdminModal(true);
    setPassword('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Zustand store ile giriş (bu aynı zamanda localStorage'a da yazacak)
    const success = login(password);
    
    if (success) {
      // Ek olarak legacy auth'u da set et (eski kodlarla uyumluluk için)
      localStorage.setItem('adminAuth', 'true');
      setShowAdminModal(false);
      router.push('/admin');
    } else {
      setError(t('footer.wrongPassword'));
    }
    setLoading(false);
  };

  return (
    <>
      <footer className="bg-neutral-100 border-t border-neutral-200">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            
            {/* Logo & Açıklama */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold tracking-wider mb-4 text-black">{siteName}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-md">
                {t('footer.description')}
              </p>
            </div>

            {/* Menü */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-black tracking-wide">{t('footer.menu')}</h4>
              <nav className="space-y-3">
                <Link href="/" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                  {t('nav.home')}
                </Link>
                <Link href="/work" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                  {t('nav.work')}
                </Link>
                <Link href="/shop" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                  {t('nav.shop')}
                </Link>
                <Link href="/about" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                  {t('nav.about')}
                </Link>
                <Link href="/contact" className="block text-neutral-600 hover:text-black text-sm transition-colors">
                  {t('nav.contact')}
                </Link>
              </nav>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-black tracking-wide">{t('footer.contact')}</h4>
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
              © {new Date().getFullYear()} {siteName}. {t('footer.allRightsReserved')}
            </p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link href="/privacy" className="hover:text-black transition-colors">{t('footer.privacyPolicy')}</Link>
              <Link href="/terms" className="hover:text-black transition-colors">{t('footer.terms')}</Link>
              <button
                onClick={handleAdminClick}
                className="hover:text-black transition-colors"
              >
                {t('footer.admin')}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Giriş Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-neutral-600" />
                <h2 className="font-semibold">{t('footer.adminLogin')}</h2>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-4 space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('footer.password')}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {t('footer.login')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
