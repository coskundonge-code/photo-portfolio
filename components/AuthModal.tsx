'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Loader2, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { t } = useLanguage();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          // Translate common errors
          if (result.error.includes('Invalid login credentials')) {
            setError(t('auth.invalidCredentials'));
          } else if (result.error.includes('Email not confirmed')) {
            setError(t('auth.emailNotConfirmed'));
          } else {
            setError(result.error);
          }
        } else {
          onClose();
          // Reset form
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
      } else if (mode === 'register') {
        // Password validation
        if (formData.password !== formData.confirmPassword) {
          setError(t('auth.passwordMismatch'));
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError(t('auth.passwordTooShort'));
          setLoading(false);
          return;
        }

        const result = await signUp(formData.email, formData.password, formData.name);
        if (result.error) {
          if (result.error.includes('already registered')) {
            setError(t('auth.emailAlreadyExists'));
          } else {
            setError(result.error);
          }
        } else if (result.needsConfirmation) {
          setSuccess(t('auth.confirmEmail'));
        } else {
          onClose();
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(formData.email);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(t('auth.resetEmailSent'));
        }
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
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
            {mode === 'login' && t('auth.login').toUpperCase()}
            {mode === 'register' && t('auth.createAccount').toUpperCase()}
            {mode === 'forgot' && t('auth.forgotPassword').toUpperCase()}
          </h2>
          <p className="text-neutral-500 text-sm mb-8">
            {mode === 'login' && t('auth.loginSubtitle')}
            {mode === 'register' && t('auth.registerSubtitle')}
            {mode === 'forgot' && t('auth.forgotSubtitle')}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">
                  {t('auth.fullName').toUpperCase()}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    placeholder={t('auth.namePlaceholder')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">
                {t('auth.email').toUpperCase()}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black outline-none"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">
                  {t('auth.password').toUpperCase()}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                <label className="block text-xs font-medium text-neutral-500 mb-2">
                  {t('auth.confirmPassword').toUpperCase()}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                  onClick={() => switchMode('forgot')}
                  className="text-sm text-neutral-500 hover:text-black transition-colors"
                >
                  {t('auth.forgotPassword')}
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
                  {t('common.loading')}
                </>
              ) : (
                <>
                  {mode === 'login' && t('auth.login')}
                  {mode === 'register' && t('auth.register')}
                  {mode === 'forgot' && t('auth.sendResetLink')}
                </>
              )}
            </button>
          </form>

          {/* Alt Link */}
          <div className="mt-6 text-center">
            {mode === 'login' && (
              <button
                onClick={() => switchMode('register')}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                {t('auth.noAccount')} {t('auth.register')}
              </button>
            )}
            {mode === 'register' && (
              <button
                onClick={() => switchMode('login')}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                {t('auth.haveAccount')}
              </button>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => switchMode('login')}
                className="text-sm text-neutral-600 hover:text-black underline"
              >
                {t('auth.backToLogin')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
