import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { getSettings, getProjects } from '@/lib/supabase';

export const revalidate = 60;

export default async function ContactPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    getProjects()
  ]);

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
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
