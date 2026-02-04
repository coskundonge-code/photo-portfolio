'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';
import { useLanguage } from '@/lib/language';
import { Settings, Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, projectsData] = await Promise.all([
        getSettings(),
        getProjects()
      ]);
      setSettings(settingsData);
      setProjects(projectsData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />

      <section className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">

          <h1 className="text-4xl lg:text-5xl font-light mb-6 tracking-wide text-center">
            {t('contact.title')}
          </h1>

          <p className="text-neutral-500 text-center mb-16 max-w-xl mx-auto">
            {t('contact.subtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-12">

            {/* Sol: İletişim Bilgileri */}
            <div>
              <h2 className="text-lg font-medium mb-6">{t('contact.contactInfo')}</h2>

              <div className="space-y-6">
                {settings?.email && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">{t('contact.email')}</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-black hover:underline"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}

                {settings?.instagram && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Instagram</p>
                    <a
                      href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:underline"
                    >
                      {settings.instagram}
                    </a>
                  </div>
                )}

                {settings?.linkedin && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">LinkedIn</p>
                    <a
                      href={settings.linkedin.startsWith('http') ? settings.linkedin : `https://linkedin.com/in/${settings.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:underline"
                    >
                      {t('about.linkedinProfile')}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-neutral-200">
                <h3 className="font-medium mb-4">{t('contact.orderInfo')}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {t('contact.orderInfoText')}
                </p>
              </div>
            </div>

            {/* Sağ: İletişim Formu */}
            <div>
              <h2 className="text-lg font-medium mb-6">{t('contact.sendMessage')}</h2>

              <form className="space-y-5">
                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('contact.yourName')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                    placeholder={t('contact.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('contact.subject')}
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors bg-white"
                  >
                    <option value="">{t('contact.selectSubject')}</option>
                    <option value="order">{t('contact.aboutOrder')}</option>
                    <option value="custom">{t('contact.customRequest')}</option>
                    <option value="collab">{t('contact.collaboration')}</option>
                    <option value="other">{t('contact.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    {t('contact.yourMessage')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
                >
                  {t('contact.send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
