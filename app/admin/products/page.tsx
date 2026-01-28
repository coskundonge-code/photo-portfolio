'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Edit2, Trash2, X, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { getPhotos, getProducts, getProjects, createProduct, updateProduct, deleteProduct } from '@/lib/supabase';
import { Photo, Product, Project } from '@/lib/types';

const sizeOptions = [
  { id: 'small', label: 'Küçük (30x40cm)', priceMultiplier: 1 },
  { id: 'medium', label: 'Orta (50x70cm)', priceMultiplier: 1.5 },
  { id: 'large', label: 'Büyük (70x100cm)', priceMultiplier: 2 },
];

const frameOptions = [
  { id: 'black', label: 'Siyah Çerçeve' },
  { id: 'white', label: 'Beyaz Çerçeve' },
  { id: 'natural', label: 'Doğal Ahşap' },
  { id: 'none', label: 'Çerçevesiz' },
];

export default function AdminProductsPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    photo_id: '',
    title: '',
    description: '',
    price: 2950,
    sizes: ['small', 'medium', 'large'],
    frames: ['black', 'white', 'natural'],
    in_stock: true,
    // Fotoğraftan gelen bilgiler
    project_id: '',
    theme: '',
    orientation: 'landscape',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosData, productsData, projectsData] = await Promise.all([
        getPhotos(),
        getProducts(),
        getProjects()
      ]);
      setPhotos(photosData);
      setProducts(productsData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      photo_id: '',
      title: '',
      description: '',
      price: 2950,
      sizes: ['small', 'medium', 'large'],
      frames: ['black', 'white', 'natural'],
      in_stock: true,
      project_id: '',
      theme: '',
      orientation: 'landscape',
    });
    setEditingProduct(null);
    setError(null);
    setSuccess(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    
    // Fotoğraftan bilgileri al
    const photo = photos.find(p => p.id === product.photo_id);
    
    setFormData({
      photo_id: product.photo_id || '',
      title: product.title || '',
      description: product.description || '',
      price: product.price,
      sizes: (product as any).sizes || ['small', 'medium', 'large'],
      frames: (product as any).frames || ['black', 'white', 'natural'],
      in_stock: product.in_stock,
      project_id: photo?.project_id || '',
      theme: (photo as any)?.theme || '',
      orientation: (photo as any)?.orientation || 'landscape',
    });
    setError(null);
    setIsModalOpen(true);
  };

  // FOTOĞRAF SEÇİLDİĞİNDE BİLGİLERİ OTOMATİK GETİR
  const handlePhotoSelect = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
      setFormData(prev => ({
        ...prev,
        photo_id: photoId,
        title: photo.title || prev.title,
        project_id: photo.project_id || '',
        theme: (photo as any).theme || '',
        orientation: (photo as any).orientation || 'landscape',
      }));
      setSuccess('Fotoğraf bilgileri otomatik yüklendi!');
      setTimeout(() => setSuccess(null), 2000);
    } else {
      setFormData(prev => ({
        ...prev,
        photo_id: photoId,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!formData.photo_id) {
      setError('Lütfen bir fotoğraf seçin.');
      setSaving(false);
      return;
    }

    try {
      const productData: any = {
        photo_id: formData.photo_id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        sizes: formData.sizes,
        frames: formData.frames,
        in_stock: formData.in_stock,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Kaydetme başarısız oldu.');
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      await deleteProduct(id);
      await loadData();
    }
  };

  // Fotoğrafın proje adını bul
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || '-';
  };

  // Zaten ürün olan fotoğrafları filtrele
  const availablePhotos = photos.filter(photo => {
    if (editingProduct) {
      return !products.some(p => p.photo_id === photo.id && p.id !== editingProduct.id);
    }
    return !products.some(p => p.photo_id === photo.id);
  });

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
          <h1 className="text-2xl font-semibold text-white">Ürünler</h1>
          <p className="text-neutral-400 mt-1">{products.length} ürün</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ürün Ekle</span>
        </button>
      </div>

      {/* Ürün Listesi */}
      {products.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz ürün yok</p>
          <button onClick={openCreateModal} className="mt-4 text-blue-500 hover:text-blue-400">
            İlk ürünü ekle
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const photo = photos.find(p => p.id === product.photo_id);
            
            return (
              <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-4">
                {/* Fotoğraf */}
                {photo && (
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={photo.url} alt={product.title || ''} fill className="object-cover" />
                  </div>
                )}

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{product.title || 'İsimsiz'}</h3>
                  <p className="text-neutral-500 text-sm truncate">{product.description || '-'}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                    <span>Proje: {photo?.project_id ? getProjectName(photo.project_id) : '-'}</span>
                    <span>Tema: {(photo as any)?.theme || '-'}</span>
                  </div>
                </div>

                {/* Fiyat */}
                <div className="text-right">
                  <p className="text-white font-semibold">₺{product.price.toLocaleString('tr-TR')}</p>
                  <p className={`text-xs ${product.in_stock ? 'text-green-500' : 'text-red-500'}`}>
                    {product.in_stock ? 'Stokta' : 'Tükendi'}
                  </p>
                </div>

                {/* Aksiyonlar */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Hata Mesajı */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Başarı Mesajı */}
              {success && (
                <div className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Fotoğraf Seçimi */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Fotoğraf Seç
                  <span className="text-neutral-500 ml-2 font-normal">(Çalışma ve Tema otomatik gelir)</span>
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-neutral-800 rounded-lg">
                  {availablePhotos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handlePhotoSelect(photo.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        formData.photo_id === photo.id 
                          ? 'border-blue-500 ring-2 ring-blue-500/50' 
                          : 'border-transparent hover:border-neutral-600'
                      }`}
                    >
                      <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />
                    </button>
                  ))}
                </div>
                
                {/* Seçilen fotoğrafın bilgileri */}
                {formData.photo_id && (
                  <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-2">Fotoğraftan gelen bilgiler:</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                        Çalışma: {formData.project_id ? getProjectName(formData.project_id) : 'Yok'}
                      </span>
                      <span className="px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                        Tema: {formData.theme || 'Yok'}
                      </span>
                      <span className="px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                        Yön: {formData.orientation === 'portrait' ? 'Dikey' : 'Yatay'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Ürün Başlığı</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ürün adı"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Ürün açıklaması"
                />
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Başlangıç Fiyatı (₺)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  step="50"
                />
              </div>

              {/* Boyutlar */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Mevcut Boyutlar</label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <label key={size.id} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sizes: [...formData.sizes, size.id] });
                          } else {
                            setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size.id) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-300">{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Çerçeveler */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Mevcut Çerçeveler</label>
                <div className="flex flex-wrap gap-2">
                  {frameOptions.map((frame) => (
                    <label key={frame.id} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.frames.includes(frame.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, frames: [...formData.frames, frame.id] });
                          } else {
                            setFormData({ ...formData, frames: formData.frames.filter(f => f !== frame.id) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-300">{frame.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stok Durumu */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="in_stock" className="text-neutral-300">Stokta mevcut</label>
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
                  disabled={saving || !formData.photo_id}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
