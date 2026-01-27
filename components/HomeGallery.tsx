'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Photo, Project } from '@/lib/types';

interface HomeGalleryProps {
  photos: Photo[];
  projects: Project[];
}

export default function HomeGallery({ photos, projects }: HomeGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const getProject = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId);
  };

  if (photos.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-20 text-center">
        <p className="text-neutral-500">Henüz fotoğraf eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-4 lg:px-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-3 lg:gap-4">
        {photos.map((photo) => {
          const project = getProject(photo.project_id);
          const href = project ? `/work/${project.slug}` : '#';
          
          return (
            <Link
              key={photo.id}
              href={href}
              className={`block mb-2 md:mb-3 lg:mb-4 break-inside-avoid transition-opacity duration-500 ${
                loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative group overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  width={800}
                  height={600}
                  quality={90}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
