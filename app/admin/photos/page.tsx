'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Edit2, Trash2, X, Upload, ImageIcon, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { getPhotos, getProjects, createPhoto, updatePhoto, deletePhoto } from '@/lib/supabase';
import { Photo, Project } from '@/lib/types';

// CLOUDINARY AYARLARI
const CLOUDINARY_CLOUD_NAME = 'dgiak1uhc';
const CLOUDINARY_UPLOAD_PRESET = 'portfolio_upload';

const themeOptions = [
  { id: '', label: 'Tema Seçin...' },
  { id: 'portrait', label: 'Portre' },
  { id: 'landscape', label: 'Manzara' },
  { id: 'street', label: 'Sokak' },
  { id: 'nature', label: 'Doğa' },
  { id: 'blackwhite', label: 'Siyah Beyaz' },
  { id: 'travel', label: 'Seyahat' },
  { id: 'documentary', label: 'Belgesel' },
];

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    project_id: '',
    theme: '',
    is_featured: false,
    orientation: 'landscape' as 'landscape' | 'portrait',
    width: 0,
    height: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosData, projectsData] = await Promise.all([getPhotos(), getProjects()]);
      setPhotos(photosData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      project_id: '',
      theme: '',
      is_featured: false,
      orientation: 'landscape',
      width: 0,
      height: 0,
    });
    setEditingPhoto(null);
    setError(null);
    setSuccess(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || '',
      url: photo.url,
      project_id: photo.project_id || '',
      theme: (photo as any).theme || '',
      is_featured: photo.is_featured,
      orientation: (photo as any).orientation || 'landscape',
      width: (photo as any).width || 0,
      height: (photo as any).height || 0,
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  // CLOUDINARY'E FOTOĞRAF YÜKLE
  const uploadToCloudinary = async (file: File): Promise<{url: string; width: number; height: number} | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'portfolio');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Yükleme başarısız');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      throw err;
    }
  };

  // DOSYA YÜKLEME
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError(null);
    setSuccess(null);

    try {
      setUploadProgress(50);
      
      // Cloudinary'e yükle
      const result = await uploadToCloudinary(file);
      
      if (!result) {
        throw new Error('Yükleme başarısız oldu');
      }

      setUploadProgress(90);

      // Orientation belirle
      const orientation = result.height > result.width ? 'portrait' : 'landscape';

      setFormData(prev => ({
        ...prev,
        url: result.url,
        width: result.width,
        height: result.height,
        orientation: orientation,
      }));

      setUploadProgress(100);
      setSuccess('Fotoğraf başarıyla yüklendi!');

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Yükleme hatası: ${err.message || 'Bilinmeyen hata'}`);
      setUploading(false);
      setUploadProgress(0);
    }

    // Input'u sıfırla (aynı dosyayı tekrar seçebilmek için)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.url) {
      setError('Lütfen bir fotoğraf yükleyin.');
      return;
    }

    try {
      const photoData: any = {
        title: formData.title,
        url: formData.url,
        project_id: formData.project_id || null,
        theme: formData.theme || null,
        is_featured: formData.is_featured,
        orientation: formData.orientation,
        width: formData.width,
        height: formData.height,
      };

      if (editingPhoto) {
        await updatePhoto(editingPhoto.id, photoData);
      } else {
        await createPhoto(photoData);
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Kaydetme başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      await deletePhoto(id);
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Fotoğraflar</h1>
          <p className="text-neutral-400 mt-1">{photos.length} fotoğraf</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Fotoğraf Yükle</span>
        </button>
      </div>

      {/* Fotoğraf Grid */}
      {photos.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz fotoğraf yok</p>
          <button onClick={openCreateModal} className="mt-4 text-blue-500 hover:text-blue-400">
            İlk fotoğrafı yükle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-white/20 hover:bg-red-500/50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>

                {photo.is_featured && (
                  <div className="absolute top-2 left-2 p-1 bg-yellow-500 rounded-full">
                    <Star className="w-4 h-4 text-white" fill="white" />
                  </div>
                )}

                {(photo as any).orientation && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {(photo as any).orientation === 'portrait' ? 'Dikey' : 'Yatay'}
                  </div>
                )}

                {(photo as any).theme && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {themeOptions.find(t => t.id === (photo as any).theme)?.label}
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm text-white truncate">{photo.title || 'Başlıksız'}</p>
                <p className="text-xs text-neutral-500 truncate">
                  {projects.find(p => p.id === photo.project_id)?.title || 'Proje yok'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white">
                {editingPhoto ? 'Fotoğraf Düzenle' : 'Fotoğraf Yükle'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Hata Mesajı */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Başarı Mesajı */}
              {success && (
                <div className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}
              
              {/* Fotoğraf Yükleme */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Fotoğraf</label>
                
                {formData.url ? (
                  <div className="relative">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
                      <Image src={formData.url} alt="Preview" fill className="object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, url: '', width: 0, height: 0 })}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                      <span>✓ Yüklendi</span>
                      {formData.width > 0 && (
                        <span>{formData.width} x {formData.height}px</span>
                      )}
                      <span className={formData.orientation === 'portrait' ? 'text-purple-400' : 'text-blue-400'}>
                        {formData.orientation === 'portrait' ? '↕ Dikey' : '↔ Yatay'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      uploading 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {uploading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
                        <p className="text-sm text-neutral-400">Cloudinary'e yükleniyor... {uploadProgress}%</p>
                        <div className="w-full bg-neutral-700 rounded-full h-2 max-w-xs mx-auto">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-400">Fotoğraf seçmek için tıklayın</p>
                        <p className="text-xs text-neutral-600 mt-1">JPG, PNG, WebP • Max 10MB</p>
                        <p className="text-xs text-green-600 mt-2">☁️ Cloudinary ile ücretsiz yükleme</p>
                      </>
                    )}
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Fotoğraf başlığı"
                />
              </div>

              {/* Proje */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Proje</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Proje seçin...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>

              {/* Tema */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Tema (Mağaza Filtresi)</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {themeOptions.map((theme) => (
                    <option key={theme.id} value={theme.id}>{theme.label}</option>
                  ))}
                </select>
              </div>

              {/* Yön (Otomatik algılanır ama manuel değiştirilebilir) */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Yön 
                  <span className="text-neutral-500 font-normal ml-1">(otomatik algılandı)</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="landscape"
                      checked={formData.orientation === 'landscape'}
                      onChange={() => setFormData({ ...formData, orientation: 'landscape' })}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-neutral-300">↔ Yatay</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="portrait"
                      checked={formData.orientation === 'portrait'}
                      onChange={() => setFormData({ ...formData, orientation: 'portrait' })}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-neutral-300">↕ Dikey</span>
                  </label>
                </div>
              </div>

              {/* Öne Çıkan */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-blue-500"
                />
                <label htmlFor="is_featured" className="text-neutral-300">Öne çıkan fotoğraf</label>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-6 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!formData.url || uploading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
                >
                  {editingPhoto ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
