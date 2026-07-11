import { formatCurrency } from "@/lib/format";

interface CustomerStatsBarProps {
  customerCount: number;
  totalOutstandingDebt: number;
}

export default function CustomerStatsBar({ customerCount, totalOutstandingDebt }: CustomerStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className="bg-white rounded-2xl p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1">Toplam Müşteri</p>
        <p className="font-bold text-lg leading-tight" style={{ color: "#4F46E5" }}>
          {customerCount} kişi
        </p>
      </div>
      <div
        className="bg-white rounded-2xl p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1">Toplam Alacak</p>
        <p className="font-bold text-lg leading-tight text-red-500">
          {formatCurrency(totalOutstandingDebt)}
        </p>
      </div>
    </div>
  );
}