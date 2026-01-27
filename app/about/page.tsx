import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects } from '@/lib/supabase';

export const revalidate = 60;

export default async function AboutPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    getProjects()
  ]);

  const aboutImage = settings?.about_image;
  const aboutText = settings?.about_text || '';
  const email = settings?.email;

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Image */}
            {aboutImage && (
              <div className="relative aspect-[3/4] bg-neutral-100">
                <Image
                  src={aboutImage}
                  alt="About"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            {/* Content */}
            <div className={aboutImage ? '' : 'lg:col-span-2 max-w-2xl'}>
              <h1 className="text-4xl font-light text-black mb-8">
                {settings?.menu_about || 'About'}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {aboutText}
                </p>
              </div>

              {email && (
                <div className="mt-12 pt-8 border-t border-neutral-200">
                  <p className="text-neutral-600">
                    İletişim için: <a href={`mailto:${email}`} className="text-black hover:underline">{email}</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
