'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SphereImageGrid, { ImageData } from '@/components/ui/img-sphere';
import { Photo } from '@/lib/types';

interface IntroSphereProps {
  photos: Photo[];
}

export default function IntroSphere({ photos }: IntroSphereProps) {
  const router = useRouter();
  const [containerSize, setContainerSize] = useState(500);

  // Responsive container size
  useEffect(() => {
    const updateSize = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      // Use 80% of the smaller dimension, max 700px
      setContainerSize(Math.min(minDimension * 0.8, 700));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Convert photos to ImageData format for sphere
  const sphereImages: ImageData[] = photos.map((photo) => ({
    id: photo.id,
    src: photo.url,
    alt: photo.title || 'Photo',
    title: photo.title,
    description: photo.projects?.title
  }));

  // Handle image click - navigate to gallery and scroll to photo
  const handleImageClick = (image: ImageData) => {
    // Navigate to gallery page with photo ID as query parameter
    router.push(`/gallery?photoId=${image.id}`);
  };

  return (
    <div className="flex items-center justify-center">
      <SphereImageGrid
        images={sphereImages}
        containerSize={containerSize}
        sphereRadius={containerSize * 0.4}
        dragSensitivity={0.6}
        momentumDecay={0.96}
        maxRotationSpeed={8}
        baseImageScale={0.12}
        hoverScale={1.3}
        perspective={1200}
        autoRotate={true}
        autoRotateSpeed={0.4}
        onImageClick={handleImageClick}
        showModal={false}
      />
    </div>
  );
}
