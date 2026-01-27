'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Trash2, 
  GripVertical, 
  Edit2, 
  Check, 
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Photo } from '@/lib/types';

// Demo photos
const initialPhotos: Photo[] = [
  { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', project_id: '1', order_index: 1, created_at: '', updated_at: '' },
  { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400', project_id: '1', order_index: 2, created_at: '', updated_at: '' },
  { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', project_id: '2', order_index: 3, created_at: '', updated_at: '' },
  { id: '4', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400', project_id: '2', order_index: 4, created_at: '', updated_at: '' },
];

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Dropzone for file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Add new photo (in real app, upload to Supabase)
      const newPhoto: Photo = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: previewUrl,
        order_index: photos.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      toast.success(`Uploaded: ${file.name}`);
    }
    
    setIsUploading(false);
  }, [photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  // Delete photo
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast.success('Photo deleted');
    }
  };

  // Edit title
  const startEditing = (photo: Photo) => {
    setEditingId(photo.id);
    setEditTitle(photo.title || '');
  };

  const saveTitle = (id: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, title: editTitle } : p
    ));
    setEditingId(null);
    toast.success('Title updated');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = photos.findIndex(p => p.id === draggedId);
    const targetIndex = photos.findIndex(p => p.id === targetId);

    const newPhotos = [...photos];
    const [draggedItem] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedItem);

    // Update order indices
    const updatedPhotos = newPhotos.map((p, i) => ({
      ...p,
      order_index: i + 1
    }));

    setPhotos(updatedPhotos);
    setDraggedId(null);
    toast.success('Order updated');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Photos</h1>
          <p className="text-neutral-400">Manage your photo gallery. Drag to reorder.</p>
        </div>
        <div className="text-neutral-500">
          {photos.length} photos
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`admin-card mb-8 cursor-pointer transition-all ${
          isDragActive 
            ? 'border-accent bg-accent/5' 
            : 'border-dashed hover:border-neutral-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-12">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-white">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className={`w-12 h-12 mb-4 ${isDragActive ? 'text-accent' : 'text-neutral-500'}`} />
              <p className="text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop photos here'}
              </p>
              <p className="text-neutral-500 text-sm">
                or click to browse (JPG, PNG, WebP)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, photo.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, photo.id)}
              className={`admin-card p-0 overflow-hidden group cursor-move transition-all ${
                draggedId === photo.id ? 'opacity-50 scale-95' : ''
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-neutral-800">
                <Image
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  fill
                  className="object-cover"
                />
                
                {/* Drag Handle Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <GripVertical className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs font-mono rounded">
                  #{photo.order_index}
                </div>
              </div>

              {/* Title */}
              <div className="p-3">
                {editingId === photo.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 text-white text-sm rounded"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle(photo.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <button
                      onClick={() => saveTitle(photo.id)}
                      className="p-1 text-green-500 hover:text-green-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-neutral-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm truncate">
                      {photo.title || 'Untitled'}
                    </p>
                    <button
                      onClick={() => startEditing(photo)}
                      className="p-1 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card text-center py-20">
          <ImageIcon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 mb-2">No photos yet</p>
          <p className="text-neutral-500 text-sm">Upload your first photo to get started</p>
        </div>
      )}
    </div>
  );
}
