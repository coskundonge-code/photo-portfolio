'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Instagram, Linkedin } from 'lucide-react';
import { Project, Settings } from '@/lib/types';

interface NavigationProps {
  projects?: Project[];
  settings?: Settings | null;
}

export default function Navigation({ projects = [], settings }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const instagram = settings?.instagram || '';
  const linkedin = settings?.linkedin || '';
  
  // Menü başlıkları
  const menuItems = [
    { href: '/', label: settings?.menu_overview || 'Overview' },
    { href: '/work', label: settings?.menu_work || 'Work' },
    { href: '/shop', label: settings?.menu_shop || 'Shop' },
    { href: '/about', label: settings?.menu_about || 'About' },
    { href: '/contact', label: settings?.menu_contact || 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
      }`}>
        <nav className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="font-display text-lg lg:text-xl tracking-wider text-black hover:opacity-70 transition-opacity"
            >
              {siteName}
            </Link>

            {/* Desktop Menu - Levon Biss Style */}
            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm tracking-wide transition-all ${
                    isActive(item.href)
                      ? 'text-black border-b border-black'
                      : 'text-black hover:opacity-70'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Social Icons */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-neutral-200">
                {instagram && (
                  <a 
                    href={instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:opacity-70 transition-opacity"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {linkedin && (
                  <a 
                    href={linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:opacity-70 transition-opacity"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-black p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-white lg:hidden transition-all duration-300 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-2xl tracking-wide ${
                isActive(item.href) ? 'text-black border-b border-black' : 'text-black'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile Social Icons */}
          <div className="flex items-center space-x-6 pt-6">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-black">
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-black">
                <Linkedin className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
