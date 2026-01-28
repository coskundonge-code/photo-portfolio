'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  frameColor: string;
  size: { name: string; dimensions: string; scale: number };
}

// Oda görselleri - gerçek projede bunlar public klasöründe olmalı
const rooms = [
  {
    id: 'living',
    name: 'Oturma Odası',
    bgColor: '#f5f0eb',
    wallColor: '#e8e4df',
  },
  {
    id: 'bedroom',
    name: 'Yatak Odası',
    bgColor: '#f0f0f0',
    wallColor: '#e5e5e5',
  },
  {
    id: 'office',
    name: 'Çalışma Odası',
    bgColor: '#f8f6f3',
    wallColor: '#eae6e1',
  },
];

export default function RoomPreview({ isOpen, onClose, imageUrl, frameColor, size }: RoomPreviewProps) {
  const [currentRoom, setCurrentRoom] = useState(0);

  if (!isOpen) return null;

  const room = rooms[currentRoom];
  
  // Boyuta göre çerçeve ölçeği
  const frameScale = size.scale || 0.85;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Room name */}
      <div className="absolute top-6 left-6 text-white/70 text-sm tracking-wide">
        {room.name}
      </div>

      {/* Previous room */}
      <button
        onClick={() => setCurrentRoom(i => (i > 0 ? i - 1 : rooms.length - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      {/* Room Preview */}
      <div 
        className="relative w-[90vw] max-w-4xl aspect-[4/3] rounded-lg overflow-hidden"
        style={{ backgroundColor: room.bgColor }}
      >
        {/* Duvar */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 70%, ${room.bgColor} 70%)` 
          }}
        />

        {/* Çerçeveli Fotoğraf - Duvarda */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
          style={{ transform: `translate(-50%, -50%) scale(${frameScale})` }}
        >
          {/* Dış Çerçeve */}
          <div 
            className="relative"
            style={{ 
              backgroundColor: frameColor,
              padding: '8px',
              boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.05)'
            }}
          >
            {/* Mat */}
            <div 
              className="bg-white relative"
              style={{ padding: '24px' }}
            >
              {/* 3D çizgi */}
              <div 
                className="absolute inset-[22px] pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}
              />
              
              {/* Fotoğraf */}
              <div className="relative w-[280px] h-[200px]">
                <Image
                  src={imageUrl || '/placeholder.jpg'}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Gölge */}
          <div 
            className="absolute -bottom-2 left-[10%] right-[10%] h-4"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, transparent 70%)'
            }}
          />
        </div>

        {/* Mobilya hint - basit */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] bg-gradient-to-t from-[#d4cfc8] to-transparent opacity-30" />
      </div>

      {/* Next room */}
      <button
        onClick={() => setCurrentRoom(i => (i < rooms.length - 1 ? i + 1 : 0))}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      {/* Room selector dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {rooms.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentRoom(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentRoom === index ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Size info */}
      <div className="absolute bottom-6 right-6 text-white/70 text-sm">
        {size.name} • {size.dimensions}
      </div>
    </div>
  );
}
