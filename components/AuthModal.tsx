'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Loader2, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Şifre kontrolü (kayıt için)
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setMessage('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    // Simülasyon - Supabase Auth entegrasyonu yapılacak
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Şimdilik bilgi mesajı göster
    setMessage('Üyelik sistemi yakında aktif olacak!');
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex">
        
        {/* Sol: Görsel */}
        <div className="hidden md:block w-1/2 bg-neutral-100 relative">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative">
              {/* Çerçeve */}
              <div className="bg-[#1a1a1a] p-1.5">
                <div className="bg-white p-4">
                  <div className="w-48 h-64 bg-neutral-200 relative">
                    <Image
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
                      alt="Art"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Gölge */}
              <div 
                className="absolute -bottom-3 left-[15%] right-[15%] h-6 -z-10"
                style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)' }}
              />
            </div>
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
          {/* Kapat */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Başlık */}
          <h2 className="text-2xl font-semibold mb-2">
            {mode === 'login' ? 'GİRİŞ YAP' : 'HESAP OLUŞTUR'}
          </h2>
          <p className="text-neutral-500 text-sm mb-8">
            {mode === 'login' 
              ? 'Siparişlerinizi takip edin ve özel fırsatlardan haberdar olun.'
              : 'Siparişlerinizi takip edin ve özel fırsatlardan haberdar olun.'}
          </p>

          {/* Mesaj */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes('yakında') 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">AD SOYAD</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">E-POSTA</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">ŞİFRE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">ŞİFRE TEKRAR</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Alt Link */}
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => { setMode('register'); setMessage(''); }}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                Hesabınız yok mu? Kayıt olun
              </button>
            ) : (
              <button
                onClick={() => { setMode('login'); setMessage(''); }}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                Zaten hesabım var
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
