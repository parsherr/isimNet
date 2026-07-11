"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CustomerStatsBar from "@/components/musteriler/CustomerStatsBar";
import CustomerCard from "@/components/musteriler/CustomerCard";
import NewCustomerModal from "@/components/musteriler/NewCustomerModal";
import FAB from "@/components/urunler/FAB";
import SearchInput from "@/components/urunler/SearchInput";
import Link from "next/link";
import {
  MOCK_CUSTOMERS,
  Customer,
  NewCustomerFormData,
  getCustomerTotals,
} from "@/lib/customers";

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstandingDebt = customers.reduce(
    (sum, c) => sum + getCustomerTotals(c.id).currentDebt,
    0
  );

  function handleAddCustomer(data: NewCustomerFormData) {
    setCustomers((prev) => [{ ...data, id: Date.now().toString() }, ...prev]);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium mb-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Ana Sayfa
        </Link>
        <CustomerStatsBar
          customerCount={customers.length}
          totalOutstandingDebt={totalOutstandingDebt}
        />

        <div className="mt-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Müşteri ara..."
          />
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                debt={getCustomerTotals(customer.id).currentDebt}
              />
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke="currentColor"
                className="w-12 h-12 mx-auto mb-3 opacity-40"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="text-sm">Arama sonucu bulunamadı</p>
            </div>
          )}
        </div>
      </main>

      <FAB onClick={() => setIsModalOpen(true)} aria-label="Yeni Müşteri Ekle" />

      <NewCustomerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </div>
  );
}