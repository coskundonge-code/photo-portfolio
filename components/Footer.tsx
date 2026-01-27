'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Instagram, Mail, ArrowRight } from 'lucide-react';

interface FooterProps {
  siteName?: string;
  email?: string;
  instagram?: string;
}

export default function Footer({ 
  siteName = 'PORTFOLIO',
  email = 'hello@example.com',
  instagram = 'https://instagram.com'
}: FooterProps) {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription with Supabase
    setIsSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="bg-primary border-t border-neutral-800">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-xl">
          <h3 className="font-display text-2xl mb-4">Subscribe to our newsletter</h3>
          <p className="text-neutral-400 mb-6">
            Sign up with your email address to receive news and updates.
          </p>
          
          {isSubscribed ? (
            <p className="text-accent">Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email Address"
                required
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary flex items-center gap-2">
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-sm text-neutral-500">
              All photography © Copyright {new Date().getFullYear()}. No unauthorised use.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <a 
                href={`mailto:${email}`}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Admin Link */}
            <Link 
              href="/admin"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
