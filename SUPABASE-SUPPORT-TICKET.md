# Supabase Support Ticket — Short Version

**Where to send:** https://supabase.com/dashboard/support/new
**Category:** Database / Data Loss
**Priority:** Urgent

---

## Subject

```
Urgent: restore deleted production project — coskundonge.com (tried under 2 accounts)
```

---

## Message Body

```
Hi Supabase Support,

I need urgent help restoring a deleted production Supabase project that
was powering my live site www.coskundonge.com (fine-art photography +
e-commerce). It was on the free tier and I believe it was auto-paused,
then deleted, during a period of low DB traffic (the site is cached by
Next.js ISR, so my domain hits the DB rarely).

I am not 100% sure which of my two Supabase accounts the project was
under — please check BOTH:

  1) coskundonge@coskundonge.com
     Org: "coskundonge@coskundonge.com's Org"
     Org slug: iyqasjloontzhpeqwbfz
     (Still active. Project is no longer in the list — 7 unrelated
     projects remain, none contain the tables below.)

  2) coskun.donge@gmail.com
     I may have deleted this entire account at some point. If it still
     exists on your side, please check it too — it is the most likely
     original owner.

Project name (best guess): "photo-portfolio" (created ~Jan–Feb 2026,
region eu-central-1 or eu-west-1, Free plan).

Timeline:
  • Feb 4 2026 — production deployed on Vercel against this project
    (Vercel project: photo-portfolio-5spd,
     prj_h4uh46MirhRLqlUwje0Hikh1W423).
  • By Apr 14 2026 (earliest in my 7-day log window) — every server
    render of "/" logs: "Error fetching photos/projects/featured
    photos" — i.e. the supabase-js client can no longer reach the URL.
  • Apr 21 2026 — I checked the dashboard and the project is gone.

What I need:
  • Full restore from an internal backup, OR
  • A pg_dump / CSV export of the public schema + auth.users, OR
  • Temporary read-only access so I can export it myself.

Tables (CREATE statements available in my supabase-schema.sql on request):
  public.settings, projects, photos, products, product_sizes,
  frame_options, customers, orders, order_items, cart_items, members
  + auth.users

Why this is critical: image files themselves are safe on Cloudinary,
but the metadata that links them to projects/ordering/print product
configurations/customers/members exists ONLY in this Supabase project.
Months of content work.

I understand the free tier does not guarantee restore of deleted
projects. I am ready to upgrade to a paid plan immediately if it
helps, and I will enable PITR on the restored project. I have NOT
created a replacement project or touched the Vercel env vars, so
nothing on my side is blocking a clean restore.

Please reply to coskundonge@coskundonge.com — I can provide schema
file, Vercel deployment ID, log excerpts, or dashboard screenshots
on request.

Thank you for any help you can offer.

Coşkun Dönge
https://www.coskundonge.com
```

---

## Gönderim notları

- Subject'i aynen yapıştır.
- Message body'yi üç `---` çizgileri OLMADAN, sadece kod bloğunun içindekini yapıştır (başta "Hi Supabase Support," ile başlıyor).
- Category: **Database** (yoksa "Other")
- Priority: **Urgent**
- Cevapları iki email'e de bakmalarını açıkça söyledim — silinmiş olsa bile Supabase eski hesap/proje kayıtlarını kısa süre tutuyor.

24-48 saatte cevap gelmezse takip mesajını da yazarım. Bu arada dashboard'da "Paused Projects" görünen bir şey var mı bir de bak — varsa ID'sini ver, restore komutunu ben çalıştırırım.
