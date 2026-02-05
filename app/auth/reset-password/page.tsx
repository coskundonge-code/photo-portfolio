'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('error');
        setError('Geçersiz veya süresi dolmuş bağlantı.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setStatus('success');
        // Sign out after password change
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'error' && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-medium mb-2">Geçersiz Bağlantı</h1>
          <p className="text-neutral-600 mb-6">
            Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-medium mb-2">Şifreniz Güncellendi</h1>
          <p className="text-neutral-600 mb-6">
            Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-medium mb-2 text-center">Yeni Şifre Belirle</h1>
        <p className="text-neutral-500 text-sm text-center mb-8">
          Hesabınız için yeni bir şifre belirleyin.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase">
              Yeni Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase">
              Şifre Tekrar
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Şifreyi Güncelle
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-neutral-500 hover:text-black">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
