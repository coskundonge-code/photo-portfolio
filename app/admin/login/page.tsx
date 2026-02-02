'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const { login, checkAuth } = useAdminStore();
  const router = useRouter();

  // Sayfa yüklendiğinde auth kontrolü - zaten giriş yapılmışsa direkt admin'e git
  useEffect(() => {
    const alreadyLoggedIn = checkAuth();
    // Ayrıca legacy localStorage kontrolü
    const legacyAuth = localStorage.getItem('adminAuth') === 'true';
    
    if (alreadyLoggedIn || legacyAuth) {
      // Zaten giriş yapılmış, direkt admin'e yönlendir
      router.replace('/admin');
    } else {
      setChecking(false);
    }
  }, [checkAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 300));

    // Zustand store ile giriş yap (bu aynı zamanda localStorage'a da yazacak)
    const success = login(password);
    
    if (success) {
      // Ek olarak legacy auth'u da set et
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin');
    } else {
      setError('Şifre yanlış');
    }
    
    setIsLoading(false);
  };

  // Auth kontrol edilirken loading göster
  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-white mb-2">Admin Panel</h1>
          <p className="text-neutral-500">Devam etmek için şifrenizi girin</p>
        </div>

        {/* Login Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800">
            <Lock className="w-8 h-8 text-neutral-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

        </div>

        {/* Back to site */}
        <p className="text-center mt-8">
          <a href="/" className="text-neutral-500 hover:text-white transition-colors text-sm">
            ← Siteye Dön
          </a>
        </p>
      </div>
    </div>
  );
}
