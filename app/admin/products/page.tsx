'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, Photo } from '@/lib/types';

// Demo photos for selection
const availablePhotos: Photo[] = [
  { id: '1', title: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', order_index: 1, created_at: '', updated_at: '' },
  { id: '2', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400', order_index: 2, created_at: '', updated_at: '' },
  { id: '3', title: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', order_index: 3, created_at: '', updated_at: '' },
  { id: '4', title: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400', order_index: 4, created_at: '', updated_at: '' },
];

// Demo products
const initialProducts: Product[] = [
  {
    id: '1',
    photo_id: '1',
    title: 'Mountain Vista',
    artist_name: 'Your Name',
    edition_type: 'open',
    base_price: 295,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: availablePhotos[0],
  },
  {
    id: '2',
    photo_id: '2',
    title: 'Ocean Waves',
    artist_name: 'Your Name',
    edition_type: 'collector',
    edition_size: 25,
    base_price: 895,
    sizes: [],
    is_available: true,
    created_at: '',
    updated_at: '',
    photo: availablePhotos[1],
  },
];

interface ProductForm {
  photo_id: string;
  title: string;
  description: string;
  artist_name: string;
  edition_type: 'open' | 'collector';
  edition_size: string;
  base_price: string;
  is_available: boolean;
}

const defaultForm: ProductForm = {
  photo_id: '',
  title: '',
  description: '',
  artist_name: 'Your Name',
  edition_type: 'open',
  edition_size: '25',
  base_price: '295',
  is_available: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>(defaultForm);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Create product
  const handleCreate = () => {
    if (!formData.photo_id) {
      toast.error('Please select a photo');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const selectedPhoto = availablePhotos.find(p => p.id === formData.photo_id);

    const newProduct: Product = {
      id: Date.now().toString(),
      photo_id: formData.photo_id,
      title: formData.title,
      description: formData.description,
      artist_name: formData.artist_name,
      edition_type: formData.edition_type,
      edition_size: formData.edition_type === 'collector' ? parseInt(formData.edition_size) : undefined,
      base_price: parseFloat(formData.base_price),
      sizes: [],
      is_available: formData.is_available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photo: selectedPhoto,
    };

    setProducts(prev => [...prev, newProduct]);
    setFormData(defaultForm);
    setIsCreating(false);
    toast.success('Product created');
  };

  // Update product
  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      photo_id: product.photo_id,
      title: product.title,
      description: product.description || '',
      artist_name: product.artist_name || '',
      edition_type: product.edition_type,
      edition_size: product.edition_size?.toString() || '25',
      base_price: product.base_price.toString(),
      is_available: product.is_available,
    });
  };

  const handleUpdate = (id: string) => {
    if (!formData.title.trim() || !formData.base_price) {
      toast.error('Title and price are required');
      return;
    }

    const selectedPhoto = availablePhotos.find(p => p.id === formData.photo_id);

    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { 
            ...p, 
            photo_id: formData.photo_id,
            title: formData.title,
            description: formData.description,
            artist_name: formData.artist_name,
            edition_type: formData.edition_type,
            edition_size: formData.edition_type === 'collector' ? parseInt(formData.edition_size) : undefined,
            base_price: parseFloat(formData.base_price),
            is_available: formData.is_available,
            photo: selectedPhoto,
            updated_at: new Date().toISOString(),
          }
        : p
    ));
    setEditingId(null);
    setFormData(defaultForm);
    toast.success('Product updated');
  };

  // Quick price update
  const updatePrice = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, base_price: price } : p
    ));
  };

  // Delete product
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
  };

  // Toggle availability
  const toggleAvailability = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, is_available: !p.is_available } : p
    ));
    toast.success('Availability updated');
  };

  // Cancel
  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  // Product form component
  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="admin-card mb-6">
      <h3 className="text-lg font-display text-white mb-4">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Select Photo *</label>
            <div className="grid grid-cols-4 gap-2">
              {availablePhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, photo_id: photo.id, title: prev.title || photo.title || '' }))}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    formData.photo_id === photo.id 
                      ? 'border-accent' 
                      : 'border-transparent hover:border-neutral-600'
                  }`}
                >
                  <Image src={photo.url} alt={photo.title || ''} fill className="object-cover" />
                  {formData.photo_id === photo.id && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-accent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Product title"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Brief description"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Artist Name</label>
            <input
              type="text"
              value={formData.artist_name}
              onChange={(e) => setFormData(prev => ({ ...prev, artist_name: e.target.value }))}
              className="input-field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Edition Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, edition_type: 'open' }))}
                className={`p-3 border text-center transition-all ${
                  formData.edition_type === 'open'
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                Open Edition
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, edition_type: 'collector' }))}
                className={`p-3 border text-center transition-all ${
                  formData.edition_type === 'collector'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                Collector Edition
              </button>
            </div>
          </div>

          {formData.edition_type === 'collector' && (
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Edition Size</label>
              <input
                type="number"
                value={formData.edition_size}
                onChange={(e) => setFormData(prev => ({ ...prev, edition_size: e.target.value }))}
                className="input-field"
                min="1"
                max="999"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Base Price (EUR) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                className="input-field pl-10"
                min="0"
                step="5"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <label htmlFor="is_available" className="text-sm text-neutral-400">
              Available for sale
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-neutral-800">
        <button onClick={handleCancel} className="btn-ghost">
          Cancel
        </button>
        <button 
          onClick={isEdit ? () => handleUpdate(editingId!) : handleCreate} 
          className="btn-primary"
        >
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Products</h1>
          <p className="text-neutral-400">Manage your print shop inventory and pricing.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingId !== null}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && <ProductForm />}
      {editingId && <ProductForm isEdit />}

      {/* Products List */}
      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`admin-card ${!product.is_available ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center space-x-6">
                {/* Photo */}
                <div className="relative w-24 h-24 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                  {product.photo && (
                    <Image
                      src={product.photo.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-white font-medium">{product.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      product.edition_type === 'collector' 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {product.edition_type === 'collector' 
                        ? `Collector · ${product.edition_size}` 
                        : 'Open Edition'
                      }
                    </span>
                    {!product.is_available && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {product.artist_name && (
                    <p className="text-neutral-500 text-sm">{product.artist_name}</p>
                  )}
                </div>

                {/* Price Editor */}
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500 text-sm">€</span>
                  <input
                    type="number"
                    value={product.base_price}
                    onChange={(e) => updatePrice(product.id, e.target.value)}
                    onBlur={() => toast.success('Price saved')}
                    className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 text-white text-right rounded focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAvailability(product.id)}
                    className={`p-2 transition-colors ${
                      product.is_available 
                        ? 'text-green-500 hover:text-green-400' 
                        : 'text-neutral-500 hover:text-white'
                    }`}
                    title={product.is_available ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEditing(product)}
                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card text-center py-20">
          <ShoppingBag className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 mb-2">No products yet</p>
          <p className="text-neutral-500 text-sm">Create your first product to start selling prints</p>
        </div>
      )}
    </div>
  );
}
