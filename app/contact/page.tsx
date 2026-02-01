'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';
import { Settings, Project } from '@/lib/types';
import { Check, X } from 'lucide-react';

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success popup state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (you can replace this with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);

    // Show success popup
    setShowSuccess(true);
    setTimeout(() => setSuccessVisible(true), 50);
  };

  const closeSuccessPopup = () => {
    setSuccessVisible(false);
    setTimeout(() => setShowSuccess(false), 300);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />

      <section className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">

          <h1 className="text-4xl lg:text-5xl font-light mb-6 tracking-wide text-center">
            İletişim
          </h1>

          <p className="text-neutral-500 text-center mb-16 max-w-xl mx-auto">
            Sorularınız, işbirliği teklifleriniz veya sipariş ile ilgili konular için benimle iletişime geçebilirsiniz.
          </p>

          <div className="grid md:grid-cols-2 gap-12">

            {/* Sol: İletişim Bilgileri */}
            <div>
              <h2 className="text-lg font-medium mb-6">İletişim Bilgileri</h2>

              <div className="space-y-6">
                {settings?.email && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">E-posta</p>
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
                      LinkedIn Profili
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-neutral-200">
                <h3 className="font-medium mb-4">Sipariş Bilgileri</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Tüm baskılar sipariş üzerine hazırlanır. Teslimat süresi genellikle 2-3 haftadır.
                  Özel boyut veya çerçeve talepleri için lütfen e-posta ile iletişime geçin.
                </p>
              </div>
            </div>

            {/* Sağ: İletişim Formu */}
            <div>
              <h2 className="text-lg font-medium mb-6">Mesaj Gönderin</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    Adınız
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    Konu
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors bg-white"
                  >
                    <option value="">Konu Seçin</option>
                    <option value="order">Sipariş Hakkında</option>
                    <option value="custom">Özel Talep</option>
                    <option value="collab">İşbirliği</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-neutral-600 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Gönder'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      {/* Success Popup */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            backgroundColor: successVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
            transition: 'background-color 0.3s ease',
          }}
          onClick={closeSuccessPopup}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              opacity: successVisible ? 1 : 0,
              transform: successVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Close button */}
            <button
              onClick={closeSuccessPopup}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              {/* Success Icon */}
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center"
                style={{
                  opacity: successVisible ? 1 : 0,
                  transform: successVisible ? 'scale(1)' : 'scale(0.5)',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
                }}
              >
                <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium mb-6">
                Mesajınız Gönderildi
              </h3>

              {/* Close Button */}
              <button
                onClick={closeSuccessPopup}
                className="px-8 py-3 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
              >
                Tamam
              </button>
            </div>

            {/* Bottom accent line */}
            <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400" />
          </div>
        </div>
      )}
    </main>
  );
}
