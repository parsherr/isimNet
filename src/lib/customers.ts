import { MOCK_PRODUCTS } from "@/lib/products";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  note?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  items: SaleItem[];
  vatRate: 0 | 10 | 20;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  description: string;
}

export interface ActivityItem {
  type: "sale" | "payment";
  date: string;
  runningBalance: number;
  data: Sale | Payment;
}

export type NewCustomerFormData = Omit<Customer, "id">;

export interface SaleItemDraft {
  productId: string;
  productName: string;
  listPrice: number;
  quantity: number;
  priceOverride?: number;
}

// ─── Mock Data ────────────────────────────────────────────────

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ahmet Yılmaz", phone: "0532 111 22 33", note: "Ödemeleri düzenli yapar" },
  { id: "c2", name: "Fatma Kaya" },
  { id: "c3", name: "Mehmet Demir", phone: "0541 333 44 55" },
  { id: "c4", name: "Zeynep Çelik", note: "Toplu sipariş verir" },
  { id: "c5", name: "Ali Öztürk", phone: "0555 666 77 88" },
];

function makeSale(
  id: string,
  customerId: string,
  date: string,
  items: { pid: string; qty: number; price?: number }[],
  vatRate: 0 | 10 | 20
): Sale {
  const saleItems: SaleItem[] = items.map((i) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === i.pid)!;
    return {
      productId: i.pid,
      productName: product.name,
      quantity: i.qty,
      unitPrice: i.price ?? product.price,
    };
  });
  const subtotal = saleItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const vatAmount = Math.round(subtotal * vatRate) / 100;
  return { id, customerId, date, items: saleItems, vatRate, subtotal, vatAmount, total: subtotal + vatAmount };
}

export const MOCK_SALES: Sale[] = [
  makeSale("s1", "c1", "2025-01-10T09:30:00", [{ pid: "1", qty: 5 }, { pid: "2", qty: 2 }], 20),
  makeSale("s2", "c1", "2025-02-15T14:00:00", [{ pid: "5", qty: 1 }], 20),
  makeSale("s10", "c1", "2025-04-10T11:00:00", [{ pid: "3", qty: 1 }], 10),
  makeSale("s3", "c2", "2025-01-20T10:00:00", [{ pid: "3", qty: 1 }, { pid: "7", qty: 3 }], 10),
  makeSale("s4", "c2", "2025-03-05T15:30:00", [{ pid: "8", qty: 10 }], 0),
  makeSale("s5", "c3", "2025-02-01T09:00:00", [{ pid: "4", qty: 1 }], 20),
  makeSale("s6", "c3", "2025-03-20T13:00:00", [{ pid: "6", qty: 1 }], 20),
  makeSale("s7", "c4", "2025-01-28T16:00:00", [{ pid: "10", qty: 2 }], 10),
  makeSale("s8", "c5", "2025-02-10T10:30:00", [{ pid: "1", qty: 3 }, { pid: "9", qty: 2 }], 20),
  makeSale("s9", "c5", "2025-04-01T09:00:00", [{ pid: "2", qty: 5 }], 0),
  makeSale("s11", "c1", "2026-07-02T10:00:00", [{ pid: "1", qty: 3 }, { pid: "5", qty: 1 }], 20),
  makeSale("s12", "c3", "2026-07-08T14:30:00", [{ pid: "6", qty: 1 }], 10),
  makeSale("s13", "c5", "2026-07-10T09:00:00", [{ pid: "4", qty: 1 }], 20),
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "p1", customerId: "c1", date: "2025-02-20T10:00:00", amount: 1000, description: "Nakit ödeme" },
  { id: "p2", customerId: "c2", date: "2025-02-01T12:00:00", amount: MOCK_SALES.find(s => s.id === "s3")!.total, description: "Banka havalesi" },
  { id: "p3", customerId: "c2", date: "2025-03-10T09:00:00", amount: MOCK_SALES.find(s => s.id === "s4")!.total, description: "Nakit" },
  { id: "p4", customerId: "c3", date: "2025-03-01T14:00:00", amount: 2000, description: "Kısmi ödeme" },
  { id: "p5", customerId: "c5", date: "2025-03-15T11:00:00", amount: 500, description: "Nakit" },
];

// ─── Helpers ──────────────────────────────────────────────────

export function getCustomerById(id: string): Customer | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

export function getSalesByCustomer(customerId: string): Sale[] {
  return MOCK_SALES.filter((s) => s.customerId === customerId);
}

export function getPaymentsByCustomer(customerId: string): Payment[] {
  return MOCK_PAYMENTS.filter((p) => p.customerId === customerId);
}

export function getCustomerTotals(customerId: string): {
  totalRevenue: number;
  totalCollected: number;
  currentDebt: number;
} {
  const totalRevenue = getSalesByCustomer(customerId).reduce((s, sale) => s + sale.total, 0);
  const totalCollected = getPaymentsByCustomer(customerId).reduce((s, p) => s + p.amount, 0);
  return { totalRevenue, totalCollected, currentDebt: totalRevenue - totalCollected };
}

export function buildActivityFeed(sales: Sale[], payments: Payment[]): ActivityItem[] {
  type RawItem = { type: "sale" | "payment"; date: string; data: Sale | Payment };

  const raw: RawItem[] = [
    ...sales.map((s) => ({ type: "sale" as const, date: s.date, data: s })),
    ...payments.map((p) => ({ type: "payment" as const, date: p.date, data: p })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let balance = 0;
  const items: ActivityItem[] = raw.map((r) => {
    if (r.type === "sale") balance += (r.data as Sale).total;
    else balance -= (r.data as Payment).amount;
    return { type: r.type, date: r.date, runningBalance: balance, data: r.data };
  });

  return items.reverse();
}