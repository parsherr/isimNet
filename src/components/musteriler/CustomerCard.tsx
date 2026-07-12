import Link from "next/link";
import { Customer } from "@/lib/customers";
import { formatCurrency } from "@/lib/format";

interface CustomerCardProps {
  customer: Customer;
  debt: number;
  myDebt: number;
}

export default function CustomerCard({ customer, debt, myDebt }: CustomerCardProps) {
  return (
    <Link
      href={`/dashboard/musteriler/${customer.id}`}
      className="bg-white rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: "#EEF2FF" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="#4F46E5"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-base truncate">{customer.name}</p>
        {customer.phone && (
          <p className="text-gray-400 text-sm mt-0.5 truncate">{customer.phone}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex flex-col items-end gap-0.5">
          {debt > 0 && (
            <span className="text-sm font-semibold text-red-500">{formatCurrency(debt)}</span>
          )}
          {myDebt > 0 && (
            <span className="text-xs font-semibold" style={{ color: "#EA580C" }}>Borç: {formatCurrency(myDebt)}</span>
          )}
          {debt <= 0 && myDebt <= 0 && (
            <span className="text-sm font-semibold text-gray-400">Temiz</span>
          )}
        </div>
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