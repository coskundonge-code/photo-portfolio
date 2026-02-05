'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';
import { useLanguage } from '@/lib/language';
import { Settings, Project } from '@/lib/types';
import { Loader2, CreditCard, Building2, Check, ShoppingBag, Copy } from 'lucide-react';

interface CartItem {
  productId: string;
  productTitle: string;
  photoUrl: string;
  style: string;
  size: { name: string; dimensions: string; price: number };
  frame: { name: string; color: string; price: number };
  price: number;
  quantity: number;
}

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Turkey',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData] = await Promise.all([
        getSettings(),
        getProjects()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);

      // Load cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
      setLoading(false);
    };
    loadData();
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shippingCost = totalPrice >= 5000 ? 0 : 150;
  const grandTotal = totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value.replace('/', ''));
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate order number
    const orderNum = 'ORD-' + Date.now().toString(36).toUpperCase();
    setOrderNumber(orderNum);

    // Clear cart
    localStorage.setItem('cart', '[]');
    window.dispatchEvent(new Event('cartUpdated'));

    setOrderPlaced(true);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Order placed success screen
  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation projects={projects} settings={settings} />
        <section className="pt-28 pb-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-light mb-4">{t('checkout.orderPlaced')}</h1>
            <p className="text-neutral-600 mb-2">
              {t('checkout.orderNumber')}: <span className="font-medium">{orderNumber}</span>
            </p>
            <p className="text-neutral-500 mb-8">{t('checkout.thankYou')}</p>

            {paymentMethod === 'transfer' && (
              <div className="bg-neutral-50 border border-neutral-200 p-6 mb-8 text-left">
                <h3 className="font-medium mb-4">{t('checkout.bankInfo')}</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="text-neutral-500">{t('checkout.bankName')}:</span> Akbank</p>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">{t('checkout.accountHolder')}:</span>
                    <span className="font-medium">Coşkun Dönge</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('Coşkun Dönge', 'accountHolder')}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                      title={t('checkout.copy')}
                    >
                      {copiedField === 'accountHolder' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-500">{t('checkout.iban')}:</span>
                    <span className="font-mono text-xs sm:text-sm">TR04 0004 6002 8788 8000 1937 83</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('TR040004600287888000193783', 'iban')}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                      title={t('checkout.copy')}
                    >
                      {copiedField === 'iban' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-4">{t('checkout.transferNote')}</p>
              </div>
            )}

            <Link
              href="/shop"
              className="inline-block px-8 py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
            >
              {t('checkout.backToShop')}
            </Link>
          </div>
        </section>
        <Footer settings={settings} />
      </main>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation projects={projects} settings={settings} />
        <section className="pt-28 pb-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <ShoppingBag className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
            <h1 className="text-2xl font-light mb-4">{t('checkout.emptyCart')}</h1>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
            >
              {t('checkout.backToShop')}
            </Link>
          </div>
        </section>
        <Footer settings={settings} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />

      <section className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-light mb-10 text-center">{t('checkout.title')}</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Left: Forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="border border-neutral-200 p-6">
                  <h2 className="text-lg font-medium mb-6">{t('checkout.contactInfo')}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">{t('checkout.firstName')}</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">{t('checkout.lastName')}</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">{t('checkout.email')}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">{t('checkout.phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border border-neutral-200 p-6">
                  <h2 className="text-lg font-medium mb-6">{t('checkout.shippingAddress')}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">{t('checkout.address')}</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{t('checkout.city')}</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{t('checkout.postalCode')}</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{t('checkout.country')}</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors bg-white"
                        >
                          <option value="Turkey">{t('checkout.turkey')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-neutral-200 p-6">
                  <h2 className="text-lg font-medium mb-6">{t('checkout.paymentMethod')}</h2>

                  {/* Payment Method Selection */}
                  <div className="flex gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>{t('checkout.creditCard')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all ${
                        paymentMethod === 'transfer'
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>{t('checkout.bankTransfer')}</span>
                    </button>
                  </div>

                  {/* Credit Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{t('checkout.cardNumber')}</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          required={paymentMethod === 'card'}
                          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{t('checkout.cardHolder')}</label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={formData.cardHolder}
                          onChange={handleInputChange}
                          required={paymentMethod === 'card'}
                          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors uppercase"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-neutral-600 mb-2">{t('checkout.expiryDate')}</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required={paymentMethod === 'card'}
                            className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 mb-2">{t('checkout.cvv')}</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder="000"
                            maxLength={4}
                            required={paymentMethod === 'card'}
                            className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === 'transfer' && (
                    <div className="bg-neutral-50 p-6">
                      <h3 className="font-medium mb-4">{t('checkout.bankInfo')}</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">{t('checkout.bankName')}:</span>
                          <span className="font-medium">Akbank</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">{t('checkout.accountHolder')}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Coşkun Dönge</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard('Coşkun Dönge', 'accountHolder')}
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                              title={t('checkout.copy')}
                            >
                              {copiedField === 'accountHolder' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-neutral-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">{t('checkout.iban')}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs sm:text-sm">TR04 0004 6002 8788 8000 1937 83</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard('TR040004600287888000193783', 'iban')}
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                              title={t('checkout.copy')}
                            >
                              {copiedField === 'iban' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-neutral-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500 mt-4 pt-4 border-t border-neutral-200">
                        {t('checkout.transferNote')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-neutral-200 p-6 sticky top-28">
                  <h2 className="text-lg font-medium mb-6">{t('checkout.orderSummary')}</h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-neutral-100 relative flex-shrink-0">
                          {item.photoUrl && (
                            <Image
                              src={item.photoUrl}
                              alt={item.productTitle}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">{item.productTitle}</h3>
                          <p className="text-xs text-neutral-500">
                            {item.size?.name} • {item.frame?.name}
                          </p>
                          <p className="text-sm font-medium mt-1">₺{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t('checkout.subtotal')} ({cartItems.length} {t('checkout.items')})</span>
                      <span>₺{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t('checkout.shipping')}</span>
                      <span>{shippingCost === 0 ? t('cart.free') : `₺${formatPrice(shippingCost)}`}</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium pt-3 border-t border-neutral-200">
                      <span>{t('checkout.total')}</span>
                      <span>₺{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                    {processing ? t('checkout.processing') : t('checkout.placeOrder')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
