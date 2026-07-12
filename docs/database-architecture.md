# İşimNet – Veritabanı Mimarisi

## Genel Yaklaşım

İşimNet sunucusuz (serverless) çalışır. Veriler üç katmanda saklanır:

```
[Uygulama State]  ←→  [localStorage]  ←→  [Google Drive appDataFolder]
     (React)             (anlık)              (kalıcı & çok cihaz)
```

### Katmanların Rolü

| Katman | Ne Zaman Kullanılır | Hız |
|--------|---------------------|-----|
| React State | Her render'da | Anında |
| localStorage | Her mutasyonda (otomatik) | Anında |
| Google Drive | Uygulama kapanırken + manual sync | ~1-3 sn |

---

## Veri Akışı

### Açılış (mount)
1. localStorage'dan oku → UI hemen gösterilir (0 gecikme)
2. Google Drive'dan oku → eğer farklıysa state + localStorage güncellenir
3. localStorage hiç yoksa + Drive'da da yoksa → seed data kullanılır

### Mutasyon (ekle/düzenle/sil)
1. State güncellenir (React re-render)
2. localStorage'a yazılır (senkron, anında)
3. Drive'a yazılmaz (beklenir)

### Kapanış
- `visibilitychange → hidden` tetiklenince `keepalive fetch` ile `/api/sync` endpoint'i çağrılır
- `/api/sync` Google Drive'a yazar
- Manuel sync: header'daki sync butonu (isSyncing state'i)

### Çok Cihaz Sync
- Cihaz A değişiklik yapar → localStorage'a yazar → uygulama kapanınca Drive'a yazar
- Cihaz B uygulamayı açar → önce localStorage okur → sonra Drive'dan en güncel hali çeker

**Conflict Resolution:** Last-write-wins. Her entity `updatedAt` timestamp taşır. İki cihaz aynı anda değişiklik yaparsa Drive'daki son yazılan kazanır.

---

## Google Drive Yapısı

`appDataFolder` space kullanılır — kullanıcının Drive'ında görünmez, sadece uygulama erişebilir.

```
appDataFolder/
  customers.json    ← Customer[]
  products.json     ← Product[]
  sales.json        ← Sale[]
  payments.json     ← Payment[]
```

Dosya yoksa yeni oluşturulur (multipart POST), varsa güncellenir (PATCH).

---

## Entity Tanımları

### Product
```typescript
interface Product {
  id:          string;   // "p_1234567890" (Date.now tabanlı)
  name:        string;
  description: string;
  price:       number;   // TL, KDV hariç
  stock:       number;   // tam sayı, adet
  createdAt:   string;   // ISO 8601
  updatedAt:   string;   // ISO 8601
}
```

### Customer
```typescript
interface Customer {
  id:        string;   // "c_1234567890"
  name:      string;
  phone?:    string;
  note?:     string;
  createdAt: string;
  updatedAt: string;
}
```

### Sale
```typescript
interface Sale {
  id:         string;           // "s_1234567890"
  customerId: string;           // Customer.id referansı
  date:       string;           // ISO 8601
  items:      SaleItem[];
  vatRate:    0 | 10 | 20;     // satış bazında KDV
  subtotal:   number;           // KDV hariç toplam
  vatAmount:  number;
  total:      number;           // subtotal + vatAmount
}

interface SaleItem {
  productId:   string;   // snapshot — ürün silinse bile kayıt korunur
  productName: string;   // snapshot
  quantity:    number;
  unitPrice:   number;   // liste fiyatı veya override
}
```

### Payment
```typescript
interface Payment {
  id:          string;   // "pay_1234567890"
  customerId:  string;
  date:        string;   // ISO 8601
  amount:      number;
  description: string;
}
```

### ActivityItem (türetilmiş, saklanmaz)
```typescript
interface ActivityItem {
  type:           "sale" | "payment";
  date:           string;
  runningBalance: number;   // kümülatif bakiye
  data:           Sale | Payment;
}
```
`buildActivityFeed(sales, payments)` fonksiyonu bu veriyi üretir; Drive'a yazılmaz.

---

## Hesaplama Formülleri

### Müşteri Alacağı
```
Güncel Alacak = Toplam Satış (total) - Toplam Tahsilat (amount)
```

### Toplam Mal Varlığı
```
Mal Varlığı = Σ (product.price × product.stock)
```

### KDV
```
satış bazında, kullanıcı %0 / %10 / %20 seçer
vatAmount = round(subtotal × vatRate / 100)
total = subtotal + vatAmount
```

---

## Sayfaların Veri Erişim Haritası

| Sayfa | Okur | Yazar |
|-------|------|-------|
| `/dashboard` | — | — |
| `/dashboard/urunler` | products | products (addProduct) |
| `/dashboard/urunler/[id]` | products (tek) | products (update/delete) |
| `/dashboard/musteriler` | customers, sales, payments | customers (addCustomer) |
| `/dashboard/musteriler/[id]` | customers, sales, payments | sales (addSale), payments (addPayment) |
| `/dashboard/raporlar` | customers, products, sales, payments | — |

---

## Gelecekte Eklenebilecekler

- `Product.costPrice` — alış fiyatı, kâr marjı hesabı için
- `Product.unit` — "adet", "kutu", "metre"
- `Payment.method` — "cash" | "transfer" | "card"
- `Sale.status` — "open" | "paid" | "cancelled"
- Conflict resolution yükseltmesi: `updatedAt` karşılaştırmalı merge
- Firebase / Supabase geçişi: çok kullanıcılı senaryo için