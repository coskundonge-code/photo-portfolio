'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Photo, Project } from '@/lib/types';

interface MasonryGridProps {
  photos: Photo[];
  projects?: Project[];
  showOverlay?: boolean;
  linkToProject?: boolean;
  linkToShop?: boolean;
}

export default function MasonryGrid({ 
  photos, 
  projects = [],
  showOverlay = true,
  linkToProject = true,
  linkToShop = false,
}: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const getProjectForPhoto = (photo: Photo) => {
    return projects.find(p => p.id === photo.project_id);
  };

  const getLink = (photo: Photo) => {
    if (linkToShop) return `/shop/${photo.id}`;
    if (linkToProject) {
      const project = getProjectForPhoto(photo);
      return project ? `/work/${project.slug}` : '#';
    }
    return '#';
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => {
        const project = getProjectForPhoto(photo);
        const isLoaded = loadedImages.has(photo.id);
        
        return (
          <Link
            key={photo.id}
            href={getLink(photo)}
            className={`masonry-item block break-inside-avoid opacity-0 ${
              isLoaded ? 'animate-fade-in' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative overflow-hidden bg-neutral-900">
              <Image
                src={photo.url}
                alt={photo.title || 'Photo'}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                onLoad={() => handleImageLoad(photo.id)}
              />
              
              {showOverlay && (
                <div className="overlay">
                  <div className="overlay-content">
                    {project && (
                      <span className="text-xs uppercase tracking-wider text-accent mb-1 block">
                        {project.title}
                      </span>
                    )}
                    {photo.title && (
                      <h3 className="text-lg font-display text-white">
                        {photo.title}
                      </h3>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Alternative: Uniform Grid (daha düzenli görünüm için)
export function UniformGrid({ 
  photos, 
  projects = [],
  columns = 4,
}: MasonryGridProps & { columns?: number }) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const getProjectForPhoto = (photo: Photo) => {
    return projects.find(p => p.id === photo.project_id);
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-1`}>
      {photos.map((photo, index) => {
        const project = getProjectForPhoto(photo);
        const isLoaded = loadedImages.has(photo.id);
        
        return (
          <Link
            key={photo.id}
            href={project ? `/work/${project.slug}` : '#'}
            className={`masonry-item block aspect-square opacity-0 ${
              isLoaded ? 'animate-fade-in' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative w-full h-full overflow-hidden bg-neutral-900">
              <Image
                src={photo.url}
                alt={photo.title || 'Photo'}
                fill
                className="object-cover"
                onLoad={() => handleImageLoad(photo.id)}
              />
              
              <div className="overlay">
                <div className="overlay-content">
                  {project && (
                    <span className="text-xs uppercase tracking-wider text-accent mb-1 block">
                      {project.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
