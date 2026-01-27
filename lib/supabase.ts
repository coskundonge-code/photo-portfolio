import { createClient } from '@supabase/supabase-js';
import { Project, Photo, Product, Settings, Order } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ SETTINGS ============

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'main')
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'main')
    .select()
    .single();
  
  if (error) {
    console.error('Error updating settings:', error);
    return null;
  }
  return data;
}

// ============ PROJECTS ============

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_visible', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  return data;
}

export async function createProject(project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  return data;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...project, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    return null;
  }
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}

// ============ PHOTOS ============

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
  return data || [];
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_featured', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }
  return data || [];
}

export async function getPhotosByProject(projectId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
  return data || [];
}

export async function createPhoto(photo: Partial<Photo>): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .insert([{ ...photo, is_featured: photo.is_featured ?? false }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating photo:', error);
    return null;
  }
  return data;
}

export async function updatePhoto(id: string, photo: Partial<Photo>): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .update({ ...photo, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating photo:', error);
    return null;
  }
  return data;
}

export async function updatePhotoOrder(photos: { id: string; order_index: number }[]): Promise<boolean> {
  for (const photo of photos) {
    const { error } = await supabase
      .from('photos')
      .update({ order_index: photo.order_index })
      .eq('id', photo.id);
    
    if (error) {
      console.error('Error updating photo order:', error);
      return false;
    }
  }
  return true;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
  return true;
}

// ============ PRODUCTS ============

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function createProduct(product: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating product:', error);
    return null;
  }
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    return null;
  }
  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  return true;
}

// ============ ORDERS ============

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*))')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    return null;
  }
  return data;
}

// ============ STORAGE ============

export async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<boolean> {
  const fileName = url.split('/').pop();
  if (!fileName) return false;

  const { error } = await supabase.storage
    .from('images')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }
  return true;
}
