'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CreditCard, Banknote, CheckCircle, User, UserX, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CartItem {
  productId: string;
  productTitle: string;
  photoUrl: string;
  style: string;
  size: { id: string; name: string; dimensions: string; price: number };
  frame: { id: string; name: string; color: string; price: number };
  price: number;
  quantity: number;
}

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'auth' | 'form' | 'payment' | 'success'>('auth');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Auth states
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    notes: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'credit_card'>('bank_transfer');

  // Kullanıcı ve sepet kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Kullanıcı bilgilerini doldur
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
        }));
        setStep('form');
      }
      setCheckingAuth(false);
    };
    
    checkAuth();
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      if (parsedCart.length === 0) {
        router.push('/shop');
      }
    } else {
      router.push('/shop');
    }
    setLoading(false);
  }, [router]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Üye Girişi
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) throw error;

      setUser(data.user);
      setFormData(prev => ({
        ...prev,
        name: data.user?.user_metadata?.name || '',
        email: data.user?.email || '',
      }));
      setStep('form');
    } catch (error: any) {
      setAuthError(error.message === 'Invalid login credentials' 
        ? 'E-posta veya şifre yanlış' 
        : error.message);
    }
    setAuthLoading(false);
  };

  // Kayıt
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });

      if (error) throw error;

      // Direkt devam et (e-posta doğrulama zorunlu değilse)
      if (data.user) {
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          email: data.user?.email || '',
        }));
        setStep('form');
      }
    } catch (error: any) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  // Misafir devam
  const handleGuestContinue = () => {
    setStep('form');
  };

  // Sipariş gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          address: formData.address,
          district: formData.district,
          city: formData.city,
          postal_code: formData.postalCode,
        },
        items: cart,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending',
        notes: formData.notes,
      };

      const { error } = await supabase.from('orders').insert([orderData]);

      if (error) throw error;

      // Sepeti temizle
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      setStep('success');
    } catch (err: any) {
      console.error('Sipariş hatası:', err);
      alert('Sipariş oluşturulamadı: ' + err.message);
    }
    setSubmitting(false);
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Başarılı sipariş
  if (step === 'success') {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Siparişiniz Alındı!</h1>
          <p className="text-neutral-600 mb-8">
            Siparişiniz başarıyla oluşturuldu. 
            {paymentMethod === 'bank_transfer' && ' Havale/EFT bilgileri e-posta adresinize gönderilecek.'}
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-neutral-500 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            <span>Mağazaya Dön</span>
          </Link>
          <h1 className="text-lg font-semibold">Ödeme</h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Sol: Form */}
          <div className="lg:col-span-2">
            
            {/* ADIM 1: Auth */}
            {step === 'auth' && (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-6">Devam Et</h2>
                
                {/* Üye Girişi */}
                {authMode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-900 font-medium">Üye Girişi</p>
                        <p className="text-blue-700 text-sm">Kayıtlı bilgilerinizle hızlı ödeme yapın</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">E-posta</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Şifre</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>

                    {authError && (
                      <p className="text-red-500 text-sm">{authError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-black text-white rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
                    >
                      {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                      Giriş Yap ve Devam Et
                    </button>
                  </form>
                )}

                {/* Kayıt */}
                {authMode === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <User className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-green-900 font-medium">Hesap Oluştur</p>
                        <p className="text-green-700 text-sm">Siparişlerinizi takip edin</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">E-posta</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Şifre (en az 6 karakter)</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>

                    {authError && (
                      <p className="text-red-500 text-sm">{authError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-black text-white rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
                    >
                      {authLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                      Kayıt Ol ve Devam Et
                    </button>
                  </form>
                )}

                {/* Geçiş linkleri */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  {authMode === 'login' ? (
                    <>
                      <button
                        onClick={() => setAuthMode('register')}
                        className="w-full py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700"
                      >
                        Hesap Oluştur
                      </button>
                      <button
                        onClick={handleGuestContinue}
                        className="w-full py-3 text-neutral-500 hover:text-black flex items-center justify-center gap-2"
                      >
                        <UserX className="w-5 h-5" />
                        Üye Olmadan Devam Et
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setAuthMode('login')}
                        className="w-full py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700"
                      >
                        Zaten Hesabım Var
                      </button>
                      <button
                        onClick={handleGuestContinue}
                        className="w-full py-3 text-neutral-500 hover:text-black flex items-center justify-center gap-2"
                      >
                        <UserX className="w-5 h-5" />
                        Üye Olmadan Devam Et
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ADIM 2: İletişim ve Teslimat */}
            {step === 'form' && (
              <form onSubmit={handleSubmit}>
                {user && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-900 font-medium">Hoş geldiniz, {user.user_metadata?.name || user.email}</p>
                      <p className="text-green-700 text-sm">Kayıtlı bilgileriniz otomatik dolduruldu</p>
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-semibold mb-4">İletişim Bilgileri</h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">E-posta</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Adres</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">İlçe</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Şehir</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Posta Kodu</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h2>
                <div className="space-y-3 mb-8">
                  <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === 'bank_transfer' ? 'border-black bg-neutral-50' : 'hover:bg-neutral-50'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="w-5 h-5"
                    />
                    <Banknote className="w-6 h-6 text-neutral-600" />
                    <div>
                      <p className="font-medium">Havale / EFT</p>
                      <p className="text-sm text-neutral-500">Sipariş sonrası banka bilgileri paylaşılacaktır</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer opacity-50`}>
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="w-5 h-5"
                    />
                    <CreditCard className="w-6 h-6 text-neutral-600" />
                    <div>
                      <p className="font-medium">Kredi Kartı</p>
                      <p className="text-sm text-neutral-500">Yakında aktif olacak</p>
                    </div>
                  </label>
                </div>

                <div className="mb-8">
                  <label className="block text-sm text-neutral-600 mb-1">Sipariş Notu (Opsiyonel)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="Varsa eklemek istediğiniz notlar..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white text-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Siparişi Tamamla
                </button>
              </form>
            )}
          </div>

          {/* Sağ: Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden relative flex-shrink-0">
                      <Image
                        src={item.photoUrl || '/placeholder.jpg'}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productTitle}</p>
                      <p className="text-xs text-neutral-500">
                        {item.size.name} • {item.frame.name} • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                      </p>
                      <p className="text-sm mt-1">₺{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Ara Toplam</span>
                  <span>₺{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Toplam</span>
                  <span>₺{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
