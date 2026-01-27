import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSettings, getProjects, getPhotosByProject } from '@/lib/supabase';

export const revalidate = 60;

export default async function WorkPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    getProjects()
  ]);

  // Her proje için ilk fotoğrafı al
  const projectsWithCovers = await Promise.all(
    projects.map(async (project) => {
      const photos = await getPhotosByProject(project.id);
      return {
        ...project,
        coverPhoto: photos[0]?.url || null
      };
    })
  );

  return (
    <main className="min-h-screen bg-white">
      <Navigation projects={projects} settings={settings} />
      
      <section className="pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-light text-black mb-12">
            {settings?.menu_work || 'Work'}
          </h1>
          
          {projectsWithCovers.length === 0 ? (
            <p className="text-neutral-500">Henüz proje eklenmemiş.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectsWithCovers.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/3] bg-neutral-100 mb-4 overflow-hidden">
                    {project.coverPhoto ? (
                      <Image
                        src={project.coverPhoto}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-neutral-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg text-black group-hover:opacity-70 transition-opacity">
                    {project.title}
                  </h2>
                  {project.description && (
                    <p className="text-sm text-neutral-500 mt-1">{project.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
