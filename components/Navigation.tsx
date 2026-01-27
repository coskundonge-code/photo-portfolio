'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ShoppingBag } from 'lucide-react';
import { Project } from '@/lib/types';

interface NavigationProps {
  projects?: Project[];
  siteName?: string;
}

export default function Navigation({ projects = [], siteName = 'PORTFOLIO' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
      {/* Desktop Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-primary/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="font-display text-xl tracking-wider hover:text-accent transition-colors"
            >
              {siteName}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`link-hover text-sm tracking-wide ${pathname === '/' ? 'text-white' : 'text-neutral-400'}`}
              >
                Overview
              </Link>
              
              {/* Work Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsWorkOpen(true)}
                onMouseLeave={() => setIsWorkOpen(false)}
              >
                <button 
                  className={`flex items-center space-x-1 text-sm tracking-wide transition-colors ${
                    pathname.startsWith('/work') ? 'text-white' : 'text-neutral-400'
                  } hover:text-white`}
                >
                  <span>Work</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div 
                  className={`absolute top-full left-0 pt-4 transition-all duration-300 ${
                    isWorkOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  <div className="bg-primary-light border border-neutral-800 py-2 min-w-[200px]">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/work/${project.slug}`}
                        className="block px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                      >
                        {project.title}
                      </Link>
                    ))}
                    {projects.length === 0 && (
                      <span className="block px-4 py-2 text-sm text-neutral-500">
                        No projects yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link 
                href="/shop" 
                className={`link-hover text-sm tracking-wide ${pathname.startsWith('/shop') ? 'text-white' : 'text-neutral-400'}`}
              >
                Shop
              </Link>
              
              <Link 
                href="/about" 
                className={`link-hover text-sm tracking-wide ${pathname === '/about' ? 'text-white' : 'text-neutral-400'}`}
              >
                About
              </Link>
              
              <Link 
                href="/contact" 
                className={`link-hover text-sm tracking-wide ${pathname === '/contact' ? 'text-white' : 'text-neutral-400'}`}
              >
                Contact
              </Link>

              {/* Cart Icon */}
              <Link href="/shop" className="relative">
                <ShoppingBag className="w-5 h-5 text-neutral-400 hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-primary lg:hidden transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-6">
          <Link 
            href="/" 
            className="text-2xl font-display tracking-wide text-white hover:text-accent transition-colors"
          >
            Overview
          </Link>
          
          <div className="text-center">
            <button 
              className="text-2xl font-display tracking-wide text-white hover:text-accent transition-colors flex items-center space-x-2"
              onClick={() => setIsWorkOpen(!isWorkOpen)}
            >
              <span>Work</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isWorkOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isWorkOpen && (
              <div className="mt-4 space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/work/${project.slug}`}
                    className="block text-lg text-neutral-400 hover:text-white transition-colors"
                  >
                    {project.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link 
            href="/shop" 
            className="text-2xl font-display tracking-wide text-white hover:text-accent transition-colors"
          >
            Shop
          </Link>
          
          <Link 
            href="/about" 
            className="text-2xl font-display tracking-wide text-white hover:text-accent transition-colors"
          >
            About
          </Link>
          
          <Link 
            href="/contact" 
            className="text-2xl font-display tracking-wide text-white hover:text-accent transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </>
  );
}
