import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getProjectBySlug, getPhotosByProject } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export default async function ProjectPage({ params }: PageProps) {
  const [settings, projects, project] = await Promise.all([
    getSettings(),
    getProjects(),
    getProjectBySlug(params.slug)
  ]);

  if (!project) {
    notFound();
  }

  const photos = await getPhotosByProject(project.id);

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16">
        <div className="px-6 lg:px-12 mb-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-light text-black mb-4">{project.title}</h1>
            {project.description && (
              <p className="text-neutral-500 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div className="px-6 lg:px-12">
            <p className="text-neutral-500">Bu projede henüz fotoğraf yok.</p>
          </div>
        ) : (
          <div className="px-2 md:px-4 lg:px-6">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-3 lg:gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="mb-2 md:mb-3 lg:mb-4 break-inside-avoid">
                  <Image
                    src={photo.url}
                    alt={photo.title || project.title}
                    width={800}
                    height={600}
                    quality={90}
                    className="w-full h-auto"
                  />
                  {photo.title && (
                    <p className="text-xs text-neutral-400 mt-2 px-1">{photo.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer settings={settings} />
    </main>
  );
}
