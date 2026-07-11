"use client";

import { useEffect, useState } from "react";
import { NewProductFormData } from "@/lib/products";

interface NewProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewProductFormData) => void;
}

const emptyForm: NewProductFormData = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
};

export default function NewProductModal({ open, onClose, onSubmit }: NewProductModalProps) {
  const [form, setForm] = useState<NewProductFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof NewProductFormData, string>>>({});

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof NewProductFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Ürün adı zorunludur";
    if (form.price <= 0) newErrors.price = "Geçerli bir fiyat giriniz";
    if (form.stock < 0) newErrors.stock = "Stok 0 veya daha fazla olmalıdır";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit(form);
    setForm(emptyForm);
    setErrors({});
    onClose();
  }

  const inputClass =
    "w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-8">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-semibold text-gray-900 mb-5">Yeni Ürün</h2>

        <div className="flex flex-col gap-3">
          <div>
            <input
              type="text"
              placeholder="Ürün Adı *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>

          <textarea
            placeholder="Açıklama (isteğe bağlı)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className={`${inputClass} resize-none`}
          />

          <div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Satış Fiyatı (₺) *"
              value={form.price === 0 ? "" : form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1 ml-1">{errors.price}</p>}
          </div>

          <div>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Stok Adedi *"
              value={form.stock === 0 ? "" : form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1 ml-1">{errors.stock}</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-5 w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98]"
          style={{ background: "#059669" }}
        >
          Kaydet
        </button>
      </div>
    </>
  );
}