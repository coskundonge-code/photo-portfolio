import IntroSphere from '@/components/IntroSphere';
import { getPhotos, getFeaturedPhotos, getSettings } from '@/lib/supabase';

export const revalidate = 60;

export default async function HomePage() {
  const [allPhotos, featuredPhotos, settings] = await Promise.all([
    getPhotos(),
    getFeaturedPhotos(),
    getSettings()
  ]);

  // Featured fotoğraflar varsa onları göster, yoksa tümünü göster
  const photos = featuredPhotos.length > 0 ? featuredPhotos : allPhotos;

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Site name */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-2xl md:text-3xl font-light tracking-[0.3em] text-neutral-800 uppercase">
          {settings?.site_name || 'Portfolio'}
        </h1>
      </div>

      {/* Sphere */}
      <IntroSphere photos={photos} />

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-sm text-neutral-500 tracking-wide">
          Keşfetmek için sürükleyin, görüntülemek için tıklayın
        </p>
      </div>
    </main>
  );
}
