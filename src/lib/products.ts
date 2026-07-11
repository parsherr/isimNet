export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export type NewProductFormData = Omit<Product, "id">;

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "A4 Fotokopi Kağıdı", description: "80gr/m², 500 yaprak, beyaz", price: 185, stock: 120 },
  { id: "2", name: "Tükenmez Kalem (Kutu)", description: "Mavi, 12'li kutu, orta uç", price: 45, stock: 80 },
  { id: "3", name: "Zımba Makinesi", description: "Masaüstü, 24/6 zımba teli", price: 320, stock: 25 },
  { id: "4", name: "Dosya Dolabı", description: "4 çekmeceli, metal, kilitli", price: 2850, stock: 8 },
  { id: "5", name: "Laptop Standı", description: "Alüminyum, ayarlanabilir yükseklik", price: 750, stock: 35 },
  { id: "6", name: "Beyaz Tahta", description: "90x120 cm, manyetik yüzey", price: 1200, stock: 12 },
  { id: "7", name: "Makas", description: "21 cm, paslanmaz çelik", price: 65, stock: 60 },
  { id: "8", name: "Yapışkanlı Not Kağıdı", description: "75x75 mm, 100 yaprak, sarı", price: 28, stock: 200 },
  { id: "9", name: "Klasör (Geniş)", description: "A4, 7 cm sırt, siyah", price: 55, stock: 150 },
  { id: "10", name: "Hesap Makinesi", description: "12 hane, masa üstü, güneş enerjili", price: 480, stock: 18 },
];

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}