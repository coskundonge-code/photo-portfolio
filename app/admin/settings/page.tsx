'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Site Ayarları
  const [settings, setSettings] = useState({
    site_name: '',
    email: '',
    phone: '',
    instagram: '',
    about_text: '',
    admin_password: '',
  });

  // Şifre Değiştirme
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (data) {
        setSettings({
          site_name: data.site_name || '',
          email: data.email || '',
          phone: data.phone || '',
          instagram: data.instagram || '',
          about_text: data.about_text || '',
          admin_password: data.admin_password || 'admin123',
        });
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Önce mevcut kayıt var mı kontrol et
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .single();

      if (existing) {
        // Güncelle
        const { error } = await supabase
          .from('settings')
          .update({
            site_name: settings.site_name,
            email: settings.email,
            phone: settings.phone,
            instagram: settings.instagram,
            about_text: settings.about_text,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Yeni oluştur
        const { error } = await supabase
          .from('settings')
          .insert({
            site_name: settings.site_name,
            email: settings.email,
            phone: settings.phone,
            instagram: settings.instagram,
            about_text: settings.about_text,
            admin_password: 'admin123',
          });

        if (error) throw error;
      }

      setSuccess('Ayarlar kaydedildi!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Kaydetme başarısız');
    }

    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validasyonlar
    if (!newPassword) {
      setPasswordError('Yeni şifre gerekli');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Şifre en az 4 karakter olmalı');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      return;
    }

    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ admin_password: newPassword })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({
            admin_password: newPassword,
            site_name: settings.site_name || 'Coşkun Dönge',
          });

        if (error) throw error;
      }

      setSettings({ ...settings, admin_password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Şifre değiştirildi!');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Şifre değiştirme başarısız');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-8">Ayarlar</h1>

      {/* Başarı/Hata Mesajları */}
      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-900/30 border border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Site Ayarları */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-white mb-6">Site Bilgileri</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Site Adı</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Coşkun Dönge"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">E-posta</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Telefon</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+90 555 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Instagram</label>
            <input
              type="text"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="@kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Hakkında Metni</label>
            <textarea
              value={settings.about_text}
              onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Kısa biyografi..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-neutral-600"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </button>
      </div>

      {/* Şifre Değiştirme */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-medium text-white">Admin Şifresi</h2>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          Mevcut şifre: <span className="text-neutral-300">{showPassword ? settings.admin_password : '••••••'}</span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4 inline" /> : <Eye className="w-4 h-4 inline" />}
          </button>
        </p>

        {passwordSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-green-900/30 border border-green-800 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-green-400 text-sm">{passwordSuccess}</p>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-400 text-sm">{passwordError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="En az 4 karakter"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Şifre Tekrar</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Şifreyi tekrar girin"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={saving || !newPassword || !confirmPassword}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:bg-neutral-600"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          Şifreyi Değiştir
        </button>
      </div>
    </div>
  );
}
