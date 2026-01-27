'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2, GripVertical, X } from 'lucide-react';
import { getPhotos, getAllProjects, createPhoto, updatePhoto, deletePhoto, uploadImage } from '@/lib/supabase';
import { Photo, Project } from '@/lib/types';
import toast from 'react-hot-toast';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [photosData, projectsData] = await Promise.all([
      getPhotos(),
      getAllProjects()
    ]);
    setPhotos(photosData.sort((a, b) => a.order_index - b.order_index));
    setProjects(projectsData);
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadImage(file);
      
      if (url) {
        const newPhoto = await createPhoto({
          title: file.name.split('.')[0],
          url: url,
          order_index: photos.length + i,
        });
        
        if (newPhoto) {
          setPhotos(prev => [...prev, newPhoto]);
        }
      }
    }
    
    toast.success(`${files.length} fotoğraf yüklendi!`);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;

    const success = await deletePhoto(id);
    if (success) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast.success('Fotoğraf silindi!');
    } else {
      toast.error('Silme işlemi başarısız!');
    }
  };

  const handleProjectChange = async (photoId: string, projectId: string) => {
    const result = await updatePhoto(photoId, { 
      project_id: projectId || undefined 
    });
    
    if (result) {
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, project_id: projectId || undefined } : p
      ));
      toast.success('Proje güncellendi!');
    }
  };

  const handleTitleChange = async (photoId: string, title: string) => {
    const result = await updatePhoto(photoId, { title });
    if (result) {
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, title } : p
      ));
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, photo: Photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetPhoto: Photo) => {
    e.preventDefault();
    
    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) {
      setDraggedPhoto(null);
      return;
    }

    const draggedIndex = photos.findIndex(p => p.id === draggedPhoto.id);
    const targetIndex = photos.findIndex(p => p.id === targetPhoto.id);

    const newPhotos = [...photos];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedPhoto);

    // Update order_index for all affected photos
    const updatedPhotos = newPhotos.map((photo, index) => ({
      ...photo,
      order_index: index
    }));

    setPhotos(updatedPhotos);

    // Save new order to database
    for (const photo of updatedPhotos) {
      await updatePhoto(photo.id, { order_index: photo.order_index });
    }

    toast.success('Sıralama güncellendi!');
    setDraggedPhoto(null);
  };

  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Fotoğraflar</h1>
          <p className="text-neutral-400">Fotoğrafları yükleyin ve sürükleyerek sıralayın.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span>{uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="admin-card border-2 border-dashed border-neutral-700 hover:border-neutral-500 cursor-pointer transition-colors mb-8"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Upload className="w-12 h-12 text-neutral-500 mb-4" />
          <p className="text-neutral-400 mb-2">Fotoğrafları buraya sürükleyin veya tıklayın</p>
          <p className="text-neutral-500 text-sm">PNG, JPG, WebP - Maks 10MB</p>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-neutral-400">Henüz fotoğraf yüklenmemiş.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, photo)}
              onDragEnd={handleDragEnd}
              className={`admin-card group cursor-move transition-all ${
                draggedPhoto?.id === photo.id ? 'opacity-50 scale-95' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-neutral-500">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-xs ml-1">Sürükle</span>
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-neutral-800">
                <Image
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title */}
              <input
                type="text"
                value={photo.title || ''}
                onChange={(e) => handleTitleChange(photo.id, e.target.value)}
                placeholder="Başlık ekle..."
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white text-sm placeholder-neutral-500 rounded focus:outline-none focus:border-neutral-500 mb-2"
              />

              {/* Project Select */}
              <select
                value={photo.project_id || ''}
                onChange={(e) => handleProjectChange(photo.id, e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white text-sm rounded focus:outline-none focus:border-neutral-500"
              >
                <option value="">Proje Seç</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
