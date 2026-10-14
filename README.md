# Coşkun Dönge — Photo Portfolio

Fine-art fotoğraf portfolyosu ve baskı mağazası. Canlı site: https://www.coskundonge.com

## Yığın

| Katman | Teknoloji |
|---|---|
| Uygulama | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Veritabanı / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Görsel depolama | Cloudinary (unsigned upload) |
| Barındırma | Vercel (`photo-portfolio-5spd`, üretim dalı `main`) |

## Geliştirme

```bash
npm ci
cp .env.local.example .env.local   # NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                        # http://localhost:3000
npm run build && npm start         # üretim derlemesi
```

## Veritabanı

Şema tek dosyadadır: [`supabase-schema.sql`](./supabase-schema.sql). Dosya **idempotent**'tir:
boş bir projede sıfırdan kurar, mevcut bir projede yalnızca eksik sütun/tablo/politikaları ekler.
Supabase Dashboard → SQL Editor → dosyanın tamamını yapıştır → Run.

Ekim 2026'da yaşanan veri kaybı ve geri yükleme sonrası yapılması gerekenler için:
[`docs/VERITABANI-ONARIM.md`](./docs/VERITABANI-ONARIM.md)

İlk kurulum rehberi: [`KURULUM-REHBERI.md`](./KURULUM-REHBERI.md)

## Dizin yapısı

```
app/            Sayfalar (App Router): /, /work, /shop, /shop/[id], /about, /contact, /checkout, /account, /admin/*
components/     Navigation, Footer, HomeGallery, MasonryGrid, Lightbox, CartDrawer, AuthModal
lib/            supabase.ts (veri katmanı), cloudinary.ts (yükleme), auth.tsx, store.ts, language.ts
lib/translations/  en.json, tr.json
supabase-schema.sql  Veritabanı şeması (idempotent)
docs/           Operasyon belgeleri
```

## Dallar

- `main` — canlı (Vercel bu dalı izler)
- `coskun` — günlük çalışma rafı (Vercel izlemez)
