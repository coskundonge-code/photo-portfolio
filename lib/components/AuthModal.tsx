'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement actual auth logic with Supabase Auth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    // onClose();
    alert('Üyelik sistemi yakında aktif olacak!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl flex rounded-lg overflow-hidden shadow-2xl">
        {/* Sol: Görsel */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src="/room-preview.jpg"
            alt="Gallery"
            fill
            className="object-cover"
          />
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300" />
          {/* Çerçeveli fotoğraf preview */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-[#c4a574] p-2 shadow-2xl">
              <div className="bg-white p-4">
                <div className="w-48 h-64 bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:opacity-60 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium tracking-wide mb-2">
              {mode === 'login' ? 'HOŞ GELDİNİZ' : 'HESAP OLUŞTUR'}
            </h2>
            <p className="text-sm text-neutral-500">
              {mode === 'login' 
                ? 'Özel üye fiyatlarından yararlanın.'
                : 'Siparişlerinizi takip edin ve özel fırsatlardan haberdar olun.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1 tracking-wide">
                  AD SOYAD
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1 tracking-wide">
                E-POSTA
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors"
                placeholder="E-posta"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1 tracking-wide">
                ŞİFRE
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors"
                placeholder="Şifre"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1 tracking-wide">
                  ŞİFRE TEKRAR
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="Şifre Tekrar"
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                Şifremi unuttum?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-neutral-600 hover:text-black transition-colors underline"
            >
              {mode === 'login' ? 'Hesap oluştur' : 'Zaten hesabım var'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
