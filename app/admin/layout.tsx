'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';
import {
  LayoutDashboard,
  ImageIcon,
  FolderOpen,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Globe,
  Package,
  Users
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth, logout } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Dual auth check: Zustand + localStorage
    const zustandAuth = checkAuth();
    const legacyAuth = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
    const isLoggedIn = zustandAuth || legacyAuth;

    if (!isLoggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setAuthChecked(true);
    }
  }, [checkAuth, pathname, router]);

  // Login sayfası için layout yok
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Auth kontrol edilene kadar bekle
  if (!authChecked) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/photos', label: 'Fotoğraflar', icon: ImageIcon },
    { href: '/admin/projects', label: 'Projeler', icon: FolderOpen },
    { href: '/admin/products', label: 'Ürünler', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Siparişler', icon: Package },
    { href: '/admin/members', label: 'Üyeler', icon: Users },
    { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="font-display text-xl text-white">Admin Panel</h1>
          <p className="text-xs text-neutral-500 mt-1">Site Yönetimi</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span>Siteyi Görüntüle</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
