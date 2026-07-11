export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export type NewProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt">;

export { formatCurrency } from "@/lib/format";