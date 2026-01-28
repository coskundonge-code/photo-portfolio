'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  // Supabase'den admin şifresini al
  useEffect(() => {
    const fetchAdminPassword = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('admin_password')
          .single();
        
        if (data?.admin_password) {
          setAdminPassword(data.admin_password);
        } else {
          // Varsayılan şifre
          setAdminPassword('admin123');
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
        setAdminPassword('admin123');
      }
    };

    fetchAdminPassword();
  }, []);

  // Zaten giriş yapmış mı kontrol et
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Şifre kontrolü
    if (password === adminPassword) {
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Şifre yanlış');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-neutral-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-neutral-500 mt-2">Devam etmek için şifrenizi girin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <p className="text-center text-neutral-600 text-xs mt-8">
          Şifreyi unuttuysanız Admin Ayarları'ndan değiştirebilirsiniz.
        </p>
      </div>
    </div>
  );
}
