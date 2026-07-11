"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { formatCurrency } from "@/lib/format";
import { useData } from "@/context/DataContext";

export default function RaporlarPage() {
  const { customers, products, sales, isLoading, getCustomerTotals } = useData();

  const now = new Date();

  const toplamAlacak = customers.reduce(
    (sum, c) => sum + getCustomerTotals(c.id).currentDebt, 0
  );

  const toplamMalVarligi = products.reduce(
    (sum, p) => sum + p.price * p.stock, 0
  );

  const buAySatislar = sales.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const buAySatis = buAySatislar.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Ana Sayfa
        </Link>

        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-400 text-sm mt-0.5">İşletmenizin genel durumu</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3].map(i => (
              <div key={i} className={`bg-white rounded-2xl h-24 animate-pulse ${i === 1 ? "col-span-2" : ""}`} style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <p className="text-gray-400 text-xs mb-2">Toplam Alacak</p>
              <p className="font-bold text-3xl leading-tight text-red-500">{formatCurrency(toplamAlacak)}</p>
              <p className="text-gray-400 text-xs mt-1">
                {customers.filter((c) => getCustomerTotals(c.id).currentDebt > 0).length} müşteride bekleyen alacak
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <p className="text-gray-400 text-xs mb-2">Mal Varlığı</p>
              <p className="font-bold text-xl leading-tight" style={{ color: "#059669" }}>{formatCurrency(toplamMalVarligi)}</p>
              <p className="text-gray-400 text-xs mt-1">{products.reduce((s, p) => s + p.stock, 0)} adet stok</p>
            </div>

            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <p className="text-gray-400 text-xs mb-2">Bu Ay Satış</p>
              <p className="font-bold text-xl leading-tight" style={{ color: "#4F46E5" }}>{formatCurrency(buAySatis)}</p>
              <p className="text-gray-400 text-xs mt-1">{buAySatislar.length} satış işlemi</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}