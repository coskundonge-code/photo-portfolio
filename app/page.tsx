import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MasonryGrid from '@/components/MasonryGrid';
import { getSettings, getProjects, getPhotos } from '@/lib/supabase';
import { Photo, Project } from '@/lib/types';

// Demo data (veritabanı boşsa kullanılacak)
const demoPhotos: Photo[] = [
  { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90', project_id: '1', order_index: 1, created_at: '', updated_at: '' },
  { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=90', project_id: '1', order_index: 2, created_at: '', updated_at: '' },
  { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=90', project_id: '2', order_index: 3, created_at: '', updated_at: '' },
  { id: '4', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=90', project_id: '2', order_index: 4, created_at: '', updated_at: '' },
  { id: '5', title: 'Desert Sunset', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=90', project_id: '1', order_index: 5, created_at: '', updated_at: '' },
  { id: '6', title: 'Northern Lights', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=90', project_id: '2', order_index: 6, created_at: '', updated_at: '' },
];

const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

export const revalidate = 60; // Her 60 saniyede bir yenile

export default async function HomePage() {
  // Veritabanından verileri çek
  const settings = await getSettings();
  const dbProjects = await getProjects();
  const dbPhotos = await getPhotos();
  
  // Veritabanı boşsa demo verileri kullan
  const projects = dbProjects.length > 0 ? dbProjects : demoProjects;
  const photos = dbPhotos.length > 0 ? dbPhotos : demoPhotos;
  
  // Ayarlar
  const siteName = settings?.site_name || 'COŞKUN DÖNGE';
  const email = settings?.email || 'CoskunDonge@CoskunDonge.com';
  const instagram = settings?.instagram || 'https://instagram.com/coskundonge';

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} siteName={siteName} />
      
      <section className="pt-24 pb-8">
        <div className="px-4 md:px-8">
          <MasonryGrid 
            photos={photos} 
            projects={projects}
            showOverlay={true}
            linkToProject={true}
          />
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
