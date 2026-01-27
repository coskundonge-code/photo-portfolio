'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Edit2, Trash2, X, Upload, ImageIcon, Star, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { getPhotos, getProjects, createPhoto, updatePhoto, deletePhoto, uploadImage } from '@/lib/supabase';
import { Photo, Project } from '@/lib/types';

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
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    project_id: '',
    theme: '',
    is_featured: false,
    orientation: 'landscape' as 'landscape' | 'portrait',
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
    });
    setEditingPhoto(null);
    setError(null);
    setUrlInput('');
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
    });
    setError(null);
    setIsModalOpen(true);
  };

  // DOSYA YÜKLEME
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // Resim boyutlarını al
      const dimensions = await getImageDimensions(file);
      const orientation = dimensions.height > dimensions.width ? 'portrait' : 'landscape';
      
      setUploadProgress(30);

      // uploadImage fonksiyonunu kullan (supabase.ts'den)
      const uploadedUrl = await uploadImage(file);
      
      setUploadProgress(90);

      if (uploadedUrl) {
        setFormData(prev => ({
          ...prev,
          url: uploadedUrl,
          orientation: orientation,
        }));
        setUploadProgress(100);
      } else {
        throw new Error('Yükleme başarısız oldu');
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Dosya yükleme hatası: ${err.message || 'Bilinmeyen hata'}. URL ile eklemeyi deneyin.`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // URL İLE EKLEME
  const handleUrlAdd = async () => {
    if (!urlInput.trim()) {
      setError('Lütfen geçerli bir URL girin.');
      return;
    }

    // URL'in geçerli olup olmadığını kontrol et
    try {
      new URL(urlInput);
    } catch {
      setError('Geçersiz URL formatı.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Görselin boyutlarını almaya çalış
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      const dimensions = await new Promise<{width: number; height: number}>((resolve, reject) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 800, height: 600 }); // Varsayılan değer
        img.src = urlInput;
        
        // Timeout
        setTimeout(() => resolve({ width: 800, height: 600 }), 5000);
      });

      const orientation = dimensions.height > dimensions.width ? 'portrait' : 'landscape';

      setFormData(prev => ({
        ...prev,
        url: urlInput.trim(),
        orientation: orientation,
      }));
      
      setUrlInput('');
      setUploading(false);
    } catch (err) {
      setFormData(prev => ({
        ...prev,
        url: urlInput.trim(),
        orientation: 'landscape',
      }));
      setUrlInput('');
      setUploading(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Görsel okunamadı'));
      };
      
      img.src = objectUrl;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.url) {
      setError('Lütfen bir fotoğraf yükleyin veya URL girin.');
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
          <span>Fotoğraf Ekle</span>
        </button>
      </div>

      {/* Fotoğraf Grid */}
      {photos.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz fotoğraf yok</p>
          <button onClick={openCreateModal} className="mt-4 text-blue-500 hover:text-blue-400">
            İlk fotoğrafı ekle
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
                {editingPhoto ? 'Fotoğraf Düzenle' : 'Fotoğraf Ekle'}
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
              
              {/* Fotoğraf Ekleme */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Fotoğraf</label>
                
                {formData.url ? (
                  <div className="relative">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
                      <Image src={formData.url} alt="Preview" fill className="object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-green-500 mt-2">✓ Fotoğraf eklendi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tab Seçimi */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 ${
                          uploadMode === 'file' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Dosya Yükle
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 ${
                          uploadMode === 'url' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        URL ile Ekle
                      </button>
                    </div>

                    {uploadMode === 'file' ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-500 transition-colors"
                      >
                        {uploading ? (
                          <div className="space-y-3">
                            <Loader2 className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
                            <p className="text-sm text-neutral-400">Yükleniyor... {uploadProgress}%</p>
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
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                        />
                        <button
                          type="button"
                          onClick={handleUrlAdd}
                          disabled={!urlInput.trim() || uploading}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-neutral-700 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Ekleniyor...' : 'URL\'den Ekle'}
                        </button>
                        <p className="text-xs text-neutral-500">
                          💡 Unsplash, Imgur veya kendi sunucunuzdaki görsellerin URL'sini ekleyebilirsiniz.
                        </p>
                      </div>
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="Fotoğraf başlığı"
                />
              </div>

              {/* Proje */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Proje</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                >
                  {themeOptions.map((theme) => (
                    <option key={theme.id} value={theme.id}>{theme.label}</option>
                  ))}
                </select>
              </div>

              {/* Yön */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Yön</label>
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
                    <span className="text-neutral-300">Yatay</span>
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
                    <span className="text-neutral-300">Dikey</span>
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
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="is_featured" className="text-neutral-300">Öne çıkan fotoğraf</label>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-6 py-2 text-neutral-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!formData.url || uploading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-neutral-600"
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
