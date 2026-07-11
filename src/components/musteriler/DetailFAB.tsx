"use client";

import { useState } from "react";

interface DetailFABProps {
  onNewSale: () => void;
  onNewPayment: () => void;
}

export default function DetailFAB({ onNewSale, onNewPayment }: DetailFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSale() {
    setIsOpen(false);
    onNewSale();
  }

  function handlePayment() {
    setIsOpen(false);
    onNewPayment();
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Pill butonlar */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
          <button
            onClick={handlePayment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-white text-sm shadow-lg transition-all active:scale-[0.97]"
            style={{ background: "#059669", boxShadow: "0 4px 16px rgba(5,150,105,0.4)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            Tahsilat Al
          </button>
          <button
            onClick={handleSale}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-white text-sm shadow-lg transition-all active:scale-[0.97]"
            style={{ background: "#4F46E5", boxShadow: "0 4px 16px rgba(79,70,229,0.4)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
            Yeni Satış
          </button>
        </div>
      )}

      {/* Ana FAB */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Kapat" : "Aksiyon menüsü"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-[0.92]"
        style={{
          background: "#4F46E5",
          boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="white"
          className="w-6 h-6 transition-transform"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </>
  );
}