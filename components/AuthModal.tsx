'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { signIn, signUp, resetPassword, getMemberByEmail } from '@/lib/supabase';
import { useUserStore } from '@/lib/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { setUser } = useUserStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setSuccess(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setMessage(getErrorMessage(error));
        } else {
          setSuccess(true);
          setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        }
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setMessage('Şifreler eşleşmiyor');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setMessage('Şifre en az 6 karakter olmalıdır');
          setLoading(false);
          return;
        }

        const { user, error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setMessage(getErrorMessage(error));
        } else if (user) {
          setSuccess(true);
          setMessage('Hesabınız oluşturuldu! E-posta adresinize gönderilen onay bağlantısına tıklayın.');
        }
      } else {
        const { user, error } = await signIn(formData.email, formData.password);
        if (error) {
          setMessage(getErrorMessage(error));
        } else if (user) {
          const member = await getMemberByEmail(user.email!);
          if (member) {
            if (!member.is_active) {
              setMessage('Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
              setLoading(false);
              return;
            }
            setUser(member);
          }
          setSuccess(true);
          setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err) {
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const getErrorMessage = (error: string): string => {
    if (error.includes('Invalid login credentials')) {
      return 'E-posta veya şifre hatalı';
    }
    if (error.includes('Email not confirmed')) {
      return 'E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.';
    }
    if (error.includes('User already registered')) {
      return 'Bu e-posta adresi zaten kayıtlı';
    }
    if (error.includes('Password should be at least')) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (error.includes('rate limit')) {
      return 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.';
    }
    return error;
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
            {mode === 'login' ? 'GİRİŞ YAP' : mode === 'register' ? 'HESAP OLUŞTUR' : 'ŞİFREMİ UNUTTUM'}
          </h2>
          <p className="text-neutral-500 text-sm mb-8">
            {mode === 'login'
              ? 'Siparişlerinizi takip edin ve özel fırsatlardan haberdar olun.'
              : mode === 'register'
              ? 'Üye olarak siparişlerinizi kolayca takip edebilirsiniz.'
              : 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.'}
          </p>

          {/* Mesaj */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm flex items-start gap-3 ${
              success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {success && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <span>{message}</span>
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

            {mode !== 'forgot' && (
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
            )}

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

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setMessage(''); }}
                  className="text-sm text-neutral-500 hover:text-black"
                >
                  Şifremi unuttum
                </button>
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
                mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Bağlantı Gönder'
              )}
            </button>
          </form>

          {/* Alt Link */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' ? (
              <button
                onClick={() => { setMode('register'); setMessage(''); setSuccess(false); }}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                Hesabınız yok mu? Kayıt olun
              </button>
            ) : (
              <button
                onClick={() => { setMode('login'); setMessage(''); setSuccess(false); }}
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
