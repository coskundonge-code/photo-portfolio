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
      const [s, p] = await Promise.all([getSettings(), getProjects()]);
      setSettings(s);
      setProjects(p);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success('Mesajınız gönderildi!');
    setName('');
    setEmail('');
    setMessage('');
  };

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
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-light text-black mb-4">
            {settings?.menu_contact || 'Contact'}
          </h1>
          <p className="text-neutral-500 mb-8">
            İş birliği ve sorularınız için benimle iletişime geçin.
          </p>
          
          {settings?.email && (
            <p className="text-neutral-600 mb-8">
              Email: <a href={`mailto:${settings.email}`} className="text-black hover:underline">{settings.email}</a>
            </p>
          )}

          {sent ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl text-black mb-2">Teşekkürler!</h2>
              <p className="text-neutral-500">En kısa sürede dönüş yapacağım.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-neutral-600 mb-2">Adınız</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-600 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-600 mb-2">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="input-field resize-none"
                />
              </div>
              
              <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>{sending ? 'Gönderiliyor...' : 'Gönder'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
