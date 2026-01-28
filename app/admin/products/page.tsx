'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Loader2, Save, X, ImageIcon } from 'lucide-react';
import { supabase, getPhotos } from '@/lib/supabase';

interface Photo {
  id: string;
  title: string;
  url: string;
  project_id?: string;
}

interface Product {
  id: string;
  photo_id: string;
  title: string;
  description: string;
  base_price: number;
  edition_type: 'limited' | 'open';
  edition_total: number;
  is_active: boolean;
  sizes: any[];
  frames: any[];
  photos?: Photo;
}

const defaultSizes = [
  { id: 'compact', name: 'Compact', dimensions: '42x37cm', price: 1500 },
  { id: 'regular', name: 'Regular', dimensions: '52x42cm', price: 2500 },
  { id: 'classical', name: 'Classical', dimensions: '63x52cm', price: 3500 },
];

const defaultFrames = [
  { id: 'black', name: 'Siyah', color: '#1a1a1a', price: 0 },
  { id: 'white', name: 'Beyaz', color: '#ffffff', price: 0 },
  { id: 'natural', name: 'Doğal Meşe', color: '#c4a574', price: 200 },
  { id: 'walnut', name: 'Ceviz', color: '#5c4033', price: 200 },
];

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    photo_id: '',
    title: '',
    description: '',
    base_price: 2500,
    edition_type: 'open' as 'limited' | 'open',
    edition_total: 25,
    is_active: true,
    sizes: defaultSizes,
    frames: defaultFrames,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosData, productsData] = await Promise.all([
        getPhotos(),
        supabase.from('products').select('*, photos(*)').order('created_at', { ascending: false })
      ]);
      
      setPhotos(photosData || []);
      setProducts(productsData.data || []);
    } catch (err) {
      console.error('Veri yüklenemedi:', err);
    }
    setLoading(false);
  };

  const handlePhotoSelect = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      setFormData(prev => ({
        ...prev,
        photo_id: photoId,
        title: photo.title || prev.title,
      }));
    }
  };

  const handleSizeChange = (index: number, field: string, value: any) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: field === 'price' ? Number(value) : value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleFrameChange = (index: number, field: string, value: any) => {
    const newFrames = [...formData.frames];
    newFrames[index] = { ...newFrames[index], [field]: field === 'price' ? Number(value) : value };
    setFormData({ ...formData, frames: newFrames });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!formData.photo_id) {
        setMessage({ type: 'error', text: 'Lütfen bir fotoğraf seçin' });
        setSaving(false);
        return;
      }

      const productData = {
        photo_id: formData.photo_id,
        title: formData.title,
        description: formData.description,
        base_price: formData.base_price,
        edition_type: formData.edition_type,
        edition_total: formData.edition_type === 'limited' ? formData.edition_total : null,
        is_active: formData.is_active,
        sizes: formData.sizes,
        frames: formData.frames,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ürün güncellendi!' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ürün eklendi!' });
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      setMessage({ type: 'error', text: err.message || 'Kaydetme başarısız' });
    }
    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      photo_id: product.photo_id,
      title: product.title,
      description: product.description || '',
      base_price: product.base_price,
      edition_type: product.edition_type,
      edition_total: product.edition_total || 25,
      is_active: product.is_active,
      sizes: product.sizes || defaultSizes,
      frames: product.frames || defaultFrames,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      photo_id: '',
      title: '',
      description: '',
      base_price: 2500,
      edition_type: 'open',
      edition_total: 25,
      is_active: true,
      sizes: defaultSizes,
      frames: defaultFrames,
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ürünler</h1>
          <p className="text-neutral-400 mt-1">{products.length} ürün</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün
        </button>
      </div>

      {/* Ürün Listesi */}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-800 rounded-lg overflow-hidden relative flex-shrink-0">
              {product.photos?.url ? (
                <Image src={product.photos.url} alt={product.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-neutral-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{product.title}</h3>
              <p className="text-neutral-500 text-sm">
                {product.edition_type === 'limited' ? `Sınırlı - ${product.edition_total} adet` : 'Açık Edisyon'}
              </p>
              <p className="text-white mt-1">₺{formatPrice(product.base_price)}'den başlayan</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {product.is_active ? 'Aktif' : 'Pasif'}
              </span>
              <button
                onClick={() => handleEdit(product)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">Henüz ürün eklenmemiş</p>
          </div>
        )}
      </div>

      {/* Ürün Formu Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button onClick={resetForm} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              {/* Fotoğraf Seçimi */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Fotoğraf *</label>
                <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto bg-neutral-800 rounded-lg p-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handlePhotoSelect(photo.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        formData.photo_id === photo.id ? 'border-blue-500' : 'border-transparent hover:border-neutral-600'
                      }`}
                    >
                      <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Temel Bilgiler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Ürün Adı *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Başlangıç Fiyatı (₺)</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none"
                />
              </div>

              {/* Edisyon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Edisyon Tipi</label>
                  <select
                    value={formData.edition_type}
                    onChange={(e) => setFormData({ ...formData, edition_type: e.target.value as 'limited' | 'open' })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  >
                    <option value="open">Açık Edisyon</option>
                    <option value="limited">Sınırlı Edisyon</option>
                  </select>
                </div>
                {formData.edition_type === 'limited' && (
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Toplam Adet</label>
                    <input
                      type="number"
                      value={formData.edition_total}
                      onChange={(e) => setFormData({ ...formData, edition_total: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                      min={1}
                    />
                  </div>
                )}
              </div>

              {/* BOYUT FİYATLARI */}
              <div>
                <label className="block text-sm text-neutral-400 mb-3">Boyut Fiyatları</label>
                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div key={size.id} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-white font-medium">{size.name}</p>
                        <p className="text-neutral-500 text-sm">{size.dimensions}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">₺</span>
                        <input
                          type="number"
                          value={size.price}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          className="w-24 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ÇERÇEVE FİYATLARI */}
              <div>
                <label className="block text-sm text-neutral-400 mb-3">Çerçeve Fiyatları</label>
                <div className="space-y-3">
                  {formData.frames.map((frame, index) => (
                    <div key={frame.id} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-neutral-600 flex-shrink-0"
                        style={{ backgroundColor: frame.color }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{frame.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">+₺</span>
                        <input
                          type="number"
                          value={frame.price}
                          onChange={(e) => handleFrameChange(index, 'price', e.target.value)}
                          className="w-24 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white text-right"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-neutral-500 text-xs mt-2">* 0 girerseniz ek ücret olmaz</p>
              </div>

              {/* Aktif/Pasif */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded bg-neutral-800 border-neutral-600"
                />
                <label htmlFor="is_active" className="text-white">Ürün aktif (mağazada görünsün)</label>
              </div>

              {/* Kaydet */}
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
