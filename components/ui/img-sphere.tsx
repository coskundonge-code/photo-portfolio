'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ImageData {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

export interface SphereImageGridProps {
  images?: ImageData[];
  containerSize?: number;
  sphereRadius?: number;
  dragSensitivity?: number;
  baseImageScale?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
  onImageClick?: (image: ImageData) => void;
  showModal?: boolean;
}

const SphereImageGrid: React.FC<SphereImageGridProps> = ({
  images = [],
  containerSize = 500,
  sphereRadius = 200,
  dragSensitivity = 0.005,
  baseImageScale = 0.08,
  autoRotate = true,
  autoRotateSpeed = 0.002,
  className = '',
  onImageClick,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0.3);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocityY = useRef(0);
  const animationRef = useRef<number>();

  const radius = sphereRadius || containerSize * 0.4;
  const imageSize = containerSize * baseImageScale;

  // Generate Fibonacci sphere positions
  const positions = React.useMemo(() => {
    const pts: { theta: number; phi: number }[] = [];
    const n = images.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      pts.push({
        theta,
        phi: Math.acos(y),
      });
    }
    return pts;
  }, [images.length]);

  // Animation loop
  useEffect(() => {
    if (!isMounted) return;

    const animate = () => {
      if (!isDragging.current) {
        // Auto rotation
        if (autoRotate) {
          setRotationY(prev => prev + autoRotateSpeed);
        }
        // Apply momentum
        if (Math.abs(velocityY.current) > 0.0001) {
          setRotationY(prev => prev + velocityY.current);
          velocityY.current *= 0.95;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMounted, autoRotate, autoRotateSpeed]);

  // Mouse/Touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocityY.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;

    setRotationY(prev => prev + deltaX * dragSensitivity);
    setRotationX(prev => Math.max(-1, Math.min(1, prev - deltaY * dragSensitivity)));

    velocityY.current = deltaX * dragSensitivity;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, [dragSensitivity]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate 3D positions for each image
  const getImageStyle = useCallback((index: number) => {
    const pos = positions[index];
    if (!pos) return { display: 'none' };

    // Spherical to Cartesian with rotation
    const cosRotY = Math.cos(rotationY);
    const sinRotY = Math.sin(rotationY);
    const cosRotX = Math.cos(rotationX);
    const sinRotX = Math.sin(rotationX);

    // Original position on sphere
    let x = radius * Math.sin(pos.phi) * Math.cos(pos.theta);
    let y = radius * Math.cos(pos.phi);
    let z = radius * Math.sin(pos.phi) * Math.sin(pos.theta);

    // Rotate around Y axis
    const x1 = x * cosRotY - z * sinRotY;
    const z1 = x * sinRotY + z * cosRotY;
    x = x1;
    z = z1;

    // Rotate around X axis
    const y1 = y * cosRotX - z * sinRotX;
    const z2 = y * sinRotX + z * cosRotX;
    y = y1;
    z = z2;

    // Scale based on depth (z position)
    const scale = (z + radius * 1.5) / (radius * 2.5);
    const clampedScale = Math.max(0.4, Math.min(1.2, scale));

    // Opacity based on depth
    const opacity = Math.max(0.3, Math.min(1, (z + radius) / (radius * 2) + 0.3));

    return {
      transform: `translate(-50%, -50%) scale(${clampedScale})`,
      left: `${containerSize / 2 + x}px`,
      top: `${containerSize / 2 + y}px`,
      zIndex: Math.round(z + radius),
      opacity,
    };
  }, [positions, rotationY, rotationX, radius, containerSize]);

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-neutral-400">No images</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ width: containerSize, height: containerSize }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {images.map((image, index) => {
        const style = getImageStyle(index);
        return (
          <div
            key={image.id}
            className="absolute rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform duration-100 hover:scale-110"
            style={{
              width: imageSize,
              height: imageSize,
              ...style,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.(image);
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SphereImageGrid;
