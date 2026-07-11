import Link from "next/link";
import { Product, formatCurrency } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/dashboard/urunler/${product.id}`}
      className="bg-white rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: "#ECFDF5" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="#059669"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-base truncate">{product.name}</p>
        <p className="text-gray-400 text-sm mt-0.5">{product.stock} adet stok</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">{formatCurrency(product.price)}</p>
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="#94A3B8"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}