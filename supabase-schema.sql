-- =====================================================================
--  COŞKUN DÖNGE PHOTO PORTFOLIO — SUPABASE VERİTABANI ŞEMASI
-- =====================================================================
--  Bu dosya TEKRAR TEKRAR ÇALIŞTIRILABİLİR (idempotent):
--    • Boş bir Supabase projesinde tüm tabloları sıfırdan kurar.
--    • Nisan 2026'da eski şemayla geri yüklenen veritabanını (uiwnhmhxqkhlhmnrmroq)
--      uygulamanın beklediği hale getirir; mevcut verilere dokunmaz.
--
--  Nasıl çalıştırılır:
--    Supabase Dashboard → SQL Editor → New query → bu dosyanın tamamını yapıştır → Run
--
--  Uygulamanın (lib/supabase.ts) beklediği tablolar:
--    settings, projects, photos, products, product_sizes, frame_options,
--    customers, orders, order_items, cart_items, members
-- =====================================================================

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 0. Ortak updated_at tetikleyici fonksiyonu
-- ---------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. SETTINGS (site ayarları, tek satır: id = 'main')
-- ---------------------------------------------------------------------
create table if not exists public.settings (
    id          varchar(50) primary key default 'main',
    site_name   varchar(255) default 'Coşkun Dönge',
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

alter table public.settings
    add column if not exists site_description text,
    add column if not exists contact_email    varchar(255),
    add column if not exists instagram_url    varchar(255),
    add column if not exists about_text       text,
    add column if not exists about_image      text,
    add column if not exists email            varchar(255),
    add column if not exists instagram        varchar(255),
    add column if not exists linkedin         varchar(255),
    add column if not exists footer_text      text,
    add column if not exists menu_overview    varchar(100) default 'Overview',
    add column if not exists menu_work        varchar(100) default 'Work',
    add column if not exists menu_shop        varchar(100) default 'Shop',
    add column if not exists menu_about       varchar(100) default 'About',
    add column if not exists menu_contact     varchar(100) default 'Contact';

insert into public.settings (id, site_name)
values ('main', 'Coşkun Dönge')
on conflict (id) do nothing;

-- Eski sütunlardaki değerleri yeni sütunlara taşı (yalnızca boşsa)
update public.settings
set    email     = coalesce(email, nullif(contact_email, 'hello@example.com')),
       instagram = coalesce(instagram, instagram_url)
where  id = 'main';

-- ---------------------------------------------------------------------
-- 2. PROJECTS (koleksiyonlar)
-- ---------------------------------------------------------------------
create table if not exists public.projects (
    id          uuid primary key default gen_random_uuid(),
    title       varchar(255) not null,
    slug        varchar(255) not null unique,
    description text,
    cover_image text,
    order_index integer default 0,
    is_visible  boolean default true,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

alter table public.projects
    add column if not exists description text,
    add column if not exists cover_image text,
    add column if not exists order_index integer default 0,
    add column if not exists is_visible  boolean default true;

create index if not exists idx_projects_slug    on public.projects(slug);
create index if not exists idx_projects_visible on public.projects(is_visible);

-- ---------------------------------------------------------------------
-- 3. PHOTOS (fotoğraflar; dosyalar Cloudinary'de, metadata burada)
-- ---------------------------------------------------------------------
create table if not exists public.photos (
    id            uuid primary key default gen_random_uuid(),
    title         varchar(255),
    description   text,
    url           text not null,
    thumbnail_url text,
    project_id    uuid references public.projects(id) on delete set null,
    order_index   integer default 0,
    created_at    timestamptz default now(),
    updated_at    timestamptz default now()
);

alter table public.photos
    add column if not exists description   text,
    add column if not exists thumbnail_url text,
    add column if not exists order_index   integer default 0,
    add column if not exists is_featured   boolean default false,
    add column if not exists width         integer,
    add column if not exists height        integer,
    add column if not exists orientation   varchar(20),
    add column if not exists theme         varchar(50);

update public.photos
set    orientation = case when height > width then 'portrait' else 'landscape' end
where  orientation is null and width is not null and height is not null;

create index if not exists idx_photos_project  on public.photos(project_id);
create index if not exists idx_photos_order    on public.photos(order_index);
create index if not exists idx_photos_featured on public.photos(is_featured);

-- ---------------------------------------------------------------------
-- 4. PRODUCTS (mağaza ürünleri)
-- ---------------------------------------------------------------------
create table if not exists public.products (
    id           uuid primary key default gen_random_uuid(),
    photo_id     uuid references public.photos(id) on delete cascade,
    title        varchar(255) not null,
    description  text,
    story        text,
    base_price   numeric(10,2) not null default 0,
    edition_type varchar(50) default 'open',
    edition_total integer,
    edition_sold  integer default 0,
    is_active    boolean default true,
    is_available boolean default true,
    paper_type   varchar(100),
    print_method varchar(100),
    order_index  integer default 0,
    created_at   timestamptz default now(),
    updated_at   timestamptz default now()
);

alter table public.products
    add column if not exists photo_id      uuid references public.photos(id) on delete cascade,
    add column if not exists description   text,
    add column if not exists story         text,
    add column if not exists edition_type  varchar(50) default 'open',
    add column if not exists edition_total integer,
    add column if not exists edition_sold  integer default 0,
    add column if not exists is_active     boolean,
    add column if not exists is_available  boolean default true,
    add column if not exists paper_type    varchar(100),
    add column if not exists print_method  varchar(100),
    add column if not exists order_index   integer default 0;

-- Eski şemadaki is_available değerini yeni is_active sütununa taşı
update public.products
set    is_active = coalesce(is_active, is_available, true)
where  is_active is null;

alter table public.products alter column is_active set default true;
alter table public.products alter column is_active set not null;

-- Eski şemadaki 'collector' edisyonu uygulamada 'limited' olarak adlandırılıyor
do $$
declare
    c record;
begin
    for c in
        select conname
        from   pg_constraint
        where  conrelid = 'public.products'::regclass
        and    contype  = 'c'
        and    pg_get_constraintdef(oid) ilike '%edition_type%'
    loop
        execute format('alter table public.products drop constraint %I', c.conname);
    end loop;
end $$;

update public.products set edition_type = 'limited' where edition_type = 'collector';
update public.products set edition_type = 'open'    where edition_type is null;

alter table public.products
    add constraint products_edition_type_check
    check (edition_type in ('open', 'limited'));

-- is_active ve is_available her zaman aynı değeri taşısın (eski/yeni istemci uyumu)
create or replace function public.products_sync_availability()
returns trigger
language plpgsql
as $$
begin
    if tg_op = 'INSERT' then
        new.is_active    := coalesce(new.is_active, new.is_available, true);
        new.is_available := new.is_active;
    else
        if new.is_active is distinct from old.is_active then
            new.is_available := new.is_active;
        elsif new.is_available is distinct from old.is_available then
            new.is_active := coalesce(new.is_available, true);
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists products_sync_availability on public.products;
create trigger products_sync_availability
    before insert or update on public.products
    for each row execute function public.products_sync_availability();

create index if not exists idx_products_active    on public.products(is_active);
create index if not exists idx_products_available on public.products(is_available);
create index if not exists idx_products_photo     on public.products(photo_id);
create index if not exists idx_products_edition   on public.products(edition_type);

-- ---------------------------------------------------------------------
-- 5. PRODUCT_SIZES (ürün başına baskı boyutları ve fiyatları)
-- ---------------------------------------------------------------------
create table if not exists public.product_sizes (
    id          uuid primary key default gen_random_uuid(),
    product_id  uuid not null references public.products(id) on delete cascade,
    name        varchar(100) not null,
    dimensions  varchar(100),
    price       numeric(10,2) not null default 0,
    order_index integer default 0,
    created_at  timestamptz default now()
);

create index if not exists idx_product_sizes_product on public.product_sizes(product_id);

-- ---------------------------------------------------------------------
-- 6. FRAME_OPTIONS (çerçeve seçenekleri)
-- ---------------------------------------------------------------------
create table if not exists public.frame_options (
    id          uuid primary key default gen_random_uuid(),
    name        varchar(100) not null,
    color       varchar(50),
    price       numeric(10,2) not null default 0,
    order_index integer default 0,
    is_active   boolean default true,
    created_at  timestamptz default now()
);

insert into public.frame_options (name, color, price, order_index, is_active)
select * from (values
    ('Black',  '#1a1a1a',   0, 0, true),
    ('White',  '#f8f8f8',   0, 1, true),
    ('Oak',    '#c9a66b', 200, 2, true),
    ('Walnut', '#5d4037', 200, 3, true)
) as v(name, color, price, order_index, is_active)
where not exists (select 1 from public.frame_options);

-- ---------------------------------------------------------------------
-- 7. CUSTOMERS (sipariş veren müşteriler)
-- ---------------------------------------------------------------------
create table if not exists public.customers (
    id          uuid primary key default gen_random_uuid(),
    email       varchar(255) not null unique,
    name        varchar(255),
    phone       varchar(50),
    address     text,
    city        varchar(100),
    postal_code varchar(20),
    country     varchar(100),
    is_guest    boolean default true,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 8. ORDERS (siparişler)
-- ---------------------------------------------------------------------
create table if not exists public.orders (
    id               uuid primary key default gen_random_uuid(),
    customer_id      uuid references public.customers(id) on delete set null,
    customer_name    varchar(255) not null,
    customer_email   varchar(255) not null,
    customer_phone   varchar(50),
    customer_address text,
    shipping_address text,
    total_amount     numeric(10,2) not null default 0,
    status           varchar(50) default 'pending',
    payment_method   varchar(50),
    payment_status   varchar(50) default 'pending',
    tracking_number  varchar(100),
    notes            text,
    created_at       timestamptz default now(),
    updated_at       timestamptz default now()
);

alter table public.orders
    add column if not exists customer_id      uuid references public.customers(id) on delete set null,
    add column if not exists customer_phone   varchar(50),
    add column if not exists customer_address text,
    add column if not exists shipping_address text,
    add column if not exists payment_method   varchar(50),
    add column if not exists payment_status   varchar(50) default 'pending',
    add column if not exists tracking_number  varchar(100),
    add column if not exists notes            text;

-- Uygulama shipping_address kullanır; eski zorunlu customer_address serbest bırakılır
alter table public.orders alter column customer_address drop not null;

create index if not exists idx_orders_status   on public.orders(status);
create index if not exists idx_orders_email    on public.orders(customer_email);
create index if not exists idx_orders_customer on public.orders(customer_id);

-- ---------------------------------------------------------------------
-- 9. ORDER_ITEMS (sipariş kalemleri)
-- ---------------------------------------------------------------------
create table if not exists public.order_items (
    id            uuid primary key default gen_random_uuid(),
    order_id      uuid references public.orders(id) on delete cascade,
    product_id    uuid references public.products(id) on delete set null,
    product_title varchar(255),
    quantity      integer default 1,
    size          varchar(100),
    size_name     varchar(100),
    frame         varchar(100),
    frame_option  varchar(100),
    frame_name    varchar(100),
    style         varchar(50),
    paper         varchar(100),
    paper_type    varchar(100),
    unit_price    numeric(10,2) not null default 0,
    created_at    timestamptz default now()
);

alter table public.order_items
    add column if not exists product_title varchar(255),
    add column if not exists quantity      integer default 1,
    add column if not exists size          varchar(100),
    add column if not exists size_name     varchar(100),
    add column if not exists frame         varchar(100),
    add column if not exists frame_option  varchar(100),
    add column if not exists frame_name    varchar(100),
    add column if not exists style         varchar(50),
    add column if not exists paper         varchar(100),
    add column if not exists paper_type    varchar(100),
    add column if not exists unit_price    numeric(10,2) not null default 0;

alter table public.order_items alter column product_title drop not null;

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- 10. CART_ITEMS (sunucu tarafı sepet)
-- ---------------------------------------------------------------------
create table if not exists public.cart_items (
    id          uuid primary key default gen_random_uuid(),
    session_id  varchar(255) not null,
    customer_id uuid references public.customers(id) on delete set null,
    product_id  uuid not null references public.products(id) on delete cascade,
    size_id     uuid references public.product_sizes(id) on delete set null,
    frame_id    uuid references public.frame_options(id) on delete set null,
    style       varchar(50) default 'mat',
    quantity    integer default 1,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

create index if not exists idx_cart_items_session on public.cart_items(session_id);

-- ---------------------------------------------------------------------
-- 11. MEMBERS (üyelik; auth.users ile 1:1)
-- ---------------------------------------------------------------------
create table if not exists public.members (
    id              uuid primary key references auth.users(id) on delete cascade,
    email           varchar(255) not null,
    name            varchar(255),
    phone           varchar(50),
    is_active       boolean default true,
    role            varchar(20) default 'member' check (role in ('member', 'admin')),
    membership_type varchar(50),
    notes           text,
    last_login      timestamptz,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

alter table public.members
    add column if not exists phone           varchar(50),
    add column if not exists is_active       boolean default true,
    add column if not exists role            varchar(20) default 'member',
    add column if not exists membership_type varchar(50),
    add column if not exists notes           text,
    add column if not exists last_login      timestamptz;

create index if not exists idx_members_email on public.members(email);

-- Yeni auth kullanıcısı için otomatik üye kaydı
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.members (id, email, name, is_active, role)
    values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', ''), true, 'member')
    on conflict (id) do update set email = excluded.email;
    return new;
end;
$$;

do $$
begin
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
        after insert on auth.users
        for each row execute function public.handle_new_auth_user();
exception
    when insufficient_privilege then
        raise notice 'auth.users tetikleyicisi kurulamadı (yetki yok); üye kaydı uygulama tarafından oluşturulur.';
end $$;

-- ---------------------------------------------------------------------
-- 12. updated_at tetikleyicileri
-- ---------------------------------------------------------------------
do $$
declare
    t text;
begin
    foreach t in array array['settings', 'projects', 'photos', 'products', 'customers', 'orders', 'cart_items', 'members']
    loop
        execute format('drop trigger if exists update_%s_updated_at on public.%I', t, t);
        execute format(
            'create trigger update_%s_updated_at before update on public.%I for each row execute function public.update_updated_at_column()',
            t, t
        );
    end loop;
end $$;

-- ---------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
--  Uygulama tüm okuma/yazma işlemlerini (yönetim paneli dahil) herkese açık
--  "publishable/anon" anahtarla yapar; sunucu tarafı yetkilendirme yoktur.
--  Bu yüzden politikalar anon + authenticated rollerine tam erişim verir.
--  Yönetim panelini gerçek bir kimlik doğrulamaya taşıdığınızda bu politikalar
--  daraltılmalıdır.
do $$
declare
    t text;
begin
    foreach t in array array[
        'settings', 'projects', 'photos', 'products', 'product_sizes', 'frame_options',
        'customers', 'orders', 'order_items', 'cart_items', 'members'
    ]
    loop
        execute format('alter table public.%I enable row level security', t);
        -- eski/ad çakışan politikaları temizle
        execute format('drop policy if exists "Public can view visible projects" on public.%I', t);
        execute format('drop policy if exists "Public can view photos" on public.%I', t);
        execute format('drop policy if exists "Public can view available products" on public.%I', t);
        execute format('drop policy if exists "Public can view settings" on public.%I', t);
        execute format('drop policy if exists "%s app access" on public.%I', t, t);
        execute format(
            'create policy "%s app access" on public.%I for all to anon, authenticated using (true) with check (true)',
            t, t
        );
    end loop;
end $$;

commit;

-- =====================================================================
--  İSTEĞE BAĞLI VERİ TEMİZLİĞİ (çalıştırmadan önce okuyun; varsayılan olarak kapalı)
-- =====================================================================
--  Nisan 2026 geri yüklemesinde "001_DSC_0275" başlıklı fotoğraf üç kez kayıtlıdır ve
--  bunlardan biri (beac9975-...) gerçekte 200×133 piksellik bir küçük resimdir; galeride
--  büyütüldüğünde bulanık görünür. Gereksiz olduğuna karar verirseniz:
--
--  delete from public.photos where id in (
--      'beac9975-005c-47dc-a7eb-0be4559e8e81',   -- 200×133 px küçük resim
--      '99025f3f-209c-4202-99cb-f32d7c1dd64e'    -- 001_DSC_0275 kopyası
--  );
-- =====================================================================
