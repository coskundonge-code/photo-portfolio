import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

// Admin şifreleri
const ADMIN_PASSWORDS = ['Astakoz1!'];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      
      login: (password: string) => {
        if (ADMIN_PASSWORDS.includes(password)) {
          set({ isAuthenticated: true });
          // Footer ile senkronizasyon için eski key'i de set et
          if (typeof window !== 'undefined') {
            localStorage.setItem('adminAuth', 'true');
          }
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ isAuthenticated: false });
        // Footer ile senkronizasyon
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminAuth');
        }
      },
      
      // Footer'dan giriş yapılmışsa kontrol et
      checkAuth: () => {
        if (typeof window !== 'undefined') {
          const legacyAuth = localStorage.getItem('adminAuth') === 'true';
          const currentAuth = get().isAuthenticated;
          
          // Footer'dan giriş yapılmışsa Zustand'ı da güncelle
          if (legacyAuth && !currentAuth) {
            set({ isAuthenticated: true });
            return true;
          }
          
          return currentAuth || legacyAuth;
        }
        return get().isAuthenticated;
      },
    }),
    {
      name: 'admin-auth',
    }
  )
);
