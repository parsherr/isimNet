"use client";

import { useEffect, useState } from "react";
import { Sale, SaleItem, SaleItemDraft } from "@/lib/customers";
import { formatCurrency } from "@/lib/format";
import { formatCurrencyDisplay, parseCurrencyDisplay } from "@/lib/currencyInput";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { useData } from "@/context/DataContext";

interface NewSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (sale: Omit<Sale, "id" | "customerId">) => void;
}

const VAT_RATES = [0, 10, 20] as const;

export default function NewSaleModal({ open, onClose, onSubmit }: NewSaleModalProps) {
  const { products } = useData();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<SaleItemDraft[]>([]);
  const [priceDisplays, setPriceDisplays] = useState<Record<string, string>>({});
  const [vatRate, setVatRate] = useState<0 | 10 | 20>(20);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function resetAndClose() {
    setStep(1); setSelectedIds([]); setDrafts([]); setPriceDisplays({}); setVatRate(20); setStepErrors({});
    onClose();
  }

  if (!open) return null;

  function toggleProduct(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function goToStep2() {
    if (selectedIds.length === 0) return;
    const newDrafts = selectedIds.map((pid) => {
      const p = products.find((x) => x.id === pid)!;
      return { productId: pid, productName: p.name, listPrice: p.price, quantity: 1, priceOverride: undefined };
    });
    setDrafts(newDrafts);
    setPriceDisplays({});
    setStep(2);
  }

  function updateDraft(pid: string, field: "quantity" | "priceOverride", value: number | undefined) {
    setDrafts((prev) => prev.map((d) => d.productId === pid ? { ...d, [field]: value } : d));
  }

  function validateStep2(): boolean {
    const errors: Record<string, string> = {};
    drafts.forEach((d) => {
      if (!d.quantity || d.quantity < 1) errors[`qty-${d.productId}`] = "Min 1";
      if (d.priceOverride !== undefined && d.priceOverride <= 0) errors[`price-${d.productId}`] = "Geçerli fiyat";
    });
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const subtotal = drafts.reduce((s, d) => s + (d.quantity || 0) * (d.priceOverride ?? d.listPrice), 0);
  const vatAmount = Math.round(subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  function handleSubmit() {
    const items: SaleItem[] = drafts.map((d) => ({
      productId: d.productId,
      productName: d.productName,
      quantity: d.quantity,
      unitPrice: d.priceOverride ?? d.listPrice,
    }));
    onSubmit({ date: new Date().toISOString(), items, vatRate, subtotal, vatAmount, total });
    resetAndClose();
  }

  const inputClass = "bg-gray-50 rounded-xl px-3 py-2 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={step === 1 ? resetAndClose : undefined} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[85vh] flex flex-col">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)} className="text-gray-400 hover:text-gray-600 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 1 && "Ürün Seç"}{step === 2 && "Miktar & Fiyat"}{step === 3 && "KDV"}{step === 4 && "Özet"}
            </h2>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="w-2 h-2 rounded-full transition-colors" style={{ background: s <= step ? "#4F46E5" : "#E5E7EB" }} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col gap-2 pb-2">
              {products.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggleProduct(p.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left"
                    style={{ borderColor: selected ? "#4F46E5" : "#F1F5F9", background: selected ? "#EEF2FF" : "#fff" }}>
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: selected ? "#4F46E5" : "#CBD5E1", background: selected ? "#4F46E5" : "transparent" }}>
                      {selected && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                      <p className="text-gray-400 text-xs">{formatCurrency(p.price)} · {p.stock} adet</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 pb-2">
              {drafts.map((d) => (
                <div key={d.productId} className="bg-gray-50 rounded-2xl p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{d.productName}</p>
                  <p className="text-gray-400 text-xs mb-3">Liste fiyatı: {formatCurrency(d.listPrice)}</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Miktar *</label>
                      <input type="number" inputMode="numeric" min={1} value={d.quantity || ""}
                        onChange={(e) => updateDraft(d.productId, "quantity", parseInt(e.target.value) || 0)}
                        className={`${inputClass} w-full`} />
                      {stepErrors[`qty-${d.productId}`] && <p className="text-red-500 text-xs mt-1">{stepErrors[`qty-${d.productId}`]}</p>}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Birim Fiyat (₺)</label>
                      <CurrencyInput
                        value={priceDisplays[d.productId] ?? ""}
                        onChange={(display, numeric) => {
                          setPriceDisplays(prev => ({ ...prev, [d.productId]: display }));
                          updateDraft(d.productId, "priceOverride", display ? numeric : undefined);
                        }}
                        placeholder={formatCurrencyDisplay(String(d.listPrice))}
                        className={`${inputClass} w-full`}
                      />
                      {stepErrors[`price-${d.productId}`] && <p className="text-red-500 text-xs mt-1">{stepErrors[`price-${d.productId}`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="pb-2">
              <div className="flex gap-2 mb-6">
                {VAT_RATES.map((rate) => (
                  <button key={rate} onClick={() => setVatRate(rate)}
                    className="flex-1 py-3 rounded-2xl font-semibold text-sm border-2 transition-all"
                    style={{ borderColor: vatRate === rate ? "#4F46E5" : "#E5E7EB", background: vatRate === rate ? "#4F46E5" : "#fff", color: vatRate === rate ? "#fff" : "#6B7280" }}>
                    %{rate}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-gray-600"><span>Ara Toplam</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>KDV (%{vatRate})</span><span>+{formatCurrency(vatAmount)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Toplam</span><span style={{ color: "#4F46E5" }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="pb-2">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                {drafts.map((d) => {
                  const price = d.priceOverride ?? d.listPrice;
                  return (
                    <div key={d.productId} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{d.productName} ×{d.quantity}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(price * d.quantity)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm text-gray-500 pt-2 mt-1"><span>KDV (%{vatRate})</span><span>+{formatCurrency(vatAmount)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-1">
                  <span>Genel Toplam</span><span style={{ color: "#4F46E5" }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-3">
          {step === 1 && (
            <button onClick={goToStep2} disabled={selectedIds.length === 0}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: "#4F46E5" }}>
              Devam → ({selectedIds.length} ürün)
            </button>
          )}
          {step === 2 && (
            <button onClick={() => { if (validateStep2()) setStep(3); }}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98]"
              style={{ background: "#4F46E5" }}>Devam →</button>
          )}
          {step === 3 && (
            <button onClick={() => setStep(4)}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98]"
              style={{ background: "#4F46E5" }}>Özeti Gör →</button>
          )}
          {step === 4 && (
            <button onClick={handleSubmit}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-[0.98]"
              style={{ background: "#059669" }}>Onayla ve Kaydet</button>
          )}
        </div>
      </div>
    </>
  );
}