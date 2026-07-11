"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CustomerDetailStats from "@/components/musteriler/CustomerDetailStats";
import ActivityFeed from "@/components/musteriler/ActivityFeed";
import DetailFAB from "@/components/musteriler/DetailFAB";
import NewSaleModal from "@/components/musteriler/NewSaleModal";
import NewPaymentModal from "@/components/musteriler/NewPaymentModal";
import { Sale, buildActivityFeed } from "@/lib/customers";
import { useData } from "@/context/DataContext";

export default function MusteriDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { customers, sales, payments, addSale, addPayment, getCustomerTotals } = useData();

  const customer = customers.find((c) => c.id === id) ?? null;
  const customerSales = sales.filter((s) => s.customerId === id);
  const customerPayments = payments.filter((p) => p.customerId === id);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { totalRevenue, totalCollected, currentDebt } = getCustomerTotals(id);

  const activityFeed = useMemo(
    () => buildActivityFeed(customerSales, customerPayments),
    [customerSales, customerPayments]
  );

  function handleAddSale(data: Omit<Sale, "id" | "customerId">) {
    addSale({ ...data, customerId: id });
  }

  function handleAddPayment(data: { amount: number; description: string }) {
    addPayment({ ...data, customerId: id, date: new Date().toISOString() });
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-lg mb-4">Müşteri bulunamadı</p>
          <Link href="/dashboard/musteriler" className="text-indigo-600 font-medium text-sm">← Müşteri Listesine Dön</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Link href="/dashboard/musteriler" className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Müşteriler
        </Link>

        <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#EEF2FF" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="#4F46E5" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{customer.name}</h1>
              {customer.phone && <p className="text-gray-400 text-sm mt-0.5">{customer.phone}</p>}
              {customer.note && <p className="text-gray-500 text-xs mt-1 italic">{customer.note}</p>}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <CustomerDetailStats totalRevenue={totalRevenue} totalCollected={totalCollected} currentDebt={currentDebt} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hareket Geçmişi</h2>
          <ActivityFeed items={activityFeed} />
        </div>
      </main>

      <DetailFAB onNewSale={() => setIsSaleModalOpen(true)} onNewPayment={() => setIsPaymentModalOpen(true)} />

      <NewSaleModal open={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onSubmit={handleAddSale} />
      <NewPaymentModal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSubmit={handleAddPayment} maxAmount={currentDebt} />
    </div>
  );
}