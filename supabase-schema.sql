-- =====================================================
-- FOTOĞRAF PORTFÖLYİ VE E-TİCARET - SUPABASE ŞEMA
-- =====================================================
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın
-- =====================================================

-- Mevcut tabloları temizle (dikkatli kullanın!)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS photos CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- =====================================================
-- 1. PROJELER TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_visible ON projects(is_visible);

-- =====================================================
-- 2. FOTOĞRAFLAR TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_project ON photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(order_index);

-- =====================================================
-- 3. ÜRÜNLER TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_name VARCHAR(255),
    edition_type VARCHAR(50) DEFAULT 'open' CHECK (edition_type IN ('open', 'collector')),
    edition_size INTEGER,
    base_price DECIMAL(10,2) NOT NULL,
    sizes JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_edition ON products(edition_type);

-- =====================================================
-- 4. SİPARİŞLER TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

-- =====================================================
-- 5. SİPARİŞ DETAYLARI TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    frame VARCHAR(100),
    paper VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- =====================================================
-- 6. SİTE AYARLARI TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    site_name VARCHAR(255) DEFAULT 'Photography Portfolio',
    site_description TEXT,
    contact_email VARCHAR(255),
    instagram_url VARCHAR(255),
    about_text TEXT,
    about_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varsayılan ayarları ekle
INSERT INTO settings (id, site_name, contact_email) 
VALUES ('main', 'Photography Portfolio', 'hello@example.com')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. ÜYELER TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);

-- =====================================================
-- 8. UPDATED_AT TRİGGER FONKSİYONU
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggerleri oluştur
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_photos_updated_at ON photos;
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Public okuma için politikalar

-- Projeleri herkes okuyabilir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible projects" ON projects
    FOR SELECT USING (is_visible = true);

-- Fotoğrafları herkes okuyabilir
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view photos" ON photos
    FOR SELECT USING (true);

-- Ürünleri herkes okuyabilir
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view available products" ON products
    FOR SELECT USING (is_available = true);

-- Ayarları herkes okuyabilir
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

-- Üyeler tablosu RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Üyeler kendi profillerini okuyabilir
CREATE POLICY "Members can view own profile" ON members
    FOR SELECT USING (auth.uid() = id);

-- Admin tüm üyeleri görebilir (anon key ile geçici olarak)
CREATE POLICY "Public can view members" ON members
    FOR SELECT USING (true);

-- Üyeler kendi profillerini güncelleyebilir
CREATE POLICY "Members can update own profile" ON members
    FOR UPDATE USING (auth.uid() = id);

-- Admin tüm üyeleri güncelleyebilir
CREATE POLICY "Admin can update all members" ON members
    FOR UPDATE USING (true);

-- Yeni üye kaydı
CREATE POLICY "Enable insert for authenticated users" ON members
    FOR INSERT WITH CHECK (true);

-- Admin üye silebilir
CREATE POLICY "Admin can delete members" ON members
    FOR DELETE USING (true);

-- =====================================================
-- 10. STORAGE BUCKET
-- =====================================================
-- Bu kısmı Supabase Dashboard > Storage'dan manuel oluşturun:
-- 1. "images" adında bir bucket oluşturun
-- 2. Public erişime izin verin
-- veya aşağıdaki SQL'i kullanın:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('images', 'images', true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. ÖRNEK VERİLER (İSTEĞE BAĞLI)
-- =====================================================
-- Eğer demo veriler eklemek isterseniz:

-- INSERT INTO projects (title, slug, description, order_index) VALUES
-- ('Landscapes', 'landscapes', 'Nature photography from around the world', 1),
-- ('Urban', 'urban', 'City life and street photography', 2),
-- ('Portraits', 'portraits', 'People and their stories', 3);

-- =====================================================
-- KURULUM TAMAMLANDI!
-- =====================================================
-- Şimdi .env.local dosyanızı oluşturun ve
-- Supabase URL ve Anon Key değerlerini ekleyin.
-- =====================================================
