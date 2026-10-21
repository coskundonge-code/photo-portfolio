# Veritabanı Onarım Rehberi — Ekim 2026

Bu belge, www.coskundonge.com sitesinin Ekim 2026'daki durumunu, neyin bozulduğunu ve
nasıl tam çalışır hale getirileceğini adım adım anlatır.

## 1. Ne oldu?

| Tarih | Olay |
|---|---|
| Şubat 2026 | Site, Supabase projesi + Vercel (`photo-portfolio-5spd`) ile yayına alındı. |
| Nisan 2026 | Orijinal Supabase projesi (ücretsiz plan) duraklatılıp silindi. Fotoğraf dosyaları Cloudinary'de olduğu için kaybolmadı; ama proje/fotoğraf/ürün/üye kayıtları gitti. |
| 22 Nisan 2026 | Yeni bir Supabase projesi (`uiwnhmhxqkhlhmnrmroq`) açıldı, depodaki **eski** `supabase-schema.sql` çalıştırıldı ve 1 proje + 8 fotoğraf elle geri yüklendi. Vercel ortam değişkenleri bu projeye yönlendirildi. |
| Eylül 2026 | Son üretim derlemesi (`main` @ f9e699e) bu veritabanıyla yapıldı. Derleme günlüğünde `column products.is_active does not exist` hatası var. |

Sonuç: uygulama kodu (lib/supabase.ts) geri yüklenen veritabanından **daha yeni** bir şema
bekliyor. Eksikler:

- `products.is_active` (eski şemada `is_available`), `story`, `edition_total`, `edition_sold`,
  `paper_type`, `print_method`, `order_index`; `edition_type` kısıtı `'limited'` değerine izin vermiyor.
- `product_sizes`, `frame_options`, `customers`, `cart_items`, `members` tabloları yok.
- `orders` / `order_items` tablolarında uygulamanın yazdığı sütunlar yok.
- RLS politikaları yalnızca okuma izni veriyor; yönetim paneli yazamıyor.

Görünen belirtiler:

- **Mağaza boş** ("Bu kategoride eser bulunamadı") — ürün sorgusu 400 hatası alıyor.
- Yönetim panelinde ürün ekleme / sıralama / üye listesi çalışmıyor.
- Üye kaydı (`members` tablosu yok) tamamlanamıyor.
- Ana sayfa lightbox'ı telefonda fotoğrafı yandan kesiyordu (bu kod tarafında düzeltildi).

## 2. Yapılacaklar (sırayla)

### Adım 1 — Veritabanı şemasını hizala (5 dakika)

1. https://supabase.com/dashboard adresine **veritabanının sahibi olan hesapla** girin
   (proje `uiwnhmhxqkhlhmnrmroq` — büyük olasılıkla `coskun.donge@gmail.com`).
2. Projeyi açın → **SQL Editor** → **New query**.
3. Depodaki `supabase-schema.sql` dosyasının **tamamını** yapıştırın → **Run**.
4. "Success" görmelisiniz. Dosya tekrar tekrar çalıştırılabilir; mevcut verilere dokunmaz,
   sadece eksik sütun/tablo/politikaları ekler.

Doğrulama (SQL Editor'da):

```sql
select column_name from information_schema.columns
where table_name = 'products' and column_name in ('is_active','is_available','edition_total');
-- 3 satır dönmeli

select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('product_sizes','frame_options','members','customers','cart_items');
-- 5 satır dönmeli
```

### Adım 2 — Kodu yayına al

Bu değişiklikleri içeren PR `main` dalına birleştirildiğinde Vercel otomatik derler.
Kod, şema hizalanmadan **önce** bile mağazayı çalıştıracak şekilde toleranslıdır
(`is_active` yoksa `is_available` kullanır); ama yönetim panelindeki yazma işlemleri
ve üyelik için Adım 1 şarttır.

### Adım 3 — Kontrol listesi

- [ ] `/shop` ürünleri listeliyor (en az bir ürün için fotoğraf → "Mağazaya ekle" işaretli olmalı).
- [ ] `/admin/products` → yeni ürün eklenebiliyor, sürükle-bırak sıralama kaydediliyor.
- [ ] `/admin/members` → liste açılıyor; sitede üye kaydı tamamlanıyor.
- [ ] Ana sayfa lightbox'ı telefonda yatay fotoğrafı tam gösteriyor.

### Adım 4 — İsteğe bağlı veri temizliği

Geri yüklemede `001_DSC_0275` başlıklı fotoğraf **üç kez** kaydedilmiş. Bunlardan
`beac9975-…` gerçekte **200×133 piksel** boyutunda bir küçük resim; galeride büyütülünce
bulanık görünür. Silmek isterseniz `supabase-schema.sql` dosyasının sonundaki yorum satırı
haline getirilmiş `delete` komutunu kullanın ya da yönetim panelinden silin.

`settings` tablosundaki `contact_email = hello@example.com` değeri eski şemanın varsayılanıdır;
site `email` sütununu kullanır, zararı yoktur.

### Adım 5 — Claude bağlayıcısına veritabanı erişimi verin (gelecekteki otomasyon için)

Bu oturumda Claude'un Supabase bağlayıcısı yalnızca `coskundonge@coskundonge.com's Org`
organizasyonunu görüyor; `uiwnhmhxqkhlhmnrmroq` projesi orada değil. Bundan sonra
migrasyonların Claude tarafından doğrudan uygulanabilmesi için iki seçenek:

- Supabase'de `uiwnhmhxqkhlhmnrmroq` projesinin bulunduğu organizasyona
  `coskundonge@coskundonge.com` adresini üye olarak davet edin, **veya**
- claude.ai → Ayarlar → Bağlayıcılar → Supabase bağlantısını, projenin sahibi hesapla
  yeniden yetkilendirin.

## 3. Bilinmesi gereken riskler

- **Yönetim paneli herkese açık anahtarla yazıyor.** Şema dosyasındaki RLS politikaları bu
  yüzden `anon` rolüne tam erişim verir. Anahtarı (publishable key) bilen herkes veritabanına
  yazabilir. Kalıcı çözüm: yönetim panelini Supabase Auth (admin rolü) arkasına almak.
- **Yönetici şifresi istemci paketinde** (`lib/store.ts`). Aynı şekilde Supabase Auth'a
  taşınmalıdır.
- **Ücretsiz Supabase planı 7 gün trafik olmayınca projeyi duraklatır.** Site ISR ile
  önbelleklendiği için veritabanına seyrek gidilir. Supabase panelinde projeyi
  "Pro" plana almak ya da haftalık ziyaret eden bir uptime kontrolü kurmak tekrar kaybı önler.
  Ayrıca Supabase → Database → Backups bölümünden düzenli yedek alın.

## 4. Üretim ortamı özeti

| Bileşen | Değer |
|---|---|
| Vercel projesi | `photo-portfolio-5spd` (takım: Coskun Donge's projects) |
| Üretim dalı | `main` |
| Alan adları | www.coskundonge.com, coskundonge.com (DNS doğru) |
| Supabase projesi | `uiwnhmhxqkhlhmnrmroq` (üretim paketinden doğrulandı) |
| Görsel depolama | Cloudinary `dgiak1uhc`, klasör `photo-portfolio`, unsigned preset `photo-portfolio` |

## 5. Kod tarafındaki geçici koruma (21 Ekim 2026)

Veritabanındaki mükerrer ve küçük boyutlu fotoğraf kayıtları silinene kadar
`lib/gallery.ts` içindeki `filterGalleryPhotos` herkese açık galerilerde (ana sayfa,
`/gallery`, `/work`) şu kayıtları gizler:

- uzun kenarı 600 pikselin altında olan görseller (küçük resim boyutunda yüklemeler),
- aynı başlık ve aynı piksel boyutlarına sahip ikinci ve sonraki kayıtlar.

Yönetim paneli bu filtreyi kullanmaz; tüm kayıtları görmeye ve silmeye devam eder.
Adım 1 ve Adım 4 uygulandıktan sonra bu filtrenin etkisi kalmaz, kaldırılması gerekmez.
