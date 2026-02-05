'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('E-posta adresiniz doğrulandı!');

          // Redirect after a short delay
          setTimeout(() => {
            router.push('/account');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Bir hata oluştu.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Doğrulanıyor...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-medium mb-2">Başarılı!</h1>
            <p className="text-neutral-600 mb-4">{message}</p>
            <p className="text-sm text-neutral-400">Yönlendiriliyorsunuz...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-medium mb-2">Hata</h1>
            <p className="text-neutral-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}
