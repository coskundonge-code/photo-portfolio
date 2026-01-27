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
}

export default function MasonryGrid({ 
  photos, 
  projects = [],
  showOverlay = true,
  linkToProject = false
}: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const getProjectByPhotoId = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId);
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => {
        const project = getProjectByPhotoId(photo.project_id);
        const href = linkToProject && project ? `/work/${project.slug}` : `/shop/${photo.id}`;
        
        return (
          <Link
            key={photo.id}
            href={href}
            className={`block break-inside-avoid mb-4 overflow-hidden transition-opacity duration-500 ${
              loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative group">
              <Image
                src={photo.url}
                alt={photo.title || 'Photo'}
                width={800}
                height={600}
                quality={90}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
              />
              
              {showOverlay && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end p-4">
                  <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {project && (
                      <p className="text-white text-xs uppercase tracking-wider mb-1">{project.title}</p>
                    )}
                    {photo.title && (
                      <p className="text-white text-sm font-medium">{photo.title}</p>
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

// Uniform Grid alternatifi
export function UniformGrid({ 
  photos, 
  projects = [],
  columns = 4
}: MasonryGridProps & { columns?: number }) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const getProjectByPhotoId = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId);
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
      {photos.map((photo) => {
        const project = getProjectByPhotoId(photo.project_id);
        
        return (
          <Link
            key={photo.id}
            href={`/work/${project?.slug || ''}`}
            className={`block aspect-square overflow-hidden transition-opacity duration-500 ${
              loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full group">
              <Image
                src={photo.url}
                alt={photo.title || 'Photo'}
                fill
                quality={90}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
              />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end p-4">
                <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {project && (
                    <p className="text-white text-xs uppercase tracking-wider">{project.title}</p>
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
