# 📸 Fotoğraf Portfolyö Sitesi - Kurulum Rehberi

Bu rehber, fotoğraf portfolyo ve satış sitenizi adım adım nasıl kuracağınızı anlatır.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Supabase Kurulumu](#1-supabase-kurulumu)
3. [Vercel Kurulumu](#2-vercel-kurulumu)
4. [Domain Bağlama](#3-domain-bağlama)
5. [Admin Paneli Kullanımı](#4-admin-paneli-kullanımı)
6. [Özelleştirme](#5-özelleştirme)
7. [Sorun Giderme](#sorun-giderme)

---

## Gereksinimler

Kurulum için ihtiyacınız olanlar:
- ✅ E-posta adresi (Supabase ve Vercel için)
- ✅ GitHub hesabı (ücretsiz)
- ✅ Domain (isteğe bağlı, Vercel ücretsiz subdomain verir)
- ⏱️ Yaklaşık 20-30 dakika

---

## 1. Supabase Kurulumu

Supabase, fotoğraflarınızı ve veritabanınızı barındıracak ücretsiz bir platformdur.

### Adım 1.1: Hesap Oluşturun

1. [supabase.com](https://supabase.com) adresine gidin
2. **Start your project** butonuna tıklayın
3. GitHub ile giriş yapın (veya e-posta ile kayıt olun)

### Adım 1.2: Yeni Proje Oluşturun

1. **New Project** butonuna tıklayın
2. Bilgileri doldurun:
   - **Name**: `photo-portfolio` (veya istediğiniz bir isim)
   - **Database Password**: Güçlü bir şifre belirleyin ve **not alın!**
   - **Region**: `Frankfurt (eu-central-1)` - Türkiye'ye yakın
3. **Create new project** tıklayın
4. ~2 dakika bekleyin, proje oluşturulacak

### Adım 1.3: Veritabanı Tablolarını Oluşturun

1. Sol menüden **SQL Editor** seçin
2. **New query** tıklayın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. **Run** butonuna tıklayın (veya Ctrl/Cmd + Enter)
5. ✅ "Success" mesajını görmelisiniz

### Adım 1.4: Storage (Fotoğraf Depolama) Ayarlayın

1. Sol menüden **Storage** seçin
2. **New bucket** tıklayın
3. Ayarlar:
   - **Name**: `images`
   - **Public bucket**: ✅ İşaretleyin
4. **Create bucket** tıklayın

### Adım 1.5: API Anahtarlarını Alın

1. Sol menüden **Project Settings** (dişli ikonu) seçin
2. **API** sekmesine tıklayın
3. Şu değerleri not alın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOi...` (uzun bir metin)

---

## 2. Vercel Kurulumu

Vercel, sitenizi ücretsiz olarak yayınlayacak platformdur.

### Adım 2.1: GitHub'a Kodu Yükleyin

1. [github.com](https://github.com) adresine gidin
2. Sağ üstten **+** > **New repository** tıklayın
3. Repository adı: `photo-portfolio`
4. **Private** seçin
5. **Create repository** tıklayın

Şimdi terminalde (veya GitHub Desktop ile):

```bash
# Proje klasörüne gidin
cd photo-portfolio

# Git'i başlatın
git init

# Dosyaları ekleyin
git add .

# Commit yapın
git commit -m "Initial commit"

# GitHub'a bağlayın (YOUR_USERNAME yerine GitHub kullanıcı adınızı yazın)
git remote add origin https://github.com/YOUR_USERNAME/photo-portfolio.git

# Yükleyin
git push -u origin main
```

### Adım 2.2: Vercel'e Bağlayın

1. [vercel.com](https://vercel.com) adresine gidin
2. **Start Deploying** > **Continue with GitHub** tıklayın
3. Vercel'in GitHub'a erişmesine izin verin
4. `photo-portfolio` reposunu seçin
5. **Import** tıklayın

### Adım 2.3: Environment Variables (Ortam Değişkenleri)

Deploy ekranında **Environment Variables** bölümünü bulun ve şunları ekleyin:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL'niz |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key'iniz |
| `ADMIN_PASSWORD` | Admin paneli için şifreniz |
| `NEXT_PUBLIC_SITE_NAME` | Sitenizin adı |

### Adım 2.4: Deploy

1. **Deploy** butonuna tıklayın
2. ~2-3 dakika bekleyin
3. ✅ Siteniz hazır! `https://photo-portfolio-xxx.vercel.app` gibi bir URL alacaksınız

---

## 3. Domain Bağlama

Kendi domain adresinizi kullanmak için:

### Vercel'de Domain Ekleme

1. Vercel dashboard'da projenizi seçin
2. **Settings** > **Domains** gidin
3. Domain adresinizi yazın (örn: `www.yourname.com`)
4. **Add** tıklayın

### DNS Ayarları

Domain sağlayıcınızda (GoDaddy, Namecheap, vb.) şu DNS kayıtlarını ekleyin:

```
Tip: A
Ad: @
Değer: 76.76.21.21

Tip: CNAME
Ad: www
Değer: cname.vercel-dns.com
```

⏱️ DNS değişiklikleri 24-48 saat sürebilir.

---

## 4. Admin Paneli Kullanımı

### Giriş

1. `https://your-site.com/admin` adresine gidin
2. Belirlediğiniz `ADMIN_PASSWORD` ile giriş yapın

### Fotoğraf Yükleme

1. **Photos** menüsüne gidin
2. Fotoğrafları sürükle-bırak ile yükleyin
3. Başlıkları düzenlemek için kalem ikonuna tıklayın
4. Sıralamayı değiştirmek için sürükleyin

### Proje Oluşturma

1. **Projects** menüsüne gidin
2. **New Project** tıklayın
3. İsim ve açıklama girin
4. Projeyi kaydedin
5. Photos bölümünden fotoğrafları projelere atayın

### Ürün/Fiyat Belirleme

1. **Products** menüsüne gidin
2. **New Product** tıklayın
3. Bir fotoğraf seçin
4. Fiyat ve edition türü belirleyin:
   - **Open Edition**: Sınırsız baskı
   - **Collector Edition**: Sınırlı sayıda (örn: 25 adet)
5. Kaydedin

### Hızlı Fiyat Değiştirme

Ürünler listesinde, fiyat kutusuna direkt yazıp değiştirebilirsiniz.

---

## 5. Özelleştirme

### Renk Değiştirme

`tailwind.config.js` dosyasında:

```javascript
colors: {
  accent: {
    DEFAULT: '#C9A962', // Ana vurgu rengi (altın)
    // İstediğiniz renge değiştirin, örn: '#E63946' (kırmızı)
  }
}
```

### Logo/Site Adı

`app/page.tsx` ve `components/Navigation.tsx` dosyalarında:

```jsx
siteName="SİZİN İSMİNİZ"
```

### Hakkımda Bilgilerini Düzenleme

`app/about/page.tsx` dosyasını düzenleyin.

### İletişim Bilgilerini Düzenleme

`app/contact/page.tsx` ve `components/Footer.tsx` dosyalarını düzenleyin.

---

## Sorun Giderme

### "Fotoğraflar yüklenmiyor"

- Supabase Storage'da `images` bucket'ının **public** olduğundan emin olun
- Browser console'da hata mesajını kontrol edin

### "Admin paneline giremiyorum"

- `ADMIN_PASSWORD` environment variable'ı doğru ayarlandı mı?
- Vercel'de değişiklik yaptıysanız **Redeploy** yapın

### "Veriler görünmüyor"

- Supabase SQL şemasını çalıştırdınız mı?
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru mu?

### "Site yavaş açılıyor"

- İlk açılışta biraz beklemesi normal (cold start)
- Fotoğrafları optimize edin (WebP formatı, max 2000px genişlik)

---

## Maliyet

| Hizmet | Ücretsiz Plan Limitleri | Ücretli |
|--------|------------------------|---------|
| **Supabase** | 500MB veritabanı, 1GB storage | $25/ay'dan başlıyor |
| **Vercel** | 100GB bandwidth/ay | $20/ay'dan başlıyor |
| **Domain** | - | ~$10-15/yıl |

Başlangıç için ücretsiz planlar fazlasıyla yeterli!

---

## Destek

Sorularınız için:
- GitHub Issues açabilirsiniz
- Vercel ve Supabase'in kendi dökümantasyonlarına bakabilirsiniz

🎉 **Siteniz hazır! Başarılar!**
