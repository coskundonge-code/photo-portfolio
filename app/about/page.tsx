import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Project } from '@/lib/types';
import { Instagram, Mail, Camera, Award, Globe } from 'lucide-react';

const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-primary">
      <Navigation projects={demoProjects} siteName="PORTFOLIO" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden opacity-0 animate-fade-in">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
                alt="Photographer portrait"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div className="opacity-0 animate-fade-up">
                <p className="text-accent uppercase tracking-wider text-sm mb-4">About</p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                  The Photographer
                </h1>
              </div>

              <div className="space-y-6 text-neutral-400 leading-relaxed opacity-0 animate-fade-up stagger-1">
                <p>
                  Welcome to my world of visual storytelling. For over a decade, I've been 
                  capturing moments that speak to the soul—from the raw majesty of untouched 
                  landscapes to the intimate poetry of everyday life.
                </p>
                <p>
                  My work has been featured in National Geographic, TIME Magazine, and exhibited 
                  in galleries across Europe and North America. Each photograph is a meditation 
                  on light, composition, and the fleeting beauty of our world.
                </p>
                <p>
                  Based between Istanbul and London, I'm available for commissioned work, 
                  collaborations, and exhibitions. Every project begins with a conversation—
                  I'd love to hear about yours.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 py-8 border-t border-b border-neutral-800 opacity-0 animate-fade-up stagger-2">
                <div>
                  <p className="font-display text-3xl text-white mb-1">15+</p>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider">Years</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-white mb-1">50+</p>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider">Countries</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-white mb-1">200+</p>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider">Projects</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-6 opacity-0 animate-fade-up stagger-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-neutral-400 hover:text-accent transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
                <a 
                  href="mailto:hello@example.com"
                  className="flex items-center space-x-2 text-neutral-400 hover:text-accent transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl mb-12">Equipment</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Camera className="w-6 h-6 text-accent" />
              <h3 className="font-display text-xl">Cameras</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>Hasselblad X2D 100C</li>
                <li>Sony A7R V</li>
                <li>Leica M11</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Globe className="w-6 h-6 text-accent" />
              <h3 className="font-display text-xl">Lenses</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>Hasselblad XCD 21mm f/4</li>
                <li>Sony 24-70mm f/2.8 GM II</li>
                <li>Leica Summilux 35mm f/1.4</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Award className="w-6 h-6 text-accent" />
              <h3 className="font-display text-xl">Printing</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>Hahnemühle Photo Rag</li>
                <li>Canson Infinity Baryta</li>
                <li>Epson Legacy Platine</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl mb-12">Selected Clients</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['National Geographic', 'TIME', 'Vogue', 'Condé Nast', 'Apple', 'BMW'].map((client) => (
              <div 
                key={client}
                className="text-neutral-500 hover:text-white transition-colors text-center py-4"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Let's Create Something Together
          </h2>
          <p className="text-neutral-400 mb-8">
            Whether you're looking for commissioned work, interested in acquiring prints, 
            or simply want to discuss a potential collaboration—I'd love to hear from you.
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
