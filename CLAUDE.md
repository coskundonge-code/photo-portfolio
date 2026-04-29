# CLAUDE.md — photo-portfolio

> Bu dosya Cowork (Claude) oturumlarının başında okunur.
> Ana kural: `P:\AI_PROJECT\00_Sistem_Yonetimi\COSKUN_IKI_RAF_KURALLARI.md`

---

## 🌳 Branch Stratejisi — İKİ RAF MİMARİSİ (28 Nisan 2026)

Bu projede iki branch kullanılır:

### `coskun` rafı — Günlük çalışma
- 3 bilgisayar (AsusServer, GoPro, Huawei) ortak rafı
- Cowork **her oturum açılışında** otomatik `git pull origin coskun --ff-only` yapar
- Cowork **her oturum kapanışında** otomatik `git add -A && git commit && git push origin coskun` yapar
- Vercel bu rafı izlemez → auto-push güvenli, build minute harcamaz
- Kullanıcıya sormadan auto commit/push yapılır (sadece coskun rafına)

### `main` rafı — Canlı (production)
- Sadece kullanıcı **"deploy et", "canlıya al", "yayınla"** dediğinde push edilir
- Vercel bu rafı izler → build çalışır, para harcanır
- "Push gibi geri alınamaz işlemlerde önce sor" altın kuralı **sadece main için** geçerli
- Deploy akışı: `coskun` temiz mi → `main`'e fast-forward push → Vercel deploy

### Çakışma kuralları
- `git pull --ff-only` başarısız olursa: kullanıcıya bildir, otomatik merge YAPMA
- Uncommitted varken pull denerse: önce auto-commit, sonra pull
- coskun rafı yoksa: mevcut HEAD'den oluştur, push et

### Tam kural belgesi
`P:\AI_PROJECT\00_Sistem_Yonetimi\COSKUN_IKI_RAF_KURALLARI.md`

---

## 🏷️ TAKMA AD HARİTASI

Bu projenin farklı yerlerde farklı adı vardır. Hepsi **AYNI projedir**:

| Yer | Ad |
|---|---|
| Drive klasörü | `photo-portfolio` |
| **Kanonik ad** | `photo-portfolio` |
| GitHub repo | `coskundonge-code/photo-portfolio` |
| package.json "name" | `photo-portfolio` |
| Vercel proje | `photo-portfolio-5spd` |
| Kullanıcı zihninde | photo-portfolio, fotoğraf portfolyo, portfolio |

### Eşleşme kuralı
Kullanıcı şu kelimelerden birini söylerse → **bu projedesin**:
- photo, photo-portfolio, fotoğraf
- portfolyo, portfolio
- coşkun fotoğraf, coskun donge photography
