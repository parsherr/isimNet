@AGENTS.md

# İşimNet

Küçük ve orta ölçekli işletmeler için müşteri cari hesabı ve ürün stok yönetimi uygulaması. Detaylı proje dokümanı: `docs/proje-dokumani.md`

## Teknoloji

- **Framework:** Next.js (App Router) + TypeScript
- **Stil:** Tailwind CSS v4
- **Host:** Vercel (serverless)
- **Veri:** JSON dosyaları (customers.json, products.json, sales.json, payments.json)
- **Senkronizasyon:** GitHub API (ileride)

## Dizin Yapısı

```
src/
  app/
    dashboard/          # Ana ekran — modül kartları
    dashboard/musteriler/   # Müşteri listesi + detay
    dashboard/urunler/      # Ürün listesi + detay
    dashboard/raporlar/     # Raporlar ve istatistikler
  components/           # Paylaşılan UI bileşenleri
docs/
  proje-dokumani.md     # Tam proje dokümanı
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

## İş Kuralları

- KDV ürün bazında değil **satış bazında** (%0, %10, %20)
- Satış kaydedilince stok otomatik düşer
- Tahsilat borçtan otomatik düşer, ayrı kayıt tutulur
- Toplam Mal Varlığı = Σ (Fiyat × Stok)
- Güncel Alacak = Toplam Satış − Toplam Tahsilat