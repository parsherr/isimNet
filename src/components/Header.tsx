"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useData } from "@/context/DataContext";

export default function Header() {
  const { data: session } = useSession();
  const { clearAllData, isSyncing } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "Kullanıcı";
  const image = session?.user?.image;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmClear(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleClearData() {
    await clearAllData();
    setMenuOpen(false);
    setConfirmClear(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="İşimNet"
            width={120}
            height={36}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => { setMenuOpen((o) => !o); setConfirmClear(false); }}
            className="flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors"
          >
            {image ? (
              <Image
                src={image}
                alt={name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
                <span className="text-indigo-700 text-xs font-bold">{initials}</span>
              </div>
            )}
            <span className="text-indigo-700 text-sm font-medium">
              {name.split(" ")[0]}
            </span>
            {isSyncing && (
              <svg className="w-3 h-3 text-indigo-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400">Giriş yapıldı</p>
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              </div>

              {!confirmClear ? (
                <>
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Tüm Veriyi Sıfırla
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-600 mb-3">Tüm müşteri, ürün ve satış verileri silinecek. Geri alınamaz.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearData}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{ background: "#EF4444" }}
                    >
                      Sil
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-2 rounded-xl text-xs text-gray-600 border border-gray-200"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}