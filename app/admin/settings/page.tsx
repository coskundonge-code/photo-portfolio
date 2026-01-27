'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/supabase';
import { Settings } from '@/lib/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [aboutText, setAboutText] = useState('');

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
    });

    if (updated) {
      toast.success('Ayarlar kaydedildi!');
      setSettings(updated);
    } else {
      toast.error('Ayarlar kaydedilemedi!');
    }
    setSaving(false);
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
          <p className="text-neutral-400">Site bilgilerini buradan düzenleyebilirsiniz.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Kaydet</span>
        </button>
      </div>

      {/* Form */}
      <div className="max-w-2xl space-y-6">
        {/* Site Adı */}
        <div className="admin-card">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Site Adı
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="COŞKUN DÖNGE"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <p className="text-xs text-neutral-500 mt-2">
            Sitenin üst kısmında ve footer'da görünecek isim
          </p>
        </div>

        {/* Email */}
        <div className="admin-card">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Email Adresi
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <p className="text-xs text-neutral-500 mt-2">
            İletişim sayfasında ve footer'da görünecek email
          </p>
        </div>

        {/* Instagram */}
        <div className="admin-card">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Instagram Linki
          </label>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/kullaniciadi"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <p className="text-xs text-neutral-500 mt-2">
            Footer'daki Instagram ikonu bu linke yönlendirecek
          </p>
        </div>

        {/* Hakkımda */}
        <div className="admin-card">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Hakkımda Metni
          </label>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="Kendinizi tanıtan kısa bir metin yazın..."
            rows={5}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors resize-none"
          />
          <p className="text-xs text-neutral-500 mt-2">
            About sayfasında görünecek tanıtım metni
          </p>
        </div>
      </div>
    </div>
  );
}
