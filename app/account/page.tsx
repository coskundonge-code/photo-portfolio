'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { getSettings, getProjects, getUserOrders, updateProfile, Order } from '@/lib/supabase';
import { Settings, Project } from '@/lib/types';
import { Loader2, User, Package, Settings as SettingsIcon, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, member, loading: authLoading, signOut } = useAuth();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData] = await Promise.all([
        getSettings(),
        getProjects()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);

      if (user?.email) {
        const userOrders = await getUserOrders(user.email);
        setOrders(userOrders);
      }

      setLoading(false);
    };

    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (member) {
      setProfileForm({
        name: member.name || '',
        phone: member.phone || '',
      });
    }
  }, [member]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const result = await updateProfile(user.id, profileForm);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: t('auth.profileUpdated') });
    }

    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />

      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-light tracking-wide mb-2">{t('auth.myAccount')}</h1>
            <p className="text-neutral-500">
              {t('auth.welcomeBack')}, {member?.name || user.email}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-10 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 pb-4 text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-black text-black'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Package className="w-4 h-4" />
              {t('auth.myOrders')}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 pb-4 text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-black text-black'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              {t('auth.accountSettings')}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 pb-4 text-sm text-neutral-500 hover:text-red-600 transition-colors ml-auto"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>
          </div>

          {/* Content */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">{t('auth.noOrders')}</p>
                  <Link
                    href="/shop"
                    className="inline-block mt-6 px-8 py-3 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
                  >
                    {t('nav.shop')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-neutral-500">
                            {t('auth.orderDate')}: {formatDate(order.created_at || '')}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">#{order.id.slice(0, 8)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {t('auth.orderTotal')}: ₺{formatPrice(order.total_amount)}
                        </p>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-sm text-neutral-500 hover:text-black underline"
                        >
                          {t('auth.viewOrder')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md">
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                  </p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('auth.fullName')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none transition-colors"
                    placeholder={t('auth.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 focus:border-black outline-none transition-colors"
                    placeholder="+90 555 123 4567"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-black text-white text-sm hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('auth.updateProfile')}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
