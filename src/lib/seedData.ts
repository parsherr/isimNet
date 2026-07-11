import { Customer, Sale, Payment } from "@/lib/customers";
import { Product } from "@/lib/products";

const NOW = "2024-01-01T00:00:00.000Z";

export const SEED_PRODUCTS: Product[] = [
  { id: "1", name: "A4 Fotokopi Kağıdı", description: "80gr/m², 500 yaprak, beyaz", price: 185, stock: 120, createdAt: NOW, updatedAt: NOW },
  { id: "2", name: "Tükenmez Kalem (Kutu)", description: "Mavi, 12'li kutu, orta uç", price: 45, stock: 80, createdAt: NOW, updatedAt: NOW },
  { id: "3", name: "Zımba Makinesi", description: "Masaüstü, 24/6 zımba teli", price: 320, stock: 25, createdAt: NOW, updatedAt: NOW },
  { id: "4", name: "Dosya Dolabı", description: "4 çekmeceli, metal, kilitli", price: 2850, stock: 8, createdAt: NOW, updatedAt: NOW },
  { id: "5", name: "Laptop Standı", description: "Alüminyum, ayarlanabilir yükseklik", price: 750, stock: 35, createdAt: NOW, updatedAt: NOW },
  { id: "6", name: "Beyaz Tahta", description: "90x120 cm, manyetik yüzey", price: 1200, stock: 12, createdAt: NOW, updatedAt: NOW },
  { id: "7", name: "Makas", description: "21 cm, paslanmaz çelik", price: 65, stock: 60, createdAt: NOW, updatedAt: NOW },
  { id: "8", name: "Yapışkanlı Not Kağıdı", description: "75x75 mm, 100 yaprak, sarı", price: 28, stock: 200, createdAt: NOW, updatedAt: NOW },
  { id: "9", name: "Klasör (Geniş)", description: "A4, 7 cm sırt, siyah", price: 55, stock: 150, createdAt: NOW, updatedAt: NOW },
  { id: "10", name: "Hesap Makinesi", description: "12 hane, masa üstü, güneş enerjili", price: 480, stock: 18, createdAt: NOW, updatedAt: NOW },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ahmet Yılmaz", phone: "0532 111 22 33", note: "Ödemeleri düzenli yapar", createdAt: NOW, updatedAt: NOW },
  { id: "c2", name: "Fatma Kaya", createdAt: NOW, updatedAt: NOW },
  { id: "c3", name: "Mehmet Demir", phone: "0541 333 44 55", createdAt: NOW, updatedAt: NOW },
  { id: "c4", name: "Zeynep Çelik", note: "Toplu sipariş verir", createdAt: NOW, updatedAt: NOW },
  { id: "c5", name: "Ali Öztürk", phone: "0555 666 77 88", createdAt: NOW, updatedAt: NOW },
];

export const SEED_SALES: Sale[] = [
  { id: "s1", customerId: "c1", date: "2025-01-10T09:30:00", items: [{ productId: "1", productName: "A4 Fotokopi Kağıdı", quantity: 5, unitPrice: 185 }, { productId: "2", productName: "Tükenmez Kalem (Kutu)", quantity: 2, unitPrice: 45 }], vatRate: 20, subtotal: 1015, vatAmount: 203, total: 1218 },
  { id: "s2", customerId: "c1", date: "2025-02-15T14:00:00", items: [{ productId: "5", productName: "Laptop Standı", quantity: 1, unitPrice: 750 }], vatRate: 20, subtotal: 750, vatAmount: 150, total: 900 },
  { id: "s10", customerId: "c1", date: "2025-04-10T11:00:00", items: [{ productId: "3", productName: "Zımba Makinesi", quantity: 1, unitPrice: 320 }], vatRate: 10, subtotal: 320, vatAmount: 32, total: 352 },
  { id: "s3", customerId: "c2", date: "2025-01-20T10:00:00", items: [{ productId: "3", productName: "Zımba Makinesi", quantity: 1, unitPrice: 320 }, { productId: "7", productName: "Makas", quantity: 3, unitPrice: 65 }], vatRate: 10, subtotal: 515, vatAmount: 51, total: 566 },
  { id: "s4", customerId: "c2", date: "2025-03-05T15:30:00", items: [{ productId: "8", productName: "Yapışkanlı Not Kağıdı", quantity: 10, unitPrice: 28 }], vatRate: 0, subtotal: 280, vatAmount: 0, total: 280 },
  { id: "s5", customerId: "c3", date: "2025-02-01T09:00:00", items: [{ productId: "4", productName: "Dosya Dolabı", quantity: 1, unitPrice: 2850 }], vatRate: 20, subtotal: 2850, vatAmount: 570, total: 3420 },
  { id: "s6", customerId: "c3", date: "2025-03-20T13:00:00", items: [{ productId: "6", productName: "Beyaz Tahta", quantity: 1, unitPrice: 1200 }], vatRate: 20, subtotal: 1200, vatAmount: 240, total: 1440 },
  { id: "s7", customerId: "c4", date: "2025-01-28T16:00:00", items: [{ productId: "10", productName: "Hesap Makinesi", quantity: 2, unitPrice: 480 }], vatRate: 10, subtotal: 960, vatAmount: 96, total: 1056 },
  { id: "s8", customerId: "c5", date: "2025-02-10T10:30:00", items: [{ productId: "1", productName: "A4 Fotokopi Kağıdı", quantity: 3, unitPrice: 185 }, { productId: "9", productName: "Klasör (Geniş)", quantity: 2, unitPrice: 55 }], vatRate: 20, subtotal: 665, vatAmount: 133, total: 798 },
  { id: "s9", customerId: "c5", date: "2025-04-01T09:00:00", items: [{ productId: "2", productName: "Tükenmez Kalem (Kutu)", quantity: 5, unitPrice: 45 }], vatRate: 0, subtotal: 225, vatAmount: 0, total: 225 },
  { id: "s11", customerId: "c1", date: "2026-07-02T10:00:00", items: [{ productId: "1", productName: "A4 Fotokopi Kağıdı", quantity: 3, unitPrice: 185 }, { productId: "5", productName: "Laptop Standı", quantity: 1, unitPrice: 750 }], vatRate: 20, subtotal: 1305, vatAmount: 261, total: 1566 },
  { id: "s12", customerId: "c3", date: "2026-07-08T14:30:00", items: [{ productId: "6", productName: "Beyaz Tahta", quantity: 1, unitPrice: 1200 }], vatRate: 10, subtotal: 1200, vatAmount: 120, total: 1320 },
  { id: "s13", customerId: "c5", date: "2026-07-10T09:00:00", items: [{ productId: "4", productName: "Dosya Dolabı", quantity: 1, unitPrice: 2850 }], vatRate: 20, subtotal: 2850, vatAmount: 570, total: 3420 },
];

export const SEED_PAYMENTS: Payment[] = [
  { id: "p1", customerId: "c1", date: "2025-02-20T10:00:00", amount: 1000, description: "Nakit ödeme" },
  { id: "p2", customerId: "c2", date: "2025-02-01T12:00:00", amount: 566, description: "Banka havalesi" },
  { id: "p3", customerId: "c2", date: "2025-03-10T09:00:00", amount: 280, description: "Nakit" },
  { id: "p4", customerId: "c3", date: "2025-03-01T14:00:00", amount: 2000, description: "Kısmi ödeme" },
  { id: "p5", customerId: "c5", date: "2025-03-15T11:00:00", amount: 500, description: "Nakit" },
];