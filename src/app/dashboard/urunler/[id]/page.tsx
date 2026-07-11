"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getProductById, Product, formatCurrency } from "@/lib/products";

export default function UrunDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const found = getProductById(id);
  const [product, setProduct] = useState<Product | null>(found ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editForm, setEditForm] = useState(
    found
      ? { name: found.name, description: found.description, price: found.price, stock: found.stock }
      : { name: "", description: "", price: 0, stock: 0 }
  );

  const inputClass =
    "w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-lg mb-4">Ürün bulunamadı</p>
          <Link href="/dashboard/urunler" className="text-indigo-600 font-medium text-sm">
            ← Ürün Listesine Dön
          </Link>
        </main>
      </div>
    );
  }

  function handleSave() {
    setProduct({ ...product!, ...editForm });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditForm({
      name: product!.name,
      description: product!.description,
      price: product!.price,
      stock: product!.stock,
    });
    setIsEditing(false);
  }

  function handleDelete() {
    router.push("/dashboard/urunler");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Geri link */}
        <Link
          href="/dashboard/urunler"
          className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium mb-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Ürünler
        </Link>

        {/* Detay kartı */}
        <div
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Ürün Adı"
                className={inputClass}
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Açıklama"
                rows={2}
                className={`${inputClass} resize-none`}
              />
              <input
                type="number"
                inputMode="decimal"
                value={editForm.price === 0 ? "" : editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                placeholder="Satış Fiyatı (₺)"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                value={editForm.stock === 0 ? "" : editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                placeholder="Stok Adedi"
                className={inputClass}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
              {product.description && (
                <p className="text-gray-500 text-sm mt-1">{product.description}</p>
              )}
              <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Satış Fiyatı</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Stok Adedi</p>
                  <p className="font-semibold text-gray-900">{product.stock} adet</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs mb-1">Toplam Değer</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(product.price * product.stock)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aksiyon butonları */}
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-white text-sm transition-all active:scale-[0.98]"
              style={{ background: "#059669" }}
            >
              Kaydet
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-gray-700 text-sm bg-white border border-gray-200 transition-all active:scale-[0.98]"
            >
              İptal
            </button>
          </div>
        ) : isConfirmingDelete ? (
          <div
            className="bg-white rounded-2xl p-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-gray-700 text-sm font-medium text-center mb-4">
              Bu ürünü silmek istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm bg-red-500 transition-all active:scale-[0.98]"
              >
                Evet, Sil
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-700 text-sm bg-gray-100 transition-all active:scale-[0.98]"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-indigo-600 text-sm bg-white border border-indigo-200 transition-all active:scale-[0.98]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
            >
              Düzenle
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-red-500 text-sm bg-white border border-red-200 transition-all active:scale-[0.98]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
            >
              Sil
            </button>
          </div>
        )}
      </main>
    </div>
  );
}