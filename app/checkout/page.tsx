'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Copy, CreditCard, Building2, ChevronLeft } from 'lucide-react';

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

const bankInfo = {
  name: 'Coşkun Dönge',
  bank: 'Akbank',
  iban: 'TR 04 0004 6002 8788 8000 1937 83',
};

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Ödeme yöntemi
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('transfer');
  
  // Müşteri bilgileri
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    // Kart bilgileri
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  // Kopyalama durumu
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
    setLoading(false);
  }, []);

  // TOPLAM TUTAR HESAPLAMA - DÜZELTİLDİ
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Her ürün için fiyat: boyut fiyatı + çerçeve fiyatı
      const itemPrice = (item.size?.price || 0) + (item.frame?.price || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Sipariş numarası oluştur
    const newOrderId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setOrderId(newOrderId);

    // Simülasyon - gerçekte Supabase'e kayıt yapılacak
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Sepeti temizle
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));

    setSubmitting(false);
    setOrderComplete(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Sipariş tamamlandı
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold mb-2">Siparişiniz Alındı!</h1>
          <p className="text-neutral-600 mb-6">
            Sipariş numaranız: <span className="font-mono font-semibold">#{orderId}</span>
          </p>

          {paymentMethod === 'transfer' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">Havale Bilgileri</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Ad Soyad:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankInfo.name}</span>
                    <button onClick={() => copyToClipboard(bankInfo.name, 'name')} className="text-neutral-400 hover:text-black">
                      {copiedField === 'name' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Banka:</span>
                  <span className="font-medium">{bankInfo.bank}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">IBAN:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{bankInfo.iban}</span>
                    <button onClick={() => copyToClipboard(bankInfo.iban, 'iban')} className="text-neutral-400 hover:text-black">
                      {copiedField === 'iban' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-neutral-500">Tutar:</span>
                  <span className="font-semibold text-lg">₺{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              
              <p className="text-xs text-neutral-500 mt-4">
                Açıklama kısmına sipariş numaranızı yazınız.
              </p>
            </div>
          )}

          <p className="text-sm text-neutral-500 mb-6">
            Sipariş detaylarını <strong>{formData.email}</strong> adresine gönderdik.
          </p>

          <Link
            href="/shop"
            className="inline-block w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  // Sepet boş
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Sepetiniz Boş</h1>
          <Link href="/shop" className="text-black underline">Mağazaya Git</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black">
            <ChevronLeft className="w-4 h-4" />
            Mağazaya Dön
          </Link>
          <span className="font-semibold">Ödeme</span>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Sol: Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* İletişim Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold mb-4">İletişim Bilgileri</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">E-posta</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Adres</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Şehir</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Posta Kodu</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h2>
                <div className="space-y-3">
                  {/* Havale */}
                  <label 
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'transfer' ? 'border-black bg-neutral-50' : 'border-neutral-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="w-5 h-5"
                    />
                    <Building2 className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Havale / EFT</p>
                      <p className="text-sm text-neutral-500">Banka havalesi ile ödeme</p>
                    </div>
                  </label>

                  {/* Kredi Kartı */}
                  <label 
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-black bg-neutral-50' : 'border-neutral-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5"
                    />
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Kredi / Banka Kartı</p>
                      <p className="text-sm text-neutral-500">Güvenli online ödeme</p>
                    </div>
                  </label>
                </div>

                {/* Havale Bilgileri */}
                {paymentMethod === 'transfer' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      Sipariş onaylandıktan sonra aşağıdaki hesaba havale yapabilirsiniz:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Ad Soyad:</span>
                        <span className="font-medium text-blue-900">{bankInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Banka:</span>
                        <span className="font-medium text-blue-900">{bankInfo.bank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">IBAN:</span>
                        <span className="font-mono text-xs text-blue-900">{bankInfo.iban}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kart Bilgileri */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Kart Numarası</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Son Kullanma</label>
                        <input
                          type="text"
                          placeholder="AA/YY"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="000"
                          value={formData.cardCvv}
                          onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      🔒 256-bit SSL ile korunmaktadır
                    </p>
                  </div>
                )}
              </div>

              {/* Sipariş Ver Butonu */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  `Siparişi Tamamla — ₺${formatPrice(calculateTotal())}`
                )}
              </button>
            </form>
          </div>

          {/* Sağ: Sipariş Özeti */}
          <div>
            <div className="bg-neutral-50 p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-20 bg-neutral-200 relative flex-shrink-0">
                      {item.photoUrl && (
                        <Image src={item.photoUrl} alt={item.productTitle} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.productTitle}</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {item.size?.name} • {item.frame?.name} • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                      </p>
                      <p className="text-sm mt-1">
                        ₺{formatPrice((item.size?.price || 0) + (item.frame?.price || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Ara Toplam</span>
                  <span>₺{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Toplam</span>
                  <span>₺{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
