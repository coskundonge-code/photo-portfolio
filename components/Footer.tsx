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
    setIsSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-md">
          <h3 className="font-display text-xl text-neutral-900 mb-3">Subscribe to our newsletter</h3>
          <p className="text-neutral-600 text-sm mb-6">
            Sign up with your email address to receive news and updates.
          </p>
          
          {isSubscribed ? (
            <p className="text-neutral-900 text-sm">Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email Address"
                required
                className="input-field flex-1 text-sm"
              />
              <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              All photography © Copyright {new Date().getFullYear()}. No unauthorised use.
            </p>

            <div className="flex items-center space-x-4">
              <a href={`mailto:${email}`} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            <Link href="/admin" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
