'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Save, Loader2, Upload, X, Globe, Menu, User, Mail } from 'lucide-react';
import { getSettings, updateSettings, uploadImage } from '@/lib/supabase';
import { Settings } from '@/lib/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [siteName, setSiteName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [footerText, setFooterText] = useState('');
  const [menuOverview, setMenuOverview] = useState('Overview');
  const [menuWork, setMenuWork] = useState('Work');
  const [menuShop, setMenuShop] = useState('Shop');
  const [menuAbout, setMenuAbout] = useState('About');
  const [menuContact, setMenuContact] = useState('Contact');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    if (data) {
      setSiteName(data.site_name || '');
      setEmail(data.email || '');
      setInstagram(data.instagram || '');
      setLinkedin(data.linkedin || '');
      setAboutText(data.about_text || '');
      setAboutImage(data.about_image || '');
      setFooterText(data.footer_text || '');
      setMenuOverview(data.menu_overview || 'Overview');
      setMenuWork(data.menu_work || 'Work');
      setMenuShop(data.menu_shop || 'Shop');
      setMenuAbout(data.menu_about || 'About');
      setMenuContact(data.menu_contact || 'Contact');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateSettings({
      site_name: siteName,
      email,
      instagram,
      linkedin,
      about_text: aboutText,
      about_image: aboutImage,
      footer_text: footerText,
      menu_overview: menuOverview,
      menu_work: menuWork,
      menu_shop: menuShop,
      menu_about: menuAbout,
      menu_contact: menuContact,
    });

    if (updated) {
      toast.success('Ayarlar kaydedildi!');
    } else {
      toast.error('Kaydetme başarısız!');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setAboutImage(url);
      toast.success('Fotoğraf yüklendi!');
    } else {
      toast.error('Yükleme başarısız!');
    }
    setUploading(false);
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: Globe },
    { id: 'menu', label: 'Menü', icon: Menu },
    { id: 'about', label: 'Hakkımda', icon: User },
    { id: 'contact', label: 'İletişim', icon: Mail },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Ayarlar</h1>
          <p className="text-neutral-400">Tüm site ayarlarını buradan yönetin</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Kaydet</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-neutral-800 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Site Adı / Logo Yazısı</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="COŞKUN DÖNGE"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
              <p className="text-xs text-neutral-500 mt-2">Sol üstte görünecek isim</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Footer Yazısı</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2024 Tüm hakları saklıdır."
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Menü Başlıkları</h3>
              <p className="text-sm text-neutral-400 mb-6">Navigasyonda görünecek menü isimlerini özelleştirin</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ana Sayfa', value: menuOverview, setter: setMenuOverview },
                  { label: 'Çalışmalar', value: menuWork, setter: setMenuWork },
                  { label: 'Mağaza', value: menuShop, setter: setMenuShop },
                  { label: 'Hakkımda', value: menuAbout, setter: setMenuAbout },
                  { label: 'İletişim', value: menuContact, setter: setMenuContact },
                ].map((item, i) => (
                  <div key={i}>
                    <label className="block text-sm text-neutral-400 mb-2">{item.label}</label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-4">Profil Fotoğrafı</label>

              <div className="flex items-start gap-6">
                {aboutImage ? (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                    <Image src={aboutImage} alt="About" fill className="object-cover" />
                    <button
                      onClick={() => setAboutImage('')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                        <span className="text-xs text-neutral-500">Yükle</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm text-neutral-400 mb-2">Hakkımda sayfasında görünecek fotoğraf</p>
                  {aboutImage && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-neutral-400 hover:text-white underline"
                    >
                      Değiştir
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Hakkımda Metni</label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Kendinizi tanıtan bir metin yazın..."
                rows={8}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 resize-none"
              />
              <p className="text-xs text-neutral-500 mt-2">Hakkımda sayfasında görünecek biyografi</p>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Instagram</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/kullaniciadi"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">LinkedIn</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/kullaniciadi"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
