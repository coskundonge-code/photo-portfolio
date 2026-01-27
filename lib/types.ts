export interface Settings {
  id: string;
  site_name: string;
  email: string;
  instagram: string;
  about_text: string;
  about_image: string;
  menu_overview: string;
  menu_work: string;
  menu_shop: string;
  menu_about: string;
  menu_contact: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  title?: string;
  url: string;
  project_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  photo_id?: string;
  title: string;
  description?: string;
  base_price: number;
  edition_type: 'open' | 'limited';
  edition_total?: number;
  edition_sold?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photos?: Photo;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  size?: string;
  frame_option?: string;
  paper_type?: string;
  unit_price: number;
  created_at: string;
}
