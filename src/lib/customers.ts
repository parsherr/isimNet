export interface Customer {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
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

export type NewCustomerFormData = Omit<Customer, "id" | "createdAt" | "updatedAt">;

export interface SaleItemDraft {
  productId: string;
  productName: string;
  listPrice: number;
  quantity: number;
  priceOverride?: number;
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