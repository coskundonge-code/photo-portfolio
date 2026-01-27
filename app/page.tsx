import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MasonryGrid from '@/components/MasonryGrid';
import { Photo, Project } from '@/lib/types';

const demoPhotos: Photo[] = [
  { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90', project_id: '1', order_index: 1, created_at: '', updated_at: '' },
  { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=90', project_id: '1', order_index: 2, created_at: '', updated_at: '' },
  { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=90', project_id: '2', order_index: 3, created_at: '', updated_at: '' },
  { id: '4', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=90', project_id: '2', order_index: 4, created_at: '', updated_at: '' },
  { id: '5', title: 'Desert Sunset', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=90', project_id: '1', order_index: 5, created_at: '', updated_at: '' },
  { id: '6', title: 'Northern Lights', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=90', project_id: '2', order_index: 6, created_at: '', updated_at: '' },
  { id: '7', title: 'Waterfall', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=90', project_id: '1', order_index: 7, created_at: '', updated_at: '' },
  { id: '8', title: 'Autumn Colors', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=90', project_id: '2', order_index: 8, created_at: '', updated_at: '' },
];

const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={demoProjects} siteName="COŞKUN DÖNGE" />
      
      <section className="pt-24 pb-8">
        <div className="px-4 md:px-8">
          <MasonryGrid 
            photos={demoPhotos} 
            projects={demoProjects}
            showOverlay={true}
            linkToProject={true}
          />
        </div>
      </section>

      <Footer 
        siteName="COŞKUN DÖNGE"
        email="CoskunDonge@CoskunDonge.com"
        instagram="https://instagram.com/coskundonge"
      />
    </main>
  );
}
