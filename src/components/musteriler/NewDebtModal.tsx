"use client";

import { useEffect, useState } from "react";
import { parseCurrencyDisplay } from "@/lib/currencyInput";
import CurrencyInput from "@/components/ui/CurrencyInput";

interface NewDebtModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; description: string }) => void;
}

export default function NewDebtModal({ open, onClose, onSubmit }: NewDebtModalProps) {
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setAmountDisplay(""); setDescription(""); setError(""); }
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const numAmount = parseCurrencyDisplay(amountDisplay);

  function handleSubmit() {
    if (numAmount <= 0) { setError("Geçerli tutar giriniz"); return; }
    setError("");
    onSubmit({ amount: numAmount, description: description.trim() });
    onClose();
  }

  const inputClass =
    "w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-8">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Borç Ekle</h2>
        <p className="text-xs text-gray-400 mb-5">Müşteriye olan borcunuzu kaydedin</p>
        <div className="flex flex-col gap-3">
          <div>
            <CurrencyInput
              value={amountDisplay}
              onChange={(display) => setAmountDisplay(display)}
              placeholder="Tutar (₺) *"
              className={inputClass}
            />
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
          </div>
          <input
            type="text"
            placeholder="Açıklama (opsiyonel, örn. İade, Fazla ödeme)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="mt-5 w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98]"
          style={{ background: "#EA580C" }}
        >
          Borcu Kaydet
        </button>
      </div>
    </>
  );
}