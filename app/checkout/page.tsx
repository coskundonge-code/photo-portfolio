'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSettings, getProjects } from '@/lib/supabase';
import { useLanguage } from '@/lib/language';
import { Settings, Project } from '@/lib/types';
import { Loader2, Check, ShoppingBag, Copy, Lock } from 'lucide-react';

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
  const [emailOffers, setEmailOffers] = useState(true);
  const [useBillingAddress, setUseBillingAddress] = useState(true);
  const [discountCode, setDiscountCode] = useState('');

  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    country: 'Turkey',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    postalCode: '',
    city: '',
    phone: '',
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
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value.replace(/\s*\/\s*/g, ''));
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
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-medium mb-4">{t('checkout.orderPlaced')}</h1>
          <p className="text-neutral-600 mb-2">
            {t('checkout.orderNumber')}: <span className="font-medium">{orderNumber}</span>
          </p>
          <p className="text-neutral-500 mb-8">{t('checkout.thankYou')}</p>

          {paymentMethod === 'transfer' && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-medium mb-4">{t('checkout.bankInfo')}</h3>
              <div className="space-y-3 text-sm">
                <p><span className="text-neutral-500">{t('checkout.bankName')}:</span> Akbank</p>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">{t('checkout.accountHolder')}:</span>
                  <span className="font-medium">Coşkun Dönge</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Coşkun Dönge', 'accountHolder')}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {copiedField === 'accountHolder' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-500">{t('checkout.iban')}:</span>
                  <span className="font-mono text-xs">TR04 0004 6002 8788 8000 1937 83</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('TR040004600287888000193783', 'iban')}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {copiedField === 'iban' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mt-4 pt-4 border-t border-neutral-100">
                {t('checkout.transferNote')}
              </p>
            </div>
          )}

          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-sm rounded hover:bg-neutral-800 transition-colors"
          >
            {t('checkout.backToShop')}
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-xl font-medium mb-4">{t('checkout.emptyCart')}</h1>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-sm rounded hover:bg-neutral-800 transition-colors"
          >
            {t('checkout.backToShop')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Forms */}
        <div className="bg-white px-6 lg:px-12 xl:px-20 py-10 lg:py-16 order-2 lg:order-1">
          <div className="max-w-lg mx-auto lg:ml-auto lg:mr-0">
            {/* Logo/Back Link */}
            <Link href="/" className="text-xl font-light tracking-wide mb-10 block">
              {settings?.site_name || 'COŞKUN DÖNGE'}
            </Link>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">{t('checkout.contact')}</h2>
                  <Link href="/account" className="text-sm text-blue-600 hover:text-blue-700">
                    {t('checkout.signIn')}
                  </Link>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('checkout.emailOrPhone')}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <label className="flex items-center gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOffers}
                    onChange={(e) => setEmailOffers(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-600">{t('checkout.emailOffers')}</span>
                </label>
              </div>

              {/* Delivery Section */}
              <div>
                <h2 className="text-lg font-medium mb-4">{t('checkout.delivery')}</h2>
                <div className="space-y-3">
                  <div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    >
                      <option value="Turkey">{t('checkout.turkey')}</option>
                    </select>
                    <label className="text-xs text-neutral-500 mt-1 block">{t('checkout.countryRegion')}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={t('checkout.firstName')}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder={t('checkout.lastName')}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t('checkout.address')}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder={t('checkout.apartment')}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder={t('checkout.postalCode')}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={t('checkout.city')}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('checkout.phone')}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="text-lg font-medium mb-2">{t('checkout.payment')}</h2>
                <p className="text-sm text-neutral-500 mb-4">{t('checkout.securePayment')}</p>

                {/* Payment Options */}
                <div className="border border-neutral-300 rounded-lg overflow-hidden">
                  {/* Credit Card Option */}
                  <div
                    className={`border-b border-neutral-200 ${paymentMethod === 'card' ? 'bg-neutral-50' : ''}`}
                  >
                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{t('checkout.creditCard')}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full -ml-1 opacity-80"></div>
                        </div>
                      </div>
                    </label>
                    {paymentMethod === 'card' && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder={t('checkout.cardNumber')}
                            maxLength={19}
                            required={paymentMethod === 'card'}
                            className="w-full px-4 py-3 pr-10 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleExpiryChange}
                            placeholder={t('checkout.expiryDate')}
                            maxLength={7}
                            required={paymentMethod === 'card'}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                          />
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder={t('checkout.cvv')}
                            maxLength={4}
                            required={paymentMethod === 'card'}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          name="cardHolder"
                          value={formData.cardHolder}
                          onChange={handleInputChange}
                          placeholder={t('checkout.cardHolder')}
                          required={paymentMethod === 'card'}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useBillingAddress}
                            onChange={(e) => setUseBillingAddress(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-neutral-600">{t('checkout.useBillingAddress')}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Bank Transfer Option */}
                  <div className={paymentMethod === 'transfer' ? 'bg-neutral-50' : ''}>
                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{t('checkout.bankTransfer')}</span>
                    </label>
                    {paymentMethod === 'transfer' && (
                      <div className="px-4 pb-4">
                        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3 text-sm">
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
                                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                              >
                                {copiedField === 'accountHolder' ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-neutral-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-500">{t('checkout.iban')}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">TR04 0004 6002 8788 8000 1937 83</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('TR040004600287888000193783', 'iban')}
                                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                              >
                                {copiedField === 'iban' ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-neutral-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                            {t('checkout.transferNote')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Right Side - Order Summary (Sticky) */}
        <div className="bg-neutral-50 border-l border-neutral-200 order-1 lg:order-2 lg:relative">
          <div className="lg:fixed lg:top-0 lg:right-0 lg:w-1/2 lg:h-screen lg:overflow-y-auto px-6 lg:px-12 py-10 lg:py-16 bg-neutral-50">
            <div className="max-w-md mx-auto lg:mx-0">
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 bg-white border border-neutral-200 rounded-lg relative flex-shrink-0 overflow-hidden">
                      {item.photoUrl && (
                        <Image
                          src={item.photoUrl}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 rounded-full text-white text-xs flex items-center justify-center">
                        {item.quantity || 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.productTitle}</h3>
                      <p className="text-xs text-neutral-500">
                        {item.style} / {item.size?.name} / {item.frame?.name}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ₺{formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-neutral-200">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder={t('checkout.discountCode')}
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                />
                <button
                  type="button"
                  className="px-6 py-3 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
                >
                  {t('checkout.apply')}
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('checkout.subtotal')}</span>
                  <span>₺{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('checkout.shipping')}</span>
                  <span className="text-neutral-500">
                    {formData.address ? (shippingCost === 0 ? t('cart.free') : `₺${formatPrice(shippingCost)}`) : t('checkout.enterAddress')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-medium pt-4 border-t border-neutral-200">
                  <span>{t('checkout.total')}</span>
                  <span>₺{formatPrice(grandTotal)}</span>
                </div>
                {totalPrice < 5000 && (
                  <p className="text-xs text-neutral-500 text-right">
                    {t('checkout.freeShipping')}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={processing}
                className="w-full mt-6 py-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                {processing ? t('checkout.processing') : t('checkout.completeOrder')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
