import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { getSettings, getProjects } from '@/lib/supabase';

export const revalidate = 60;

export default async function AboutPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    getProjects()
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Sol: Fotoğraf */}
            <div className="relative">
              {settings?.about_image ? (
                <div className="aspect-[4/5] relative">
                  <Image
                    src={settings.about_image}
                    alt={settings?.site_name || 'Fotoğrafçı'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-neutral-100 flex items-center justify-center">
                  <span className="text-neutral-400">Fotoğraf</span>
                </div>
              )}
            </div>

            {/* Sağ: İçerik */}
            <div className="lg:pt-8">
              <h1 className="text-4xl lg:text-5xl font-light mb-8 tracking-wide">
                Hakkımda
              </h1>
              
              <div className="prose prose-neutral max-w-none">
                {settings?.about_text ? (
                  <div 
                    className="text-neutral-600 leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{ 
                      __html: settings.about_text.replace(/\n/g, '<br/><br/>') 
                    }}
                  />
                ) : (
                  <div className="text-neutral-600 leading-relaxed space-y-6">
                    <p>
                      Merhaba, ben bir fotoğraf sanatçısıyım. Doğanın güzelliklerini, 
                      şehirlerin ruhunu ve anların büyüsünü yakalamaya çalışıyorum.
                    </p>
                    <p>
                      Her fotoğraf benim için bir hikaye anlatma fırsatı. Işığın ve gölgenin 
                      dansını, renklerin harmonisini ve kompozisyonun gücünü kullanarak 
                      duygusal bağ kuran görüntüler yaratmayı hedefliyorum.
                    </p>
                    <p>
                      Çalışmalarım müze kalitesinde malzemelerle basılıp çerçeveleniyor. 
                      Her parça, evinize sanat ve anlam katmak için özenle hazırlanıyor.
                    </p>
                  </div>
                )}
              </div>

              {/* İletişim Bilgileri */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h2 className="text-lg font-medium mb-6">İletişim</h2>
                
                <div className="space-y-4 text-sm">
                  {settings?.email && (
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-500 w-20">E-posta</span>
                      <a 
                        href={`mailto:${settings.email}`}
                        className="text-black hover:underline"
                      >
                        {settings.email}
                      </a>
                    </div>
                  )}
                  
                  {settings?.instagram && (
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-500 w-20">Instagram</span>
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
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-500 w-20">LinkedIn</span>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
