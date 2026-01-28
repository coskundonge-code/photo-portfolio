'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon, FolderOpen, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { getPhotos, getProjects, getProducts } from '@/lib/supabase';
import { useAdminStore } from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, logout } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState({ photos: 0, projects: 0, products: 0 });

  // Auth kontrolü - HEM Zustand HEM localStorage
  useEffect(() => {
    const verifyAuth = () => {
      // Zustand store kontrolü
      const zustandAuth = checkAuth();
      // Legacy localStorage kontrolü
      const legacyAuth = localStorage.getItem('adminAuth') === 'true';
      
      if (zustandAuth || legacyAuth) {
        // Giriş yapılmış, dashboard'u göster
        setAuthChecked(true);
        loadStats();
      } else {
        // Giriş yapılmamış, login sayfasına yönlendir
        router.replace('/admin/login');
      }
    };
    
    // Kısa gecikme ile kontrol et (hydration için)
    const timer = setTimeout(verifyAuth, 100);
    return () => clearTimeout(timer);
  }, [checkAuth, router]);

  const loadStats = async () => {
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

  const handleLogout = () => {
    logout();
    localStorage.removeItem('adminAuth');
    router.push('/');
  };

  // Auth kontrol edilirken loading göster
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Dashboard
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
