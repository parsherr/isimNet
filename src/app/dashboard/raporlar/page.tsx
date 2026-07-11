import Link from "next/link";
import Header from "@/components/Header";
import { MOCK_CUSTOMERS, MOCK_SALES, getCustomerTotals } from "@/lib/customers";
import { MOCK_PRODUCTS } from "@/lib/products";
import { formatCurrency } from "@/lib/format";

const toplamAlacak = MOCK_CUSTOMERS.reduce(
  (sum, c) => sum + getCustomerTotals(c.id).currentDebt,
  0
);

const toplamMalVarligi = MOCK_PRODUCTS.reduce(
  (sum, p) => sum + p.price * p.stock,
  0
);

const now = new Date();
const buAySatis = MOCK_SALES.filter((s) => {
  const d = new Date(s.date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}).reduce((sum, s) => sum + s.total, 0);


export default function RaporlarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Geri butonu */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium mb-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Ana Sayfa
        </Link>

        {/* Başlık */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-400 text-sm mt-0.5">İşletmenizin genel durumu</p>
        </div>

        {/* Ana metrikler */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Toplam Alacak — tam genişlik */}
          <div
            className="col-span-2 bg-white rounded-2xl p-5"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-gray-400 text-xs mb-2">Toplam Alacak</p>
            <p className="font-bold text-3xl leading-tight text-red-500">
              {formatCurrency(toplamAlacak)}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {MOCK_CUSTOMERS.filter((c) => getCustomerTotals(c.id).currentDebt > 0).length} müşteride bekleyen alacak
            </p>
          </div>

          {/* Toplam Mal Varlığı */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-gray-400 text-xs mb-2">Mal Varlığı</p>
            <p className="font-bold text-xl leading-tight" style={{ color: "#059669" }}>
              {formatCurrency(toplamMalVarligi)}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {MOCK_PRODUCTS.reduce((s, p) => s + p.stock, 0)} adet stok
            </p>
          </div>

          {/* Bu Ay Satış */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-gray-400 text-xs mb-2">Bu Ay Satış</p>
            <p className="font-bold text-xl leading-tight" style={{ color: "#4F46E5" }}>
              {formatCurrency(buAySatis)}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {MOCK_SALES.filter((s) => {
                const d = new Date(s.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length} satış işlemi
            </p>
          </div>
        </div>

              </main>
    </div>
  );
}