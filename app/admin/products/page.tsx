'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  ImageIcon,
  Check
} from 'lucide-react';
import {
  getProducts,
  getPhotos,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/lib/supabase';
import { Product, Photo } from '@/lib/types';

// Fiyat formatı (nokta ile binlik ayracı)
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

// Fiyat parse (noktalı girişi sayıya çevir)
const parsePrice = (value: string) => {
  return parseInt(value.replace(/\./g, '').replace(/,/g, '')) || 0;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo_id: '',
    base_price: 0,
    edition_type: 'open' as 'open' | 'limited',
    edition_total: 100,
    edition_sold: 0,
    is_available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, photosData] = await Promise.all([
      getProducts(),
      getPhotos()
    ]);
    setProducts(productsData);
    setPhotos(photosData);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      photo_id: '',
      base_price: 0,
      edition_type: 'open',
      edition_total: 100,
      edition_sold: 0,
      is_available: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      photo_id: product.photo_id || '',
      base_price: product.base_price,
      edition_type: product.edition_type,
      edition_total: product.edition_total || 100,
      edition_sold: product.edition_sold || 0,
      is_available: product.is_available,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        photo_id: formData.photo_id || undefined,
        base_price: formData.base_price,
        edition_type: formData.edition_type,
        edition_total: formData.edition_type === 'limited' ? formData.edition_total : undefined,
        edition_sold: formData.edition_type === 'limited' ? formData.edition_sold : undefined,
        is_available: formData.is_available,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilemedi!');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinemedi!');
    }
  };

  const selectedPhoto = photos.find(p => p.id === formData.photo_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ürünler</h1>
          <p className="text-neutral-400 mt-1">{products.length} ürün</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün
        </button>
      </div>

      {/* Ürün Grid */}
      {products.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz ürün eklenmemiş</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            İlk ürünü ekle →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden group"
            >
              {/* Ürün Görseli */}
              <div className="relative aspect-[4/3] bg-neutral-800">
                {product.photos?.url ? (
                  <Image
                    src={product.photos.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-neutral-600" />
                  </div>
                )}

                {/* Hover Aksiyonlar */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 bg-white rounded-full text-black hover:bg-neutral-200 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ürün Bilgisi */}
              <div className="p-4">
                <h3 className="font-medium text-white truncate">{product.title}</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {product.edition_type === 'limited'
                    ? `Sınırlı - ${product.edition_total} adet`
                    : 'Açık Edisyon'}
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  ₺{formatPrice(product.base_price)}
                </p>
                <div className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  product.is_available
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  {product.is_available ? 'Satışta' : 'Satışta Değil'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Oluştur/Düzenle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal İçerik */}
            <div className="p-6 space-y-6">
              {/* Fotoğraf Seçici */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Fotoğraf Seç
                </label>
                <button
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="w-full border-2 border-dashed border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors"
                >
                  {selectedPhoto ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={selectedPhoto.url}
                          alt={selectedPhoto.title || 'Seçili fotoğraf'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">{selectedPhoto.title || 'Başlıksız'}</p>
                        <p className="text-sm text-neutral-400">Değiştirmek için tıkla</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-400">Fotoğraf seçmek için tıkla</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Ürün Adı */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ürün adını girin"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ürün açıklaması"
                />
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Fiyat (₺)
                </label>
                <input
                  type="text"
                  value={formatPrice(formData.base_price)}
                  onChange={(e) => setFormData({ ...formData, base_price: parsePrice(e.target.value) })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1.500"
                />
                <p className="text-xs text-neutral-500 mt-1">Binlik ayracı otomatik eklenir (örn: 1.500)</p>
              </div>

              {/* Edisyon Tipi */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Edisyon Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, edition_type: 'open' })}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      formData.edition_type === 'open'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    Açık Edisyon
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, edition_type: 'limited' })}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      formData.edition_type === 'limited'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    Sınırlı Sayıda
                  </button>
                </div>
              </div>

              {/* Sınırlı Edisyon Seçenekleri */}
              {formData.edition_type === 'limited' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Toplam Adet
                    </label>
                    <input
                      type="number"
                      value={formData.edition_total}
                      onChange={(e) => setFormData({ ...formData, edition_total: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Satılan Adet
                    </label>
                    <input
                      type="number"
                      value={formData.edition_sold}
                      onChange={(e) => setFormData({ ...formData, edition_sold: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Satışta mı? */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Satışta mı?</span>
                <button
                  onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.is_available ? 'bg-green-600' : 'bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.is_available ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Modal Alt Kısım */}
            <div className="flex justify-end gap-3 p-6 border-t border-neutral-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fotoğraf Seçici Modal */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Başlık */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Fotoğraf Seç</h3>
              <button
                onClick={() => setIsPhotoPickerOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Fotoğraf Grid */}
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {photos.length === 0 ? (
                <p className="text-center text-neutral-400 py-8">
                  Henüz fotoğraf yüklenmemiş. Önce Fotoğraflar sayfasından fotoğraf yükleyin.
                </p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setFormData({ ...formData, photo_id: photo.id });
                        setIsPhotoPickerOpen(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        formData.photo_id === photo.id
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-neutral-600'
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || 'Fotoğraf'}
                        fill
                        className="object-cover"
                      />
                      {formData.photo_id === photo.id && (
                        <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
