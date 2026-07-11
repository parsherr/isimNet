import { formatCurrency } from "@/lib/format";

interface CustomerDetailStatsProps {
  totalRevenue: number;
  totalCollected: number;
  currentDebt: number;
}

export default function CustomerDetailStats({ totalRevenue, totalCollected, currentDebt }: CustomerDetailStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div
        className="bg-white rounded-2xl p-3"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1 leading-tight">Toplam Ciro</p>
        <p className="font-bold text-sm leading-tight" style={{ color: "#4F46E5" }}>
          {formatCurrency(totalRevenue)}
        </p>
      </div>
      <div
        className="bg-white rounded-2xl p-3"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1 leading-tight">Tahsilat</p>
        <p className="font-bold text-sm leading-tight" style={{ color: "#059669" }}>
          {formatCurrency(totalCollected)}
        </p>
      </div>
      <div
        className="bg-white rounded-2xl p-3"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <p className="text-gray-400 text-xs mb-1 leading-tight">Alacak</p>
        <p
          className="font-bold text-sm leading-tight"
          style={{ color: currentDebt > 0 ? "#EA580C" : "#059669" }}
        >
          {formatCurrency(currentDebt)}
        </p>
      </div>
    </div>
  );
}