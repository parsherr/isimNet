# Plan: Google Drive Senkronizasyon

## Problem
Veriler sadece localStorage'a yazılıyor. Sayfa yenilenince localStorage'dan okunuyor, Drive'dan değil. Drive entegrasyonu eksik veya devre dışı — login olunca Drive'dan yükleme ve her mutation'da Drive'a yazma gerçekleşmiyor.

## Yapılacaklar (sırayla)

### 1. `/api/sync/route.ts` — Düzelt veya yaz
Drive API ile iki yönlü çalışan endpoint:
- `GET /api/sync` → Drive'daki 4 JSON dosyasını okur, `{ customers, products, sales, payments, lastSyncTime }` döner
- `POST /api/sync` → body'deki `{ customers, products, sales, payments }` verisini Drive'a yazar, `lastSyncTime` döner
- Her iki method da `auth()` ile oturumu doğrular, `accessToken`'ı kullanır

### 2. `src/context/DataContext.tsx` — Otomatik senkronizasyon ekle
- `lastSyncTime: Date | null` state'i ekle (localStorage'da `isimnet_last_sync` anahtarında sakla)
- `useEffect` — `status === "authenticated"` olunca `GET /api/sync` çek, Drive verisi localStorage'dan daha güncel veya localStorage boşsa state'i ve localStorage'ı Drive verisiyle güncelle
- Mevcut `syncToDrive()` fonksiyonunu `POST /api/sync` ile bağla, başarıda `lastSyncTime`'ı güncelle
- `lastSyncTime` ve `syncToDrive`'ı context'e ekle (interface zaten tanımlıysa kontrol et)

### 3. `src/app/dashboard/senkronizasyon/page.tsx` — Yeni sayfa (yeni dosya)
WhatsApp backup ekranı tarzı, tek odaklı sayfa:
- **Üst alan**: Büyük bulut/drive ikonu, "Google Drive Yedekleme" başlığı
- **Son yedekleme** satırı: `lastSyncTime` formatlanmış göster ("Henüz yedeklenmedi" veya "Bugün 14:30")
- **Veri özeti**: Müşteri, Ürün, Satış, Tahsilat sayıları (küçük kart/satır olarak)
- **"Şimdi Yedekle" butonu**: `syncToDrive()` çağırır, loading state gösterir
- **"Drive'dan Geri Yükle" link/butonu**: `GET /api/sync` çeker, mevcut veriyi ezer, onay modal'ı göster önce
- Senkronizasyon durumu için toast/inline feedback (başarı, hata)
- Header + geri linki (`← Dashboard`)

### 4. `src/app/dashboard/page.tsx` — Sync butonu ekle
Mevcut `menuItems` array'ine yeni kart ekle:
- href: `/dashboard/senkronizasyon`
- Başlık: "Senkronize Et"
- Açıklama: "Verileri Google Drive'a yedekle"
- İkon: Bulut/sync SVG, mor/indigo renk

## Dosya Değişiklikleri

| Dosya | Değişiklik |
|---|---|
| `src/app/api/sync/route.ts` | GET + POST endpoint yaz/düzelt |
| `src/context/DataContext.tsx` | Drive yükleme, `lastSyncTime`, otomatik sync |
| `src/app/dashboard/senkronizasyon/page.tsx` | Yeni sayfa — oluştur |
| `src/app/dashboard/page.tsx` | Sync menü kartı ekle |

## Sıra Önemli
1 → 2 → 3 → 4 sırası: API hazır olmadan context düzeltilemez, context hazır olmadan sayfa yazılamaz.