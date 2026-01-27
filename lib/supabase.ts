import { createClient } from '@supabase/supabase-js';
import { Photo, Project, Product, SiteSettings } from './types';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ PROJELER ============

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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      photos (*)
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  return data;
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
  return data || [];
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

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
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

// ============ FOTOĞRAFLAR ============

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
    .insert([photo])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating photo:', error);
    return null;
  }
  return data;
}

export async function updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating photo:', error);
    return null;
  }
  return data;
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

// ============ ÜRÜNLER ============

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      photo:photos (*)
    `)
    .eq('is_available', true)
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
    .select(`
      *,
      photo:photos (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      photo:photos (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
  return data || [];
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

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
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

// ============ FOTOĞRAF UPLOAD ============

export async function uploadPhoto(file: File, folder: string = 'photos'): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deletePhotoFromStorage(url: string): Promise<boolean> {
  // URL'den dosya yolunu çıkar
  const path = url.split('/images/')[1];
  if (!path) return false;

  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    console.error('Error deleting photo from storage:', error);
    return false;
  }
  return true;
}

// ============ SİTE AYARLARI ============

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .upsert([{ id: 'main', ...settings }])
    .select()
    .single();
  
  if (error) {
    console.error('Error updating settings:', error);
    return null;
  }
  return data;
}
