import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSettings();
  const projects = await getProjects();
  
  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const email = settings?.email || 'CoskunDonge@CoskunDonge.com';
  const instagram = settings?.instagram || 'https://instagram.com/coskundonge';
  const aboutText = settings?.about_text || 'Fotoğraf sanatçısı ve görsel hikaye anlatıcısı.';
  const aboutImage = settings?.about_image || '';
  const menuAbout = settings?.menu_about || 'About';

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} siteName={siteName} settings={settings} />
      
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            {aboutImage && (
              <div className="relative aspect-[4/5] bg-neutral-100">
                <Image
                  src={aboutImage}
                  alt={siteName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className={aboutImage ? '' : 'lg:col-span-2'}>
              <h1 className="font-display text-4xl md:text-5xl text-neutral-900 mb-8">
                {menuAbout}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-neutral-600 text-lg leading-relaxed whitespace-pre-line">
                  {aboutText}
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h2 className="font-display text-2xl text-neutral-900 mb-4">İletişim</h2>
                <p className="text-neutral-600">
                  Email: <a href={`mailto:${email}`} className="text-neutral-900 hover:underline">{email}</a>
                </p>
                <p className="text-neutral-600 mt-2">
                  Instagram: <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-900 hover:underline">@{instagram.split('/').pop()}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer 
        siteName={siteName}
        email={email}
        instagram={instagram}
      />
    </main>
  );
}
