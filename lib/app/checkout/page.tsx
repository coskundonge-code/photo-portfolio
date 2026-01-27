'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, ArrowLeft, Check, CreditCard, Building2, Copy, Shield } from 'lucide-react';
import { createOrder, createOrderItem, createCustomer } from '@/lib/supabase';

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

type CheckoutStep = 'cart' | 'info' | 'payment' | 'success';

const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

// Banka bilgileri
const bankInfo = {
  name: 'Coşkun Dönge',
  bank: 'Akbank',
  iban: 'TR 04 0004 6002 8788 8000 1937 83',
};

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Ödeme yöntemi
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('transfer');
  
  // Müşteri bilgileri
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    createAccount: false,
    password: '',
  });
  
  // Sipariş bilgisi
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const isInfoValid = () => {
    return (
      customerInfo.email.includes('@') &&
      customerInfo.name.length > 2 &&
      customerInfo.phone.length >= 10 &&
      customerInfo.address.length > 5 &&
      customerInfo.city.length > 2
    );
  };

  // Kopyalama fonksiyonu
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Sipariş gönder
  const handleSubmitOrder = async () => {
    setSubmitting(true);
    
    try {
      const customer = await createCustomer({
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        postal_code: customerInfo.postalCode,
        is_guest: !customerInfo.createAccount,
      });

      const order = await createOrder({
        customer_id: customer?.id,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: `${customerInfo.address}, ${customerInfo.city} ${customerInfo.postalCode}`,
        total_amount: total,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'transfer' ? 'awaiting_transfer' : 'pending',
      });

      if (order) {
        for (const item of cart) {
          await createOrderItem({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            size_name: item.size.name,
            frame_name: item.frame.name,
            style: item.style,
            unit_price: item.price,
          });
        }

        setOrderId(order.id);
        localStorage.removeItem('cart');
        setCart([]);
        window.dispatchEvent(new Event('cartUpdated'));
        setStep('success');
      }
    } catch (error) {
      console.error('Sipariş hatası:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Başarı Sayfası
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-black mb-2">
            Siparişiniz Alındı!
          </h1>
          <p className="text-neutral-500 mb-4">
            Sipariş numaranız: <span className="font-mono text-black">#{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
          
          {paymentMethod === 'transfer' && (
            <div className="bg-neutral-50 p-6 rounded-lg text-left mb-6">
              <h3 className="font-medium mb-4">Havale Bilgileri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Ad Soyad:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankInfo.name}</span>
                    <button 
                      onClick={() => copyToClipboard(bankInfo.name, 'name')}
                      className="p-1 hover:bg-neutral-200 rounded"
                    >
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
                    <button 
                      onClick={() => copyToClipboard(bankInfo.iban, 'iban')}
                      className="p-1 hover:bg-neutral-200 rounded"
                    >
                      {copiedField === 'iban' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-neutral-500">Tutar:</span>
                  <span className="font-bold">₺{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                Açıklama kısmına sipariş numaranızı yazınız.
              </p>
            </div>
          )}

          <p className="text-neutral-500 mb-8">
            Sipariş detaylarını <strong>{customerInfo.email}</strong> adresine gönderdik.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  // Boş sepet
  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-black mb-4">Sepetiniz Boş</h1>
          <p className="text-neutral-500 mb-8">Henüz ürün eklememişsiniz.</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Mağazaya Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Alışverişe Dön</span>
          </Link>
          
          {/* Adımlar */}
          <div className="flex items-center gap-4">
            {['cart', 'info', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-neutral-300" />}
                <div className={`flex items-center gap-2 ${step === s ? 'text-black' : 'text-neutral-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === s ? 'bg-black text-white' : 'bg-neutral-200'
                  }`}>{i + 1}</span>
                  <span className="hidden sm:inline text-sm">
                    {s === 'cart' ? 'Sepet' : s === 'info' ? 'Bilgiler' : 'Ödeme'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Sol: Form */}
          <div className="lg:col-span-2">
            
            {/* ADIM 1: Sepet */}
            {step === 'cart' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Sepetiniz ({cart.length} ürün)</h2>
                
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-neutral-200 rounded-lg">
                      <div className="relative w-24 h-24 bg-neutral-100 flex-shrink-0">
                        <Image
                          src={item.photoUrl || '/placeholder.jpg'}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-black">{item.productTitle}</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          {item.size.name} ({item.size.dimensions}) • {item.frame.name} • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                        </p>
                        <p className="font-medium mt-2">₺{formatPrice(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('info')}
                  className="w-full mt-6 py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
                >
                  Devam Et
                </button>
              </div>
            )}

            {/* ADIM 2: Bilgiler */}
            {step === 'info' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">İletişim Bilgileri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">E-posta</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                        placeholder="0555 555 55 55"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-medium mt-8 mb-6">Teslimat Adresi</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Adres</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                      rows={2}
                      placeholder="Mahalle, Sokak, Bina No, Daire No"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">İl</label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">Posta Kodu</label>
                      <input
                        type="text"
                        value={customerInfo.postalCode}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hesap oluşturma */}
                <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerInfo.createAccount}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm">Hesap oluştur ve siparişlerimi takip et</span>
                  </label>
                  
                  {customerInfo.createAccount && (
                    <div className="mt-4">
                      <label className="block text-sm text-neutral-600 mb-1">Şifre</label>
                      <input
                        type="password"
                        value={customerInfo.password}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, password: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                        placeholder="En az 6 karakter"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep('cart')}
                    className="px-6 py-3 border border-neutral-300 text-sm hover:bg-neutral-50 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    disabled={!isInfoValid()}
                    className="flex-1 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
                  >
                    Ödemeye Geç
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 3: Ödeme */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Ödeme Yöntemi</h2>
                
                {/* Ödeme yöntemleri */}
                <div className="space-y-3 mb-8">
                  {/* Havale */}
                  <label 
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'transfer' ? 'border-black' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="w-5 h-5 mt-0.5" 
                    />
                    <Building2 className="w-6 h-6 text-neutral-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Havale / EFT</p>
                      <p className="text-sm text-neutral-500 mt-1">Banka hesabına havale yaparak ödeyin</p>
                      
                      {paymentMethod === 'transfer' && (
                        <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                          <h4 className="text-sm font-medium mb-3">Hesap Bilgileri</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">Ad Soyad:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{bankInfo.name}</span>
                                <button 
                                  onClick={() => copyToClipboard(bankInfo.name, 'name')}
                                  className="p-1 hover:bg-neutral-200 rounded"
                                  title="Kopyala"
                                >
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
                                <button 
                                  onClick={() => copyToClipboard(bankInfo.iban, 'iban')}
                                  className="p-1 hover:bg-neutral-200 rounded"
                                  title="Kopyala"
                                >
                                  {copiedField === 'iban' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                  
                  {/* Kredi Kartı */}
                  <label 
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-black' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5 mt-0.5" 
                    />
                    <CreditCard className="w-6 h-6 text-neutral-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Kredi / Banka Kartı</p>
                      <p className="text-sm text-neutral-500 mt-1">Visa, Mastercard, Troy</p>
                      
                      {paymentMethod === 'card' && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm text-neutral-600 mb-1">Kart Numarası</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-neutral-600 mb-1">Son Kullanma</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                                placeholder="AA/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-neutral-600 mb-1">CVV</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Güvenlik */}
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
                  <Shield className="w-4 h-4" />
                  <span>256-bit SSL ile güvenli ödeme</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('info')}
                    className="px-6 py-3 border border-neutral-300 text-sm hover:bg-neutral-50 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="flex-1 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      `₺${formatPrice(total)} Öde`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sağ: Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h3 className="font-medium mb-4">Sipariş Özeti</h3>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative w-12 h-12 bg-neutral-100 flex-shrink-0">
                      <Image
                        src={item.photoUrl || '/placeholder.jpg'}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productTitle}</p>
                      <p className="text-xs text-neutral-500">{item.size.name}</p>
                    </div>
                    <p className="text-sm font-medium">₺{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 pt-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Ara Toplam</span>
                  <span>₺{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : `₺${formatPrice(shipping)}`}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-neutral-200">
                  <span>Toplam</span>
                  <span>₺{formatPrice(total)}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-500">
                <p>✓ Ücretsiz kargo (₺2.000 üstü)</p>
                <p>✓ 30 gün iade garantisi</p>
                <p>✓ Güvenli ödeme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
