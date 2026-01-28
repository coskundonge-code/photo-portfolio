'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'register') {
        // Şifre kontrolü
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı' });
          setLoading(false);
          return;
        }

        // Kayıt
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        });

        if (error) throw error;

        setMessage({ 
          type: 'success', 
          text: 'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.' 
        });
        
        // Formu temizle
        setFormData({ email: '', password: '', name: '', confirmPassword: '' });

      } else {
        // Giriş
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Giriş başarılı!' });
        
        // 1 saniye sonra kapat
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      let errorMessage = 'Bir hata oluştu';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre yanlış';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Lütfen e-posta adresinizi girin' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Şifre sıfırlama linki e-posta adresinize gönderildi' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Şifre sıfırlama e-postası gönderilemedi' });
    }
    setLoading(false);
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
      <div className="relative bg-white w-full max-w-md rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:opacity-60 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-medium tracking-wide mb-2">
              {mode === 'login' ? 'HOŞ GELDİNİZ' : 'HESAP OLUŞTUR'}
            </h2>
            <p className="text-sm text-neutral-500">
              {mode === 'login' 
                ? 'Hesabınıza giriş yapın'
                : 'Siparişlerinizi takip edin ve özel fırsatlardan yararlanın'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          {/* Mesaj */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' 
                ? <CheckCircle className="w-4 h-4" /> 
                : <AlertCircle className="w-4 h-4" />
              }
              {message.text}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1 tracking-wide">
                AD SOYAD
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors rounded-lg"
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
              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors rounded-lg"
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
              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors rounded-lg"
              placeholder="Şifre (en az 6 karakter)"
              required
              minLength={6}
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
                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors rounded-lg"
                placeholder="Şifre Tekrar"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-neutral-500 hover:text-black transition-colors"
            >
              Şifremi unuttum
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2 rounded-lg"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="p-6 pt-0 text-center border-t border-neutral-100 mt-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setMessage(null);
            }}
            className="text-sm text-neutral-600 hover:text-black transition-colors"
          >
            {mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabım var'}
          </button>
        </div>
      </div>
    </div>
  );
}
