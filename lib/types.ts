// Fotoğraf tipi
export interface Photo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  project_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Proje tipi
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
  photos?: Photo[];
}

// Ürün tipi (satış için)
export interface Product {
  id: string;
  photo_id: string;
  title: string;
  description?: string;
  artist_name?: string;
  edition_type: 'open' | 'collector';
  edition_size?: number; // collector edition için
  base_price: number;
  sizes: ProductSize[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
  photo?: Photo;
}

// Ürün boyutları
export interface ProductSize {
  id: string;
  name: string; // "30x40 cm"
  price_modifier: number; // base_price'a eklenir
  frame_options: FrameOption[];
}

// Çerçeve seçenekleri
export interface FrameOption {
  id: string;
  name: string; // "Siyah Ahşap"
  price_modifier: number;
}

// Site ayarları
export interface SiteSettings {
  id: string;
  site_name: string;
  site_description?: string;
  contact_email: string;
  instagram_url?: string;
  about_text?: string;
  about_image?: string;
}

// Sipariş tipi
export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_title: string;
  size: string;
  frame: string;
  quantity: number;
  price: number;
}

// Admin state
export interface AdminState {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}
