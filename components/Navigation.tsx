'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Project, Settings } from '@/lib/types';

interface NavigationProps {
  projects?: Project[];
  siteName?: string;
  settings?: Settings | null;
}

export default function Navigation({ projects = [], siteName = 'PORTFOLIO', settings }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Menü başlıkları
  const menuOverview = settings?.menu_overview || 'Overview';
  const menuWork = settings?.menu_work || 'Work';
  const menuShop = settings?.menu_shop || 'Shop';
  const menuAbout = settings?.menu_about || 'About';
  const menuContact = settings?.menu_contact || 'Contact';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsWorkOpen(false);
  }, [pathname]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/" 
              className="font-display text-xl tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              {siteName}
            </Link>

            <div className="hidden lg:flex items-center space-x-10">
              <Link 
                href="/" 
                className={`text-xs tracking-widest uppercase ${pathname === '/' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'} transition-colors`}
              >
                {menuOverview}
              </Link>
              
              <div 
                className="relative"
                onMouseEnter={() => setIsWorkOpen(true)}
                onMouseLeave={() => setIsWorkOpen(false)}
              >
                <button 
                  className={`flex items-center space-x-1 text-xs tracking-widest uppercase ${
                    pathname.startsWith('/work') ? 'text-neutral-900' : 'text-neutral-500'
                  } hover:text-neutral-900 transition-colors`}
                >
                  <span>{menuWork}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`absolute top-full left-0 pt-4 transition-all duration-200 ${
                    isWorkOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                >
                  <div className="bg-white border border-neutral-200 shadow-lg py-2 min-w-[180px]">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/work/${project.slug}`}
                        className="block px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                      >
                        {project.title}
                      </Link>
                    ))}
                    {projects.length === 0 && (
                      <span className="block px-4 py-2 text-sm text-neutral-400">Henüz proje yok</span>
                    )}
                  </div>
                </div>
              </div>

              <Link 
                href="/shop" 
                className={`text-xs tracking-widest uppercase ${pathname.startsWith('/shop') ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'} transition-colors`}
              >
                {menuShop}
              </Link>
              
              <Link 
                href="/about" 
                className={`text-xs tracking-widest uppercase ${pathname === '/about' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'} transition-colors`}
              >
                {menuAbout}
              </Link>
              
              <Link 
                href="/contact" 
                className={`text-xs tracking-widest uppercase ${pathname === '/contact' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'} transition-colors`}
              >
                {menuContact}
              </Link>
            </div>

            <button
              className="lg:hidden text-neutral-900 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-white lg:hidden transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-6">
          <Link href="/" className="text-2xl font-display tracking-wide text-neutral-900">{menuOverview}</Link>
          
          <div className="text-center">
            <button 
              className="text-2xl font-display tracking-wide text-neutral-900 flex items-center space-x-2"
              onClick={() => setIsWorkOpen(!isWorkOpen)}
            >
              <span>{menuWork}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isWorkOpen && (
              <div className="mt-4 space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/work/${project.slug}`}
                    className="block text-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {project.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/shop" className="text-2xl font-display tracking-wide text-neutral-900">{menuShop}</Link>
          <Link href="/about" className="text-2xl font-display tracking-wide text-neutral-900">{menuAbout}</Link>
          <Link href="/contact" className="text-2xl font-display tracking-wide text-neutral-900">{menuContact}</Link>
        </div>
      </div>
    </>
  );
}
