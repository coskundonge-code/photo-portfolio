'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    
    if (success) {
      toast.success('Welcome back!');
      router.push('/admin');
    } else {
      toast.error('Invalid password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl text-white mb-2">PORTFOLIO</h1>
          <p className="text-neutral-500">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="admin-card">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800">
            <Lock className="w-8 h-8 text-accent" />
          </div>

          <h2 className="text-xl text-center font-display mb-6">Enter Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-field pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-sm mt-6">
            Default password: admin123
          </p>
        </div>

        {/* Back to site */}
        <p className="text-center mt-8">
          <a href="/" className="text-neutral-500 hover:text-white transition-colors text-sm">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
