import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeGallery from '@/components/HomeGallery';
import { getSettings, getProjects, getPhotos, getFeaturedPhotos } from '@/lib/supabase';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, projects, allPhotos, featuredPhotos] = await Promise.all([
    getSettings(),
    getProjects(),
    getPhotos(),
    getFeaturedPhotos()
  ]);

  // Featured fotoğraflar varsa onları göster, yoksa tümünü göster
  const photos = featuredPhotos.length > 0 ? featuredPhotos : allPhotos;

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />

      <section className="pt-20 lg:pt-24">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-pulse text-neutral-400">Loading...</div></div>}>
          <HomeGallery photos={photos} projects={projects} />
        </Suspense>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
