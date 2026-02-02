import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ================================================
// TYPES
// ================================================
export interface Settings {
  id: string;
  site_name: string;
  email: string;
  instagram: string;
  linkedin: string;
  about_text: string;
  about_image: string;
  footer_text: string;
  menu_overview: string;
  menu_work: string;
  menu_shop: string;
  menu_about: string;
  menu_contact: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  order_index: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Photo {
  id: string;
  title?: string;
  url: string;
  project_id?: string;
  order_index: number;
  is_featured: boolean;
  width?: number;
  height?: number;
  orientation?: string;
  created_at?: string;
  updated_at?: string;
  projects?: Project;
}

export interface Product {
  id: string;
  photo_id?: string;
  title: string;
  description?: string;
  story?: string;
  base_price: number;
  edition_type: 'open' | 'limited';
  edition_total?: number;
  edition_sold?: number;
  is_available: boolean;
  paper_type?: string;
  print_method?: string;
  created_at?: string;
  updated_at?: string;
  photos?: Photo;
}

export interface ProductSize {
  id: string;
  product_id: string;
  name: string;
  dimensions: string;
  price: number;
  order_index: number;
  created_at?: string;
}

export interface FrameOption {
  id: string;
  name: string;
  color: string;
  price: number;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_guest: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  size?: string;
  size_name?: string;
  frame_option?: string;
  frame_name?: string;
  style?: string;
  paper_type?: string;
  unit_price: number;
  created_at?: string;
}

export interface CartItem {
  id: string;
  session_id: string;
  customer_id?: string;
  product_id: string;
  size_id: string;
  frame_id?: string;
  style: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

// ================================================
// SETTINGS
// ================================================
export const getSettings = async (): Promise<Settings | null> => {
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
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings | null> => {
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
};

// ================================================
// PROJECTS
// ================================================
export const getProjects = async (): Promise<Project[]> => {
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
};

export const getAllProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }

  return data || [];
};

export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
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
};

export const createProject = async (project: Partial<Project>): Promise<Project | null> => {
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
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project | null> => {
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
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
};

// ================================================
// PHOTOS
// ================================================
export const getPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*, projects(*)')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return data || [];
};

export const getFeaturedPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*, projects(*)')
    .eq('is_featured', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }

  return data || [];
};

export const getPhotosByProject = async (projectId: string): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*, projects(*)')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching photos by project:', error);
    return [];
  }

  return data || [];
};

export const createPhoto = async (photo: Partial<Photo>): Promise<Photo | null> => {
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
};

export const updatePhoto = async (id: string, photo: Partial<Photo>): Promise<Photo | null> => {
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
};

export const deletePhoto = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting photo:', error);
    return false;
  }

  return true;
};

export const updatePhotoOrder = async (photos: { id: string; order_index: number }[]): Promise<boolean> => {
  try {
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
  } catch (error) {
    console.error('Error updating photo order:', error);
    return false;
  }
};

// ================================================
// PRODUCTS
// ================================================
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(p => ({ ...p, is_available: p.is_active }));
};

export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }

  return (data || []).map(p => ({ ...p, is_available: p.is_active }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, photos(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data ? { ...data, is_available: data.is_active } : null;
};

export const createProduct = async (product: Partial<Product>): Promise<Product | null> => {
  const dbProduct: any = { ...product };
  if ('is_available' in product) {
    dbProduct.is_active = product.is_available;
    delete dbProduct.is_available;
  }

  const { data, error } = await supabase
    .from('products')
    .insert([dbProduct])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  const dbProduct: any = { ...product, updated_at: new Date().toISOString() };
  
  if ('is_available' in product) {
    dbProduct.is_active = product.is_available;
    delete dbProduct.is_available;
  }

  const { data, error } = await supabase
    .from('products')
    .update(dbProduct)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
};

// ================================================
// PRODUCT SIZES
// ================================================
export const getProductSizes = async (productId: string): Promise<ProductSize[]> => {
  const { data, error } = await supabase
    .from('product_sizes')
    .select('*')
    .eq('product_id', productId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching product sizes:', error);
    return [];
  }

  return data || [];
};

export const createProductSize = async (size: Partial<ProductSize>): Promise<ProductSize | null> => {
  const { data, error } = await supabase
    .from('product_sizes')
    .insert([size])
    .select()
    .single();

  if (error) {
    console.error('Error creating product size:', error);
    return null;
  }

  return data;
};

export const updateProductSize = async (id: string, size: Partial<ProductSize>): Promise<ProductSize | null> => {
  const { data, error } = await supabase
    .from('product_sizes')
    .update(size)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product size:', error);
    return null;
  }

  return data;
};

export const deleteProductSize = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('product_sizes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product size:', error);
    return false;
  }

  return true;
};

// ================================================
// FRAME OPTIONS
// ================================================
export const getFrameOptions = async (): Promise<FrameOption[]> => {
  const { data, error } = await supabase
    .from('frame_options')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching frame options:', error);
    return [];
  }

  return data || [];
};

export const createFrameOption = async (frame: Partial<FrameOption>): Promise<FrameOption | null> => {
  const { data, error } = await supabase
    .from('frame_options')
    .insert([frame])
    .select()
    .single();

  if (error) {
    console.error('Error creating frame option:', error);
    return null;
  }

  return data;
};

export const updateFrameOption = async (id: string, frame: Partial<FrameOption>): Promise<FrameOption | null> => {
  const { data, error } = await supabase
    .from('frame_options')
    .update(frame)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating frame option:', error);
    return null;
  }

  return data;
};

// ================================================
// CUSTOMERS
// ================================================
export const createCustomer = async (customer: Partial<Customer>): Promise<Customer | null> => {
  // Önce mevcut müşteriyi kontrol et
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('email', customer.email)
    .single();

  if (existing) {
    // Mevcut müşteriyi güncelle
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return null;
    }
    return data;
  }

  // Yeni müşteri oluştur
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return data;
};

export const getCustomerByEmail = async (email: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching customer:', error);
    return null;
  }

  return data;
};

// ================================================
// ORDERS
// ================================================
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
};

export const createOrder = async (order: Partial<Order>): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  return data;
};

export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ ...order, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    return null;
  }

  return data;
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data;
};

// ================================================
// ORDER ITEMS
// ================================================
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }

  return data || [];
};

export const createOrderItem = async (item: Partial<OrderItem>): Promise<OrderItem | null> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error creating order item:', error);
    return null;
  }

  return data;
};

// ================================================
// CART
// ================================================
export const getCartItems = async (sessionId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*), product_sizes(*), frame_options(*)')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  return data || [];
};

export const addToCart = async (item: Partial<CartItem>): Promise<CartItem | null> => {
  const { data, error } = await supabase
    .from('cart_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding to cart:', error);
    return null;
  }

  return data;
};

export const removeFromCart = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from cart:', error);
    return false;
  }

  return true;
};

export const clearCart = async (sessionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }

  return true;
};

// ================================================
// STORAGE (Image Upload)
// ================================================
export const uploadImage = async (file: File, bucket: string = 'photos'): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
};

export const deleteImage = async (url: string, bucket: string = 'photos'): Promise<boolean> => {
  const fileName = url.split('/').pop();
  if (!fileName) return false;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
};

// ================================================
// MEMBERS
// ================================================
export interface Member {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  is_active: boolean;
  role?: 'member' | 'admin';
  membership_type?: string;
  notes?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export const getMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data || [];
};

export const updateMember = async (id: string, member: Partial<Member>): Promise<Member | null> => {
  const { data, error } = await supabase
    .from('members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating member:', error);
    return null;
  }

  return data;
};

export const toggleMemberStatus = async (id: string, is_active: boolean): Promise<Member | null> => {
  const { data, error } = await supabase
    .from('members')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling member status:', error);
    return null;
  }

  return data;
};

export const deleteMember = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting member:', error);
    return false;
  }

  return true;
};
