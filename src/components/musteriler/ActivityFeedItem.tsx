"use client";

import { useState } from "react";
import { ActivityItem, Sale, Payment } from "@/lib/customers";
import { formatCurrency } from "@/lib/format";

interface ActivityFeedItemProps {
  item: ActivityItem;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isSale = item.type === "sale";
  const sale = isSale ? (item.data as Sale) : null;
  const payment = !isSale ? (item.data as Payment) : null;

  const tutar = isSale ? sale!.total : payment!.amount;
  const tutarRenk = isSale ? "#4F46E5" : "#059669";

  return (
    <button
      onClick={() => setIsOpen((o) => !o)}
      className="bg-white rounded-2xl p-4 w-full text-left transition-all active:scale-[0.98]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      {/* Collapsed satır */}
      <div className="flex items-center gap-3">
        {/* İkon */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: isSale ? "#EEF2FF" : "#ECFDF5" }}
        >
          {isSale ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="#4F46E5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="#059669" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          )}
        </div>

        {/* Orta: tip + tarih */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{isSale ? "Satış" : "Tahsilat"}</p>
          <p className="text-gray-400 text-xs mt-0.5">{formatShortDate(item.date)}</p>
        </div>

        {/* Sağ: tutar + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <p className="font-semibold text-sm" style={{ color: tutarRenk }}>
            {formatCurrency(tutar)}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="#94A3B8"
            className="w-4 h-4 transition-transform"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Expanded detay */}
      {isOpen && (
        <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-1.5">
          {isSale && sale && (
            <>
              {/* Ürün satırları */}
              {sale.items.map((si, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{si.productName} ×{si.quantity} ({formatCurrency(si.unitPrice)}/adet)</span>
                  <span className="font-medium text-gray-900 ml-2 shrink-0">{formatCurrency(si.quantity * si.unitPrice)}</span>
                </div>
              ))}

              {/* Ara toplam */}
              <div className="flex justify-between text-sm border-t border-gray-100 pt-1.5 mt-1">
                <span className="text-gray-400">Ara Toplam</span>
                <span className="text-gray-700">{formatCurrency(sale.subtotal)}</span>
              </div>

              {/* KDV */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">KDV %{sale.vatRate}</span>
                <span style={{ color: "#D97706" }}>+{formatCurrency(sale.vatAmount)}</span>
              </div>

              {/* Toplam */}
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5 mt-1">
                <span className="text-gray-900">Toplam</span>
                <span style={{ color: "#4F46E5" }}>{formatCurrency(sale.total)}</span>
              </div>
            </>
          )}

          {!isSale && payment && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tutar</span>
                <span className="font-bold" style={{ color: "#059669" }}>{formatCurrency(payment.amount)}</span>
              </div>
              {payment.description && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Açıklama</span>
                  <span className="text-gray-700 text-right ml-4">{payment.description}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tarih & Saat</span>
                <span className="text-gray-700">{formatDateTime(payment.date)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </button>
  );
}