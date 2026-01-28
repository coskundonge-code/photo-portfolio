'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon, FolderOpen, ShoppingBag, Package, Settings, ArrowRight, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { getPhotos, getProjects, getProducts } from '@/lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = checking
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ photos: 0, projects: 0, products: 0 });

  // İlk yüklemede giriş kontrolü - HİÇ ŞİFRE SORMA
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth === 'true') {
        setIsLoggedIn(true);
        loadStats();
      } else {
        setIsLoggedIn(false);
      }
    };
    
    // Kısa gecikme ile kontrol et (localStorage'ın yüklenmesini bekle)
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [photos, projects, products] = await Promise.all([
        getPhotos(),
        getProjects(),
        getProducts()
      ]);
      setStats({
        photos: photos.length,
        projects: projects.length,
        products: products.length
      });
    } catch (err) {
      console.error('Stats yüklenemedi:', err);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Şifre kontrolü
    if (password === 'admin123' || password === 'coskun2024') {
      localStorage.setItem('adminAuth', 'true');
      setIsLoggedIn(true);
      loadStats();
    } else {
      setError('Şifre yanlış');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsLoggedIn(false);
    setStats({ photos: 0, projects: 0, products: 0 });
  };

  // Henüz kontrol edilmedi - loading göster
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Login ekranı - SADECE giriş yapılmamışsa göster
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-neutral-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
            <p className="text-neutral-500 mt-2">Devam etmek için şifrenizi girin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard - Giriş yapılmış
  const cards = [
    { label: 'Fotoğraflar', value: stats.photos, icon: ImageIcon, href: '/admin/photos', color: 'bg-blue-500' },
    { label: 'Projeler', value: stats.projects, icon: FolderOpen, href: '/admin/projects', color: 'bg-green-500' },
    { label: 'Ürünler', value: stats.products, icon: ShoppingBag, href: '/admin/products', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-neutral-400 hover:text-white text-sm">
              Siteyi Görüntüle
            </Link>
            <button 
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-400 text-sm"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Dashboard</h2>
          <p className="text-neutral-400">Site yönetim paneline hoş geldiniz</p>
        </div>

        {/* Loading Stats */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link 
                    key={card.href} 
                    href={card.href} 
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-3xl font-semibold text-white mb-1">{card.value}</p>
                    <p className="text-sm text-neutral-400">{card.label}</p>
                  </Link>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Hızlı İşlemler</h3>
                <div className="space-y-2">
                  <Link href="/admin/photos" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                    📷 Fotoğraf Yükle
                  </Link>
                  <Link href="/admin/projects" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                    📁 Yeni Proje Oluştur
                  </Link>
                  <Link href="/admin/products" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                    🛒 Yeni Ürün Ekle
                  </Link>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Yardım</h3>
                <div className="space-y-3 text-sm text-neutral-400">
                  <p>1. <strong className="text-white">Projeler</strong> bölümünden kategoriler oluşturun</p>
                  <p>2. <strong className="text-white">Fotoğraflar</strong> bölümünden görselleri yükleyin</p>
                  <p>3. <strong className="text-white">Ürünler</strong> bölümünden satılacak fotoğrafları ekleyin</p>
                  <p>4. Ana sayfada görünecek fotoğrafları <strong className="text-white">öne çıkar</strong> işaretleyin</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
