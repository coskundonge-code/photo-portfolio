'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Edit2, Trash2, X, Upload, ImageIcon, Star, ShoppingBag, CheckSquare, Square } from 'lucide-react';
import { getPhotos, getProjects, createPhoto, updatePhoto, deletePhoto, getAllProducts, createProduct, createProductSize } from '@/lib/supabase';
import { smartUploadToCloudinary } from '@/lib/cloudinary';
import { Photo, Project, Product } from '@/lib/types';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    project_id: '',
    theme: '',
    is_featured: false,
    orientation: 'landscape' as 'landscape' | 'portrait',
    addToShop: true, // Mağazaya ekle checkbox
    // 4 boyut için fiyatlar
    price20x30: '1500',
    price40x60: '2500',
    price60x90: '3500',
    price100x150: '5000',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [photosData, projectsData, productsData] = await Promise.all([
      getPhotos(),
      getProjects(),
      getAllProducts()
    ]);
    setPhotos(photosData);
    setProjects(projectsData);
    setProducts(productsData);
    setLoading(false);
  };

  // Check if a photo is in the shop
  const isPhotoInShop = (photoId: string) => {
    return products.some(p => p.photo_id === photoId);
  };

  // Get product for a photo
  const getProductForPhoto = (photoId: string) => {
    return products.find(p => p.photo_id === photoId);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      project_id: '',
      theme: '',
      is_featured: false,
      orientation: 'landscape',
      addToShop: true,
      price20x30: '1500',
      price40x60: '2500',
      price60x90: '3500',
      price100x150: '5000',
    });
    setEditingPhoto(null);
    // File input'u sıfırla
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      addToShop: false, // Edit modunda bu gösterilmez
      price20x30: '1500',
      price40x60: '2500',
      price60x90: '3500',
      price100x150: '5000',
    });
    setIsModalOpen(true);
  };

  // DOSYA YÜKLEME - CLOUDINARY İLE ÇALIŞAN VERSİYON
  // Çözünürlük ve kalite korunarak yükleme yapılır
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (100MB sınırı)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      alert(`Dosya çok büyük (${fileSizeMB.toFixed(1)} MB). Maksimum 100 MB yüklenebilir.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setUploadProgress(5);

    try {
      // Resim boyutlarını al
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const width = img.width;
        const height = img.height;
        const orientation = height > width ? 'portrait' : 'landscape';

        URL.revokeObjectURL(objectUrl);
        setUploadProgress(10);

        // Cloudinary'ye yükle - çözünürlük korunur
        const uploadedUrl = await smartUploadToCloudinary(file, (progress) => {
          // Progress: 10-90 arası Cloudinary upload
          const mappedProgress = 10 + Math.round(progress.percent * 0.8);
          setUploadProgress(mappedProgress);
        });

        if (uploadedUrl) {
          setFormData(prev => ({
            ...prev,
            url: uploadedUrl,
            orientation: orientation,
          }));
          setUploadProgress(100);
        } else {
          alert(`Yükleme başarısız oldu.\n\nDosya: ${file.name}\nBoyut: ${fileSizeMB.toFixed(1)} MB\n\nLütfen tekrar deneyin veya daha küçük bir dosya seçin.`);
        }

        // File input'u sıfırla (yeni yükleme için)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      };

      img.onerror = () => {
        alert('Görsel okunamadı.');
        setUploading(false);
      };

      img.src = objectUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Yükleme sırasında bir hata oluştu.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      alert('Lütfen bir fotoğraf yükleyin.');
      return;
    }

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
      // Yeni fotoğraf oluştur
      const newPhoto = await createPhoto(photoData);

      // Mağazaya da ekle seçiliyse ürün ve boyutları oluştur
      if (newPhoto && formData.addToShop) {
        const newProduct = await createProduct({
          title: formData.title || 'İsimsiz Eser',
          photo_id: newPhoto.id,
          base_price: parseFloat(formData.price20x30) || 1500,
          edition_type: 'open',
          is_available: true,
        });

        // 4 boyut için fiyatları oluştur
        if (newProduct) {
          const sizes = [
            { name: 'Classic', dimensions: '20×30 cm', price: parseFloat(formData.price20x30) || 1500, order_index: 0 },
            { name: 'Medium', dimensions: '40×60 cm', price: parseFloat(formData.price40x60) || 2500, order_index: 1 },
            { name: 'Large', dimensions: '60×90 cm', price: parseFloat(formData.price60x90) || 3500, order_index: 2 },
            { name: 'Luxe', dimensions: '100×150 cm', price: parseFloat(formData.price100x150) || 5000, order_index: 3 },
          ];

          for (const size of sizes) {
            await createProductSize({
              product_id: newProduct.id,
              ...size,
            });
          }
        }
      }
    }

    setIsModalOpen(false);
    resetForm();
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      await deletePhoto(id);
      await loadData();
    }
  };

  // Selection functions
  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const cancelSelection = () => {
    setSelectedPhotos(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;

    if (confirm(`${selectedPhotos.size} fotoğrafı silmek istediğinize emin misiniz?`)) {
      setIsDeleting(true);
      try {
        const idsToDelete = Array.from(selectedPhotos);
        for (const id of idsToDelete) {
          await deletePhoto(id);
        }
        setSelectedPhotos(new Set());
        setIsSelectionMode(false);
        await loadData();
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      } finally {
        setIsDeleting(false);
      }
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
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <>
              <span className="text-neutral-400 text-sm">{selectedPhotos.size} seçili</span>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg"
              >
                {selectedPhotos.size === photos.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                <span>{selectedPhotos.size === photos.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}</span>
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedPhotos.size === 0 || isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                <span>Sil ({selectedPhotos.size})</span>
              </button>
              <button
                onClick={cancelSelection}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
              >
                <X className="w-5 h-5" />
                <span>İptal</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsSelectionMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg"
              >
                <CheckSquare className="w-5 h-5" />
                <span>Seç</span>
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Fotoğraf Yükle</span>
              </button>
            </>
          )}
        </div>
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
            <div
              key={photo.id}
              className={`relative group bg-neutral-900 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                isSelectionMode && selectedPhotos.has(photo.id)
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-neutral-800'
              }`}
              onClick={isSelectionMode ? () => togglePhotoSelection(photo.id) : undefined}
            >
              <div className="aspect-square relative">
                <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />

                {isSelectionMode ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      selectedPhotos.has(photo.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-white bg-black/30'
                    }`}>
                      {selectedPhotos.has(photo.id) && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
                    >
                      <Edit2 className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 bg-white/20 hover:bg-red-500/50 rounded-full"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}

                {/* Featured star */}
                {photo.is_featured && (
                  <div className="absolute top-2 left-2 p-1 bg-yellow-500 rounded-full">
                    <Star className="w-4 h-4 text-white" fill="white" />
                  </div>
                )}

                {/* Shop indicator */}
                {!isSelectionMode && isPhotoInShop(photo.id) && (
                  <div className="absolute top-2 right-2 p-1.5 bg-green-500 rounded-full" title="Mağazada">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {!isSelectionMode && (photo as any).theme && (
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
                      onClick={() => setFormData({ ...formData, url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-600"
                  >
                    {uploading ? (
                      <div className="space-y-2">
                        <Loader2 className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
                        <p className="text-sm text-neutral-500">Yükleniyor... {uploadProgress}%</p>
                        <div className="w-full bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                        <p className="text-neutral-500">Fotoğraf seçmek için tıklayın</p>
                        <p className="text-xs text-neutral-600 mt-1">JPG, PNG, WebP</p>
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

              {/* TEMA SEÇİMİ */}
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
                      className="w-4 h-4"
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
                      className="w-4 h-4"
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

              {/* Mağazaya Ekle - Sadece yeni fotoğraf için göster */}
              {!editingPhoto && (
                <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="addToShop"
                      checked={formData.addToShop}
                      onChange={(e) => setFormData({ ...formData, addToShop: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <label htmlFor="addToShop" className="text-neutral-300 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-green-500" />
                      Mağazaya da ekle
                    </label>
                  </div>

                  {formData.addToShop && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-neutral-400">Boyut Fiyatları (₺)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">20×30 cm</label>
                          <input
                            type="number"
                            value={formData.price20x30}
                            onChange={(e) => setFormData({ ...formData, price20x30: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm"
                            placeholder="1500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">40×60 cm</label>
                          <input
                            type="number"
                            value={formData.price40x60}
                            onChange={(e) => setFormData({ ...formData, price40x60: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm"
                            placeholder="2500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">60×90 cm</label>
                          <input
                            type="number"
                            value={formData.price60x90}
                            onChange={(e) => setFormData({ ...formData, price60x90: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm"
                            placeholder="3500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">100×150 cm</label>
                          <input
                            type="number"
                            value={formData.price100x150}
                            onChange={(e) => setFormData({ ...formData, price100x150: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm"
                            placeholder="5000"
                            min="0"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">Mağazada ürün detaylarını daha sonra düzenleyebilirsiniz.</p>
                    </div>
                  )}
                </div>
              )}

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
                  {editingPhoto ? 'Güncelle' : 'Yükle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// v2
