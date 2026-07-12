# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# İşimNet

Küçük ve orta ölçekli işletmeler için müşteri cari hesabı ve ürün stok yönetimi uygulaması. Detaylı proje dokümanı: `docs/proje-dokumani.md`

## Komutlar

```bash
npm run dev      # Geliştirme sunucusu (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

Test altyapısı henüz kurulmamış.

## Teknoloji

- **Framework:** Next.js (App Router) + TypeScript
- **Stil:** Tailwind CSS v4
- **Host:** Vercel (serverless)
- **Auth:** NextAuth.js v5 (beta) — Google OAuth
- **Depolama:** localStorage (önbellek) + Google Drive API (kalıcı, kullanıcı başına ayrı JSON dosyaları)

## Dizin Yapısı

```
src/
  app/
    api/
      auth/[...nextauth]/  # NextAuth route handler
      sync/                # Google Drive senkronizasyon (GET: yükle, POST: kaydet)
    dashboard/             # Ana ekran — modül kartları
    dashboard/musteriler/  # Müşteri listesi + detay
    dashboard/urunler/     # Ürün listesi + detay
    dashboard/raporlar/    # Raporlar ve istatistikler
  lib/
    drive.ts               # Drive API yardımcıları (readDriveFile, writeDriveFile)
    auth.ts                # NextAuth yapılandırması (handlers, auth, signIn/Out)
    customers.ts           # Customer tipleri + buildActivityFeed
    products.ts            # Product tipleri + yardımcılar
    format.ts              # Para birimi formatlama
    seedData.ts            # Geliştirme için örnek veri
  context/
    DataContext.tsx        # Global state — useData() hook'u, tüm CRUD
  types/
    next-auth.d.ts         # Session tipini genişletir (accessToken)
  middleware.ts            # NextAuth oturum koruması
docs/
  proje-dokumani.md        # Tam proje dokümanı
```

## Tasarım Kuralları

- Mobil-first, responsive (tablet ve telefon öncelikli)
- Kart tabanlı UI, yuvarlatılmış köşeler (`rounded-2xl`)
- Sağ alt köşede sayfa bağlamına göre değişen **FAB (+)** butonu
- Arama çubuğu: müşteri ve ürün listelerinde zorunlu
- Light / Dark mod desteği (sistem ayarına göre otomatik)
- Büyük dokunma alanları, tek elle kullanım

## Modüller

| Modül | Sayfa | Açıklama |
|---|---|---|
| Müşteri Listesi | `/dashboard/musteriler` | Arama + borç özeti kartları |
| Müşteri Detay | `/dashboard/musteriler/[id]` | Ciro, tahsilat, alacak, hareket geçmişi |
| Yeni Satış | Detay sayfasından FAB | Ürün seç, miktar, fiyat, KDV (%0/%10/%20) |
| Tahsilat | Detay sayfasından | Tutar + açıklama, borca otomatik düşüm |
| Ürün Listesi | `/dashboard/urunler` | Arama + stok + fiyat kartları |
| Ürün Detay | `/dashboard/urunler/[id]` | Düzenle, sil, istatistik |
| Raporlar | `/dashboard/raporlar` | Toplam alacak, mal varlığı, bu ay satış |

## Veri Akışı

`DataContext` (`src/context/DataContext.tsx`) tüm state'i yönetir ve client component'lara `useData()` hook'u ile erişim sağlar. İki katmanlı önbellekleme:

1. **localStorage** — uygulama açıldığında anında yüklenir, her değişiklikte yazılır.
2. **Google Drive** — oturum varsa ilk yüklemede Drive'dan çeker (`/api/sync` GET), her mutasyonda Drive'a yazar (`/api/sync` POST).

`middleware.ts` `/dashboard` altını korur; oturumu olmayan kullanıcıyı `/` landing sayfasına yönlendirir.

`src/lib/drive.ts` — Drive API'ye erişen düşük seviye yardımcılar (`readDriveFile`, `writeDriveFile`).  
`src/lib/customers.ts` / `src/lib/products.ts` — tip tanımları ve `buildActivityFeed` gibi saf hesaplama fonksiyonları.

### Ortam Değişkenleri

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
NEXTAUTH_URL
```

## İş Kuralları

- KDV ürün bazında değil **satış bazında** (%0, %10, %20)
- Satış kaydedilince stok otomatik düşer
- Tahsilat borçtan otomatik düşer, ayrı kayıt tutulur
- Toplam Mal Varlığı = Σ (Fiyat × Stok)
- Güncel Alacak = Toplam Satış − Toplam Tahsilat