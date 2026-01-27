'use client';

import Link from 'next/link';
import { ImageIcon, FolderOpen, ShoppingBag, Eye } from 'lucide-react';

export default function AdminDashboard() {
  // Demo stats
  const stats = [
    { label: 'Total Photos', value: '24', icon: ImageIcon, href: '/admin/photos' },
    { label: 'Projects', value: '4', icon: FolderOpen, href: '/admin/projects' },
    { label: 'Products', value: '12', icon: ShoppingBag, href: '/admin/products' },
    { label: 'Site Views', value: '1,234', icon: Eye, href: '#' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white mb-2">Dashboard</h1>
        <p className="text-neutral-400">Welcome back! Here's an overview of your portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="admin-card hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-display text-white">{stat.value}</p>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-xl font-display text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/photos"
            className="admin-card hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <ImageIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Upload Photos</p>
                <p className="text-neutral-500 text-sm">Add new photos to your gallery</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/projects"
            className="admin-card hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <FolderOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Create Project</p>
                <p className="text-neutral-500 text-sm">Organize photos into projects</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="admin-card hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <ShoppingBag className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Add Product</p>
                <p className="text-neutral-500 text-sm">Create prints for sale</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-display text-white mb-4">Getting Started</h2>
        <div className="admin-card">
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-mono text-sm">
                1
              </div>
              <div>
                <p className="text-white font-medium">Upload your photos</p>
                <p className="text-neutral-500 text-sm">
                  Go to Photos section and upload your best work. Supported formats: JPG, PNG, WebP.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-mono text-sm">
                2
              </div>
              <div>
                <p className="text-white font-medium">Organize into projects</p>
                <p className="text-neutral-500 text-sm">
                  Create projects to group related photos. Projects appear in the Work dropdown menu.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-mono text-sm">
                3
              </div>
              <div>
                <p className="text-white font-medium">Create products for sale</p>
                <p className="text-neutral-500 text-sm">
                  Turn photos into products with custom pricing. Set open or collector editions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-mono text-sm">
                4
              </div>
              <div>
                <p className="text-white font-medium">Connect Supabase</p>
                <p className="text-neutral-500 text-sm">
                  Set up your .env.local file with Supabase credentials to enable database storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
