import { formatCurrency } from "@/lib/products";

interface StatsBarProps {
  totalAssets: number;
  totalStock: number;
}

export default function StatsBar({ totalAssets, totalStock }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className="bg-white rounded-2xl p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1">Toplam Mal Varlığı</p>
        <p className="font-bold text-lg leading-tight" style={{ color: "#059669" }}>
          {formatCurrency(totalAssets)}
        </p>
      </div>
      <div
        className="bg-white rounded-2xl p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1">Toplam Stok</p>
        <p className="font-bold text-lg leading-tight" style={{ color: "#059669" }}>
          {totalStock.toLocaleString("tr-TR")} adet
        </p>
      </div>
    </div>
  );
}