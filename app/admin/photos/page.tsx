'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2, GripVertical, Star, Filter } from 'lucide-react';
import { getPhotos, getAllProjects, createPhoto, updatePhoto, deletePhoto, uploadImage, updatePhotoOrder } from '@/lib/supabase';
import { Photo, Project } from '@/lib/types';
import toast from 'react-hot-toast';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [uploadToProject, setUploadToProject] = useState<string>('');
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
    setPhotos(photosData);
    setProjects(projectsData);
    setLoading(false);
  };

  const filteredPhotos = selectedProject === 'all' 
    ? photos 
    : selectedProject === 'none'
    ? photos.filter(p => !p.project_id)
    : photos.filter(p => p.project_id === selectedProject);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadImage(file);
      
      if (url) {
        const newPhoto = await createPhoto({
          title: file.name.split('.')[0].replace(/[-_]/g, ' '),
          url: url,
          project_id: uploadToProject || undefined,
          order_index: photos.length + i,
          is_featured: false,
        });
        
        if (newPhoto) {
          setPhotos(prev => [...prev, newPhoto]);
          successCount++;
        }
      }
    }
    
    toast.success(`${successCount} fotoğraf yüklendi!`);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;

    const success = await deletePhoto(photo.id);
    if (success) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
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
    await updatePhoto(photoId, { title });
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, title } : p));
  };

  const toggleFeatured = async (photo: Photo) => {
    const result = await updatePhoto(photo.id, { is_featured: !photo.is_featured });
    if (result) {
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, is_featured: !p.is_featured } : p
      ));
      toast.success(photo.is_featured ? 'Ana sayfadan kaldırıldı' : 'Ana sayfaya eklendi');
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, photo: Photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetPhoto: Photo) => {
    e.preventDefault();
    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) {
      setDraggedPhoto(null);
      return;
    }

    const currentPhotos = [...filteredPhotos];
    const draggedIndex = currentPhotos.findIndex(p => p.id === draggedPhoto.id);
    const targetIndex = currentPhotos.findIndex(p => p.id === targetPhoto.id);

    currentPhotos.splice(draggedIndex, 1);
    currentPhotos.splice(targetIndex, 0, draggedPhoto);

    const updatedPhotos = currentPhotos.map((photo, index) => ({
      ...photo,
      order_index: index
    }));

    // Update state immediately
    setPhotos(prev => {
      const otherPhotos = prev.filter(p => !updatedPhotos.find(up => up.id === p.id));
      return [...otherPhotos, ...updatedPhotos].sort((a, b) => a.order_index - b.order_index);
    });

    // Save to database
    await updatePhotoOrder(updatedPhotos.map(p => ({ id: p.id, order_index: p.order_index })));
    toast.success('Sıralama güncellendi!');
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
          <p className="text-neutral-400">Toplam {photos.length} fotoğraf • {photos.filter(p => p.is_featured).length} ana sayfada</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="admin-card mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Fotoğraf Yükle</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-neutral-400 mb-2">Proje Seç (Opsiyonel)</label>
            <select
              value={uploadToProject}
              onChange={(e) => setUploadToProject(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-neutral-500"
            >
              <option value="">Proje Seçme</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span>
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
        <p className="text-xs text-neutral-500 mt-3">PNG, JPG, WebP • Birden fazla dosya seçebilirsiniz • Sürükleyerek sıralayabilirsiniz</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-neutral-400" />
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-neutral-500"
        >
          <option value="all">Tüm Fotoğraflar ({photos.length})</option>
          <option value="none">Projesiz ({photos.filter(p => !p.project_id).length})</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({photos.filter(ph => ph.project_id === p.id).length})
            </option>
          ))}
        </select>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-neutral-400">Bu kategoride fotoğraf yok.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, photo)}
              className={`admin-card group cursor-move transition-all ${
                draggedPhoto?.id === photo.id ? 'opacity-50 scale-95' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-neutral-500">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFeatured(photo)}
                    className={`p-1.5 rounded transition-colors ${
                      photo.is_featured ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'
                    }`}
                    title={photo.is_featured ? 'Ana sayfadan kaldır' : 'Ana sayfaya ekle'}
                  >
                    <Star className="w-4 h-4" fill={photo.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleDelete(photo)}
                    className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-square mb-3 overflow-hidden rounded bg-neutral-800">
                <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />
              </div>

              {/* Title */}
              <input
                type="text"
                value={photo.title || ''}
                onChange={(e) => handleTitleChange(photo.id, e.target.value)}
                placeholder="Başlık..."
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
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
