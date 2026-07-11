"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatsBar from "@/components/urunler/StatsBar";
import SearchInput from "@/components/urunler/SearchInput";
import ProductCard from "@/components/urunler/ProductCard";
import FAB from "@/components/urunler/FAB";
import NewProductModal from "@/components/urunler/NewProductModal";
import { NewProductFormData } from "@/lib/products";
import { useData } from "@/context/DataContext";

export default function UrunlerPage() {
  const { products, addProduct, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  function handleAddProduct(data: NewProductFormData) {
    addProduct(data);
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

        {isLoading ? (
          <div className="flex flex-col gap-3 mt-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }} />
            ))}
          </div>
        ) : (
          <>
            <StatsBar totalAssets={totalAssets} totalStock={totalStock} />
            <div className="mt-4">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Ürün ara..." />
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className="text-sm">Arama sonucu bulunamadı</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <FAB onClick={() => setIsModalOpen(true)} />
      <NewProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProduct} />
    </div>
  );
}