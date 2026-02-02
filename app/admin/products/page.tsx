'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { getPhotos, getAllProducts, createProduct, updateProduct, deleteProduct } from '@/lib/supabase';
import { Photo, Product } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedPhotoId, setSelectedPhotoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [editionType, setEditionType] = useState<'open' | 'limited'>('open');
  const [editionTotal, setEditionTotal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsData, photosData] = await Promise.all([getAllProducts(), getPhotos()]);
    setProducts(productsData);
    setPhotos(photosData);
    setLoading(false);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setSelectedPhotoId(product.photo_id || '');
      setTitle(product.title);
      setDescription(product.description || '');
      setBasePrice(product.base_price?.toString() || '');
      setEditionType(product.edition_type === 'limited' ? 'limited' : 'open');
      setEditionTotal(product.edition_total?.toString() || '');
    } else {
      setEditingProduct(null);
      setSelectedPhotoId('');
      setTitle('');
      setDescription('');
      setBasePrice('');
      setEditionType('open');
      setEditionTotal('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    if (!title || !basePrice) {
      toast.error('Başlık ve fiyat gerekli!');
      return;
    }

    setSaving(true);
    const productData: Partial<Product> = {
      title,
      description,
      base_price: parseFloat(basePrice),
      edition_type: editionType,
      is_available: true,
    };
    if (selectedPhotoId) productData.photo_id = selectedPhotoId;
    if (editionType === 'limited' && editionTotal) productData.edition_total = parseInt(editionTotal);

    const result = editingProduct
      ? await updateProduct(editingProduct.id, productData)
      : await createProduct(productData);

    if (result) {
      toast.success(editingProduct ? 'Ürün güncellendi!' : 'Ürün oluşturuldu!');
      closeModal();
      loadData();
    } else {
      toast.error('Bir hata oluştu!');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const success = await deleteProduct(id);
    if (success) {
      toast.success('Ürün silindi!');
      loadData();
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Ürünler</h1>
          <p className="text-neutral-400">Satışa sunulan ürünleri yönetin</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Yeni Ürün</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-neutral-400 mb-4">Henüz ürün eklenmemiş.</p>
          <button onClick={() => openModal()} className="text-white hover:underline">İlk ürünü ekle →</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="admin-card group">
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-neutral-800">
                {product.photos?.url ? (
                  <Image src={product.photos.url} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openModal(product)} className="p-2 bg-white text-black rounded-lg hover:bg-neutral-200">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-medium truncate">{product.title}</h3>
              <p className="text-neutral-400 text-sm">₺{product.base_price}</p>
              <p className="text-neutral-500 text-xs mt-1">
                {product.edition_type === 'limited' ? `Limitli (${product.edition_sold || 0}/${product.edition_total})` : 'Açık Edisyon'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-display text-white">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Fotoğraf</label>
                <select value={selectedPhotoId} onChange={(e) => setSelectedPhotoId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-neutral-500">
                  <option value="">Fotoğraf Seç</option>
                  {photos.map((photo) => (
                    <option key={photo.id} value={photo.id}>{photo.title || 'İsimsiz'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Ürün Adı *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ürün adı"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500" />
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Açıklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ürün açıklaması" rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Fiyat (₺) *</label>
                <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0" min="0"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500" />
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Edisyon</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={editionType === 'open'} onChange={() => setEditionType('open')} className="w-4 h-4" />
                    <span className="text-white">Açık</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={editionType === 'limited'} onChange={() => setEditionType('limited')} className="w-4 h-4" />
                    <span className="text-white">Limitli</span>
                  </label>
                </div>
              </div>

              {editionType === 'limited' && (
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Toplam Adet</label>
                  <input type="number" value={editionTotal} onChange={(e) => setEditionTotal(e.target.value)} placeholder="10" min="1"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500" />
                </div>
              )}
            </div>

            <div className="flex gap-4 p-6 border-t border-neutral-800">
              <button onClick={closeModal} className="flex-1 px-4 py-3 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors">İptal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
