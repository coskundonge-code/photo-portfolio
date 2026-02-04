'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from './translations/en.json';
import tr from './translations/tr.json';

type Language = 'en' | 'tr';

const translations = { en, tr };

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang: Language) => set({ language: lang }),
      t: (key: string) => {
        const lang = get().language;
        const keys = key.split('.');
        let value: any = translations[lang];

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // Fallback to English if key not found
            value = translations['en'];
            for (const fallbackKey of keys) {
              if (value && typeof value === 'object' && fallbackKey in value) {
                value = value[fallbackKey];
              } else {
                return key; // Return key if not found
              }
            }
            break;
          }
        }

        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
