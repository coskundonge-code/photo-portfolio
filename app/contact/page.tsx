'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';
import { Settings, Project } from '@/lib/types';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
    setSending(true);
    
    // Simüle edilmiş gönderim
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSending(false);
    setSent(true);
    toast.success('Mesajınız gönderildi!');
    
    setName('');
    setEmail('');
    setMessage('');
  };

  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const contactEmail = settings?.email || 'CoskunDonge@CoskunDonge.com';
  const instagram = settings?.instagram || 'https://instagram.com/coskundonge';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} siteName={siteName} />
      
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-neutral-900 mb-4">
            İletişim
          </h1>
          <p className="text-neutral-600 mb-8">
            Sorularınız veya işbirliği teklifleriniz için bana ulaşabilirsiniz.
          </p>
          
          <div className="mb-12">
            <p className="text-neutral-600">
              Email: <a href={`mailto:${contactEmail}`} className="text-neutral-900 hover:underline">{contactEmail}</a>
            </p>
          </div>

          {sent ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-display text-neutral-900 mb-2">Teşekkürler!</h2>
              <p className="text-neutral-600">Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağım.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adınız
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Adınızı girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Email adresinizi girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mesajınız
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Mesajınızı yazın"
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{sending ? 'Gönderiliyor...' : 'Gönder'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer 
        siteName={siteName}
        email={contactEmail}
        instagram={instagram}
      />
    </main>
  );
}
