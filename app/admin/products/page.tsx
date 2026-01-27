'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Loader2, Plus, Edit2, Trash2, X, Check, 
  ImageIcon, DollarSign, Package, ChevronDown 
} from 'lucide-react';
import { 
  getProducts, 
  getPhotos,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/lib/supabase';
import { Product, Photo } from '@/lib/types';

// Varsayılan boyutlar
const defaultSizes = [
  { name: 'Compact', dimensions: '42x37cm', price: 1500 },
  { name: 'Regular', dimensions: '52x42cm', price: 2500 },
  { name: 'Classical', dimensions: '63x52cm', price: 3500 },
];

// Fiyat formatlama
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

const parsePrice = (value: string) => {
  return parseInt(value.replace(/\./g, '').replace(/,/g, '')) || 0;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    photo_id: '',
    title: '',
    description: '',
    story: '',
    base_price: 1500,
    edition_type: 'open' as 'open' | 'limited',
    edition_total: 50,
    edition_sold: 0,
    is_available: true,
    paper_type: 'Hahnemühle Photo Rag 308gsm',
    print_method: 'Giclée (Arşivsel Pigment)',
    // Boyut fiyatları
    sizes: defaultSizes,
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

  const resetForm = () => {
    setFormData({
      photo_id: '',
      title: '',
      description: '',
      story: '',
      base_price: 1500,
      edition_type: 'open',
      edition_total: 50,
      edition_sold: 0,
      is_available: true,
      paper_type: 'Hahnemühle Photo Rag 308gsm',
      print_method: 'Giclée (Arşivsel Pigment)',
      sizes: defaultSizes,
    });
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      photo_id: product.photo_id || '',
      title: product.title,
      description: product.description || '',
      story: (product as any).story || '',
      base_price: product.base_price,
      edition_type: product.edition_type,
      edition_total: product.edition_total || 50,
      edition_sold: product.edition_sold || 0,
      is_available: product.is_available,
      paper_type: (product as any).paper_type || 'Hahnemühle Photo Rag 308gsm',
      print_method: (product as any).print_method || 'Giclée (Arşivsel Pigment)',
      sizes: defaultSizes, // TODO: Ürüne özel boyutları yükle
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: any = {
      title: formData.title,
      description: formData.description,
      story: formData.story,
      base_price: formData.base_price,
      edition_type: formData.edition_type,
      edition_total: formData.edition_type === 'limited' ? formData.edition_total : null,
      edition_sold: formData.edition_sold,
      is_available: formData.is_available,
      paper_type: formData.paper_type,
      print_method: formData.print_method,
    };

    // photo_id varsa ekle
    if (formData.photo_id) {
      productData.photo_id = formData.photo_id;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }

    // TODO: Boyut fiyatlarını kaydet (product_sizes tablosuna)

    setIsModalOpen(false);
    resetForm();
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      await deleteProduct(id);
      await loadData();
    }
  };

  const updateSizePrice = (index: number, price: number) => {
    const newSizes = [...formData.sizes];
    newSizes[index].price = price;
    setFormData({ ...formData, sizes: newSizes });
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
          <span>Yeni Ürün</span>
        </button>
      </div>

      {/* Ürün Listesi */}
      {products.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz ürün yok</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            İlk ürünü ekle
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-4"
            >
              {/* Ürün Görseli */}
              <div className="relative w-20 h-20 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                {product.photos?.url ? (
                  <Image
                    src={product.photos.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-neutral-600" />
                  </div>
                )}
              </div>

              {/* Ürün Bilgileri */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{product.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {product.edition_type === 'limited' 
                    ? `Sınırlı Sayıda ${product.edition_total} (${product.edition_sold} satıldı)`
                    : 'Açık Edisyon'}
                </p>
                <p className="text-blue-400 font-medium mt-1">
                  ₺{formatPrice(product.base_price)}'dan başlayan
                </p>
              </div>

              {/* Durum */}
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full">
                <span className={`w-2 h-2 rounded-full ${product.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-neutral-400">
                  {product.is_available ? 'Satışta' : 'Pasif'}
                </span>
              </div>

              {/* Aksiyonlar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ürün Ekleme/Düzenleme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Fotoğraf Seçimi */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Fotoğraf
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="w-full border-2 border-dashed border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors"
                >
                  {selectedPhoto ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={selectedPhoto.url}
                          alt={selectedPhoto.title || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-white">{selectedPhoto.title || 'Başlıksız'}</p>
                        <p className="text-sm text-neutral-500">Değiştirmek için tıkla</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-500">Fotoğraf seçmek için tıkla</p>
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Kısa Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={2}
                />
              </div>

              {/* Hikaye */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Hikaye / Sanatçı Notu
                </label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Bu fotoğrafın hikayesini anlatın..."
                />
              </div>

              {/* Boyut & Fiyatlar */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-4">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Boyut & Fiyatlar
                </label>
                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{size.name}</p>
                        <p className="text-sm text-neutral-500">{size.dimensions}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">₺</span>
                        <input
                          type="text"
                          value={formatPrice(size.price)}
                          onChange={(e) => updateSizePrice(index, parsePrice(e.target.value))}
                          className="w-28 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  * Binlik ayracı otomatik eklenir (örn: 1.500)
                </p>
              </div>

              {/* Edisyon Tipi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Edisyon Tipi
                  </label>
                  <select
                    value={formData.edition_type}
                    onChange={(e) => setFormData({ ...formData, edition_type: e.target.value as 'open' | 'limited' })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="open">Açık Edisyon</option>
                    <option value="limited">Sınırlı Sayıda</option>
                  </select>
                </div>

                {formData.edition_type === 'limited' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Toplam Adet
                    </label>
                    <input
                      type="number"
                      value={formData.edition_total}
                      onChange={(e) => setFormData({ ...formData, edition_total: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min={1}
                    />
                  </div>
                )}
              </div>

              {/* Teknik Özellikler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Kağıt Türü
                  </label>
                  <input
                    type="text"
                    value={formData.paper_type}
                    onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Baskı Tekniği
                  </label>
                  <input
                    type="text"
                    value={formData.print_method}
                    onChange={(e) => setFormData({ ...formData, print_method: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Satışta mı? */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5 rounded bg-neutral-800 border-neutral-700"
                />
                <label htmlFor="is_available" className="text-neutral-300">
                  Satışta
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingProduct ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fotoğraf Seçici Modal */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-lg font-medium text-white">Fotoğraf Seç</h3>
              <button
                onClick={() => setIsPhotoPickerOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
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
                      alt={photo.title || ''}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
