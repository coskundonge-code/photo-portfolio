'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Save, Loader2, Upload, X } from 'lucide-react';
import { getSettings, updateSettings, uploadImage } from '@/lib/supabase';
import { Settings } from '@/lib/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [siteName, setSiteName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [menuOverview, setMenuOverview] = useState('');
  const [menuWork, setMenuWork] = useState('');
  const [menuShop, setMenuShop] = useState('');
  const [menuAbout, setMenuAbout] = useState('');
  const [menuContact, setMenuContact] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    if (data) {
      setSettings(data);
      setSiteName(data.site_name || '');
      setEmail(data.email || '');
      setInstagram(data.instagram || '');
      setAboutText(data.about_text || '');
      setAboutImage(data.about_image || '');
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
      email: email,
      instagram: instagram,
      about_text: aboutText,
      about_image: aboutImage,
      menu_overview: menuOverview,
      menu_work: menuWork,
      menu_shop: menuShop,
      menu_about: menuAbout,
      menu_contact: menuContact,
    });

    if (updated) {
      toast.success('Ayarlar kaydedildi!');
      setSettings(updated);
    } else {
      toast.error('Ayarlar kaydedilemedi!');
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
      toast.error('Fotoğraf yüklenemedi!');
    }
    setUploading(false);
  };

  const removeImage = () => {
    setAboutImage('');
  };

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
          <h1 className="text-3xl font-display text-white mb-2">Site Ayarları</h1>
          <p className="text-neutral-400">Tüm site ayarlarını buradan yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Kaydet</span>
        </button>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Genel Ayarlar */}
        <div>
          <h2 className="text-xl font-display text-white mb-4">Genel Ayarlar</h2>
          <div className="space-y-4">
            <div className="admin-card">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Site Adı</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="COŞKUN DÖNGE"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="admin-card">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="admin-card">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Instagram</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/kullaniciadi"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* Menü Başlıkları */}
        <div>
          <h2 className="text-xl font-display text-white mb-4">Menü Başlıkları</h2>
          <div className="admin-card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Ana Sayfa</label>
                <input
                  type="text"
                  value={menuOverview}
                  onChange={(e) => setMenuOverview(e.target.value)}
                  placeholder="Overview"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Çalışmalar</label>
                <input
                  type="text"
                  value={menuWork}
                  onChange={(e) => setMenuWork(e.target.value)}
                  placeholder="Work"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Mağaza</label>
                <input
                  type="text"
                  value={menuShop}
                  onChange={(e) => setMenuShop(e.target.value)}
                  placeholder="Shop"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Hakkımda</label>
                <input
                  type="text"
                  value={menuAbout}
                  onChange={(e) => setMenuAbout(e.target.value)}
                  placeholder="About"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">İletişim</label>
                <input
                  type="text"
                  value={menuContact}
                  onChange={(e) => setMenuContact(e.target.value)}
                  placeholder="Contact"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hakkımda */}
        <div>
          <h2 className="text-xl font-display text-white mb-4">Hakkımda Sayfası</h2>
          <div className="space-y-4">
            <div className="admin-card">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Hakkımda Fotoğrafı</label>
              
              {aboutImage ? (
                <div className="relative w-48 h-48 mb-4">
                  <Image
                    src={aboutImage}
                    alt="About"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                      <span className="text-sm text-neutral-500">Fotoğraf Yükle</span>
                    </>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {aboutImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm text-neutral-400 hover:text-white"
                >
                  Değiştir
                </button>
              )}
            </div>

            <div className="admin-card">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Hakkımda Metni</label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Kendinizi tanıtan bir metin yazın..."
                rows={6}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
