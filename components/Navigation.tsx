'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Instagram, Linkedin, ChevronDown } from 'lucide-react';
import { Project, Settings } from '@/lib/types';

interface NavigationProps {
  projects?: Project[];
  settings?: Settings | null;
}

export default function Navigation({ projects = [], settings }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const instagram = settings?.instagram || '';
  const linkedin = settings?.linkedin || '';
  
  const menuOverview = settings?.menu_overview || 'Overview';
  const menuWork = settings?.menu_work || 'Work';
  const menuShop = settings?.menu_shop || 'Shop';
  const menuAbout = settings?.menu_about || 'About';
  const menuContact = settings?.menu_contact || 'Contact';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsWorkOpen(false);
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Overview */}
              <Link
                href="/"
                className={`text-sm tracking-wide transition-all ${
                  isActive('/') && pathname === '/'
                    ? 'text-black border-b border-black'
                    : 'text-black hover:opacity-70'
                }`}
              >
                {menuOverview}
              </Link>

              {/* Work with Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsWorkOpen(true)}
                onMouseLeave={() => setIsWorkOpen(false)}
              >
                <button
                  className={`text-sm tracking-wide transition-all flex items-center gap-1 ${
                    isActive('/work')
                      ? 'text-black border-b border-black'
                      : 'text-black hover:opacity-70'
                  }`}
                >
                  {menuWork}
                  {projects.length > 0 && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Dropdown */}
                {projects.length > 0 && (
                  <div 
                    className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                      isWorkOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                  >
                    <div className="bg-white border border-neutral-200 shadow-lg py-2 min-w-[200px]">
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/work/${project.slug}`}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors text-right"
                        >
                          {project.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Shop */}
              <Link
                href="/shop"
                className={`text-sm tracking-wide transition-all ${
                  isActive('/shop')
                    ? 'text-black border-b border-black'
                    : 'text-black hover:opacity-70'
                }`}
              >
                {menuShop}
              </Link>

              {/* About */}
              <Link
                href="/about"
                className={`text-sm tracking-wide transition-all ${
                  isActive('/about')
                    ? 'text-black border-b border-black'
                    : 'text-black hover:opacity-70'
                }`}
              >
                {menuAbout}
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`text-sm tracking-wide transition-all ${
                  isActive('/contact')
                    ? 'text-black border-b border-black'
                    : 'text-black hover:opacity-70'
                }`}
              >
                {menuContact}
              </Link>
              
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
          <Link href="/" className="text-2xl tracking-wide text-black">
            {menuOverview}
          </Link>
          
          {/* Work with sub-items */}
          <div className="text-center">
            <button 
              onClick={() => setIsWorkOpen(!isWorkOpen)}
              className="text-2xl tracking-wide text-black flex items-center gap-2"
            >
              {menuWork}
              {projects.length > 0 && (
                <ChevronDown className={`w-5 h-5 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
            {isWorkOpen && projects.length > 0 && (
              <div className="mt-4 space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/work/${project.slug}`}
                    className="block text-lg text-neutral-500 hover:text-black transition-colors"
                  >
                    {project.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/shop" className="text-2xl tracking-wide text-black">
            {menuShop}
          </Link>
          <Link href="/about" className="text-2xl tracking-wide text-black">
            {menuAbout}
          </Link>
          <Link href="/contact" className="text-2xl tracking-wide text-black">
            {menuContact}
          </Link>
          
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
