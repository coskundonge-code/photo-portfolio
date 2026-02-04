'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, ShoppingBag, ChevronDown, Globe } from 'lucide-react';
import { Settings as SettingsType, Project } from '@/lib/types';
import { useLanguage } from '@/lib/language';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

interface NavigationProps {
  projects?: Project[];
  settings?: SettingsType | null;
}

export default function Navigation({ projects = [], settings }: NavigationProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  const siteName = settings?.site_name || 'COŞKUN DÖNGE';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Sol: Logo/İsim */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-lg lg:text-xl font-semibold tracking-wider">
                {siteName}
              </h1>
            </Link>

            {/* Orta: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname === '/' ? 'font-medium' : ''
                }`}
              >
                {t('nav.home')}
              </Link>

              {/* Çalışmalar Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsWorkDropdownOpen(true)}
                onMouseLeave={() => setIsWorkDropdownOpen(false)}
              >
                <Link
                  href="/work"
                  className={`text-sm tracking-wide hover:opacity-60 transition-opacity flex items-center gap-1 ${
                    pathname?.startsWith('/work') ? 'font-medium' : ''
                  }`}
                >
                  {t('nav.work')}
                  {projects.length > 0 && <ChevronDown className="w-3 h-3" />}
                </Link>

                {/* Dropdown Menu */}
                {isWorkDropdownOpen && projects.length > 0 && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="bg-white border border-neutral-200 shadow-lg min-w-[200px]">
                      <Link
                        href="/work"
                        className="block px-4 py-3 text-sm hover:bg-neutral-50 border-b border-neutral-100"
                      >
                        {t('nav.all')}
                      </Link>
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/work?project=${project.id}`}
                          className="block px-4 py-3 text-sm hover:bg-neutral-50 text-neutral-600 hover:text-black"
                        >
                          {project.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/shop"
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname?.startsWith('/shop') ? 'font-medium' : ''
                }`}
              >
                {t('nav.shop')}
              </Link>
              <Link
                href="/about"
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname === '/about' ? 'font-medium' : ''
                }`}
              >
                {t('nav.about')}
              </Link>
              <Link
                href="/contact"
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname === '/contact' ? 'font-medium' : ''
                }`}
              >
                {t('nav.contact')}
              </Link>
            </div>

            {/* Sağ: User, Cart, Language & Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity"
                title={t('nav.myAccount')}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity relative"
                title={t('nav.myCart')}
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Language Switcher */}
              <div
                className="relative"
                onMouseEnter={() => setIsLangDropdownOpen(true)}
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                <button
                  className="p-2 hover:opacity-60 transition-opacity flex items-center gap-1"
                  title="Language"
                >
                  <Globe className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-xs font-medium uppercase hidden sm:inline">{language}</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50">
                    <div className="bg-white border border-neutral-200 shadow-lg min-w-[120px]">
                      <button
                        onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${language === 'en' ? 'font-medium bg-neutral-50' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { setLanguage('tr'); setIsLangDropdownOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${language === 'tr' ? 'font-medium bg-neutral-50' : ''}`}
                      >
                        Turkce
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-6 space-y-4">
              <Link href="/" className="block text-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.home')}</Link>
              <Link href="/work" className="block text-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.work')}</Link>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work?project=${project.id}`}
                  className="block text-base pl-4 text-neutral-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {project.title}
                </Link>
              ))}
              <Link href="/shop" className="block text-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.shop')}</Link>
              <Link href="/about" className="block text-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.about')}</Link>
              <Link href="/contact" className="block text-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.contact')}</Link>

              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex gap-4">
                  <button
                    onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
                    className={`text-lg ${language === 'en' ? 'font-medium' : 'text-neutral-500'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('tr'); setIsMenuOpen(false); }}
                    className={`text-lg ${language === 'tr' ? 'font-medium' : 'text-neutral-500'}`}
                  >
                    Turkce
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
