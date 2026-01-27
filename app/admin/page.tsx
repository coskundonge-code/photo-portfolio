'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageIcon, FolderOpen, ShoppingBag, Package, ArrowRight, Loader2 } from 'lucide-react';
import { getPhotos, getAllProjects, getAllProducts, getOrders } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ photos: 0, projects: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [photos, projects, products, orders] = await Promise.all([
        getPhotos(),
        getAllProjects(),
        getAllProducts(),
        getOrders()
      ]);
      setStats({
        photos: photos.length,
        projects: projects.length,
        products: products.length,
        orders: orders.length
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Fotoğraflar', value: stats.photos, icon: ImageIcon, href: '/admin/photos', color: 'bg-blue-500' },
    { label: 'Projeler', value: stats.projects, icon: FolderOpen, href: '/admin/projects', color: 'bg-green-500' },
    { label: 'Ürünler', value: stats.products, icon: ShoppingBag, href: '/admin/products', color: 'bg-purple-500' },
    { label: 'Siparişler', value: stats.orders, icon: Package, href: '/admin/orders', color: 'bg-orange-500' },
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
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white mb-2">Dashboard</h1>
        <p className="text-neutral-400">Site yönetim paneline hoş geldiniz</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="admin-card group hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-display text-white mb-1">{card.value}</p>
              <p className="text-sm text-neutral-400">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="text-lg font-medium text-white mb-4">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <Link href="/admin/photos" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
              Fotoğraf Yükle
            </Link>
            <Link href="/admin/projects" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
              Yeni Proje Oluştur
            </Link>
            <Link href="/admin/products" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
              Yeni Ürün Ekle
            </Link>
            <Link href="/admin/settings" className="block px-4 py-3 bg-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
              Site Ayarları
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-lg font-medium text-white mb-4">Nasıl Kullanılır?</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>1. <strong className="text-white">Projeler</strong> bölümünden fotoğraf kategorileri oluşturun</p>
            <p>2. <strong className="text-white">Fotoğraflar</strong> bölümünden görselleri yükleyin ve projelere atayın</p>
            <p>3. Ana sayfada görünmesini istediğiniz fotoğrafları <strong className="text-white">yıldız</strong> ile işaretleyin</p>
            <p>4. <strong className="text-white">Sürükleyerek</strong> fotoğraf ve proje sıralamasını değiştirin</p>
            <p>5. <strong className="text-white">Ayarlar</strong> bölümünden site bilgilerini düzenleyin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
