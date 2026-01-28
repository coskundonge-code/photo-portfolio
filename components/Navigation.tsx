'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, ShoppingBag, ChevronDown } from 'lucide-react';
import { Settings as SettingsType, Project } from '@/lib/types';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

interface NavigationProps {
  projects?: Project[];
  settings?: SettingsType | null;
}

export default function Navigation({ projects = [], settings }: NavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);

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
                Ana Sayfa
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
                  Çalışmalar
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
                        Tümü
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
                Mağaza
              </Link>
              <Link 
                href="/about" 
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname === '/about' ? 'font-medium' : ''
                }`}
              >
                Hakkında
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm tracking-wide hover:opacity-60 transition-opacity ${
                  pathname === '/contact' ? 'font-medium' : ''
                }`}
              >
                İletişim
              </Link>
            </div>

            {/* Sağ: User, Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity"
                title="Hesabım"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity relative"
                title="Sepetim"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

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
              <Link href="/" className="block text-lg" onClick={() => setIsMenuOpen(false)}>Ana Sayfa</Link>
              <Link href="/work" className="block text-lg" onClick={() => setIsMenuOpen(false)}>Çalışmalar</Link>
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
              <Link href="/shop" className="block text-lg" onClick={() => setIsMenuOpen(false)}>Mağaza</Link>
              <Link href="/about" className="block text-lg" onClick={() => setIsMenuOpen(false)}>Hakkında</Link>
              <Link href="/contact" className="block text-lg" onClick={() => setIsMenuOpen(false)}>İletişim</Link>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
