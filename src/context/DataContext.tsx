"use client";

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useRef, useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  Customer, NewCustomerFormData, Sale, Payment, Debt,
  ActivityItem, buildActivityFeed,
} from "@/lib/customers";
import { Product, NewProductFormData } from "@/lib/products";

// ── LocalStorage anahtarları ──────────────────────────────────────────────────
const LS = {
  customers: "isimnet_customers",
  products:  "isimnet_products",
  sales:     "isimnet_sales",
  payments:  "isimnet_payments",
  debts:     "isimnet_debts",
  lastSync:  "isimnet_last_sync",
};

function lsRead<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function lsWrite<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// ── Context tipi ─────────────────────────────────────────────────────────────
interface DataContextValue {
  customers:  Customer[];
  products:   Product[];
  sales:      Sale[];
  payments:   Payment[];
  isLoading:  boolean;
  isSyncing:    boolean;
  lastSyncTime: Date | null;

  addCustomer:    (data: NewCustomerFormData) => void;
  updateCustomer: (id: string, data: Partial<NewCustomerFormData>) => void;
  deleteCustomer: (id: string) => void;

  addProduct:    (data: NewProductFormData) => void;
  updateProduct: (id: string, data: Partial<NewProductFormData>) => void;
  deleteProduct: (id: string) => void;

  addSale:    (sale: Omit<Sale, "id">) => void;
  updateSale: (id: string, data: Omit<Sale, "id" | "customerId">) => void;
  deleteSale: (id: string) => void;

  addPayment:    (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: string, data: Pick<Payment, "amount" | "description">) => void;
  deletePayment: (id: string) => void;

  debts:      Debt[];
  addDebt:    (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, data: Pick<Debt, "amount" | "description">) => void;
  deleteDebt: (id: string) => void;

  getCustomerTotals: (customerId: string) => {
    totalRevenue: number; totalCollected: number; currentDebt: number; myDebt: number;
  };
  getCustomerFeed: (customerId: string) => ActivityItem[];

  syncToDrive:      () => Promise<void>;
  restoreFromDrive: () => Promise<void>;
  clearAllData:     () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // localStorage'dan anlık yükle → UI hızlı açılır
  const [customers, setCustomers] = useState<Customer[]>(() => lsRead<Customer>(LS.customers) ?? []);
  const [products,  setProducts]  = useState<Product[]>(()  => lsRead<Product>(LS.products)   ?? []);
  const [sales,     setSales]     = useState<Sale[]>(()     => lsRead<Sale>(LS.sales)          ?? []);
  const [payments,  setPayments]  = useState<Payment[]>(()  => lsRead<Payment>(LS.payments)    ?? []);
  const [debts,     setDebts]     = useState<Debt[]>(()     => lsRead<Debt>(LS.debts)          ?? []);

  const [isLoading,   setIsLoading]   = useState(true);
  const [isSyncing,   setIsSyncing]   = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS.lastSync);
      if (raw) setLastSyncTime(new Date(raw));
    } catch { /* */ }
  }, []);

  const stateRef = useRef({ customers, products, sales, payments, debts });
  stateRef.current = { customers, products, sales, payments, debts };

  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Tek SHA — data.json için
  const shaRef = useRef<string | null>(null);

  // Dirty tracking: veri değişmemişse sync'i atla
  const mutationSeq = useRef(0);
  const syncedSeq   = useRef(0);

  // ── Yardımcı: localStorage + state + dirty flag birlikte güncelle ─────────
  const setC = useCallback((fn: (prev: Customer[]) => Customer[]) => {
    mutationSeq.current += 1;
    setCustomers(prev => { const next = fn(prev); lsWrite(LS.customers, next); return next; });
  }, []);
  const setP = useCallback((fn: (prev: Product[]) => Product[]) => {
    mutationSeq.current += 1;
    setProducts(prev => { const next = fn(prev); lsWrite(LS.products, next); return next; });
  }, []);
  const setS = useCallback((fn: (prev: Sale[]) => Sale[]) => {
    mutationSeq.current += 1;
    setSales(prev => { const next = fn(prev); lsWrite(LS.sales, next); return next; });
  }, []);
  const setPay = useCallback((fn: (prev: Payment[]) => Payment[]) => {
    mutationSeq.current += 1;
    setPayments(prev => { const next = fn(prev); lsWrite(LS.payments, next); return next; });
  }, []);
  const setD = useCallback((fn: (prev: Debt[]) => Debt[]) => {
    mutationSeq.current += 1;
    setDebts(prev => { const next = fn(prev); lsWrite(LS.debts, next); return next; });
  }, []);

  // ── Mount: GitHub'dan senkronize et ──────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !session?.userId) return;

    const hasLocal =
      lsRead(LS.customers) !== null ||
      lsRead(LS.products)  !== null;

    if (!hasLocal) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    fetch("/api/sync")
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!json) {
          setIsLoading(false);
          return;
        }

        const { sha, ...remote } = json;

        // Tek SHA'yı önbellekle
        if (sha !== undefined) shaRef.current = sha;

        const finalC   = (remote.customers as Customer[] | null)   ?? (hasLocal ? stateRef.current.customers : []);
        const finalP   = (remote.products  as Product[]  | null)   ?? (hasLocal ? stateRef.current.products  : []);
        const finalS   = (remote.sales     as Sale[]     | null)   ?? (hasLocal ? stateRef.current.sales     : []);
        const finalPay = (remote.payments  as Payment[]  | null)   ?? (hasLocal ? stateRef.current.payments  : []);
        const finalD   = (remote.debts     as Debt[]     | null)   ?? (hasLocal ? stateRef.current.debts     : []);

        // Müşterisi silinmiş orphan kayıtları temizle
        const cIds = new Set(finalC.map(x => x.id));
        const cleanS   = finalS.filter(s => cIds.has(s.customerId));
        const cleanPay = finalPay.filter(p => cIds.has(p.customerId));
        const cleanD   = finalD.filter(d => cIds.has(d.customerId));

        setCustomers(finalC);    lsWrite(LS.customers, finalC);
        setProducts(finalP);     lsWrite(LS.products,  finalP);
        setSales(cleanS);        lsWrite(LS.sales,     cleanS);
        setPayments(cleanPay);   lsWrite(LS.payments,  cleanPay);
        setDebts(cleanD);        lsWrite(LS.debts,     cleanD);

        // GitHub'dan yüklenen veriyi "temiz" say
        syncedSeq.current = mutationSeq.current;
        setIsLoading(false);
      })
      .catch(() => {
        // GitHub erişilemiyorsa localStorage'daki veri yeterli
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.userId]);

  // ── GitHub'a yaz ─────────────────────────────────────────────────────────
  const syncToDrive = useCallback(async () => {
    if (!sessionRef.current?.userId) return;

    // Değişiklik yoksa atla
    if (mutationSeq.current === syncedSeq.current) return;

    const { customers, products, sales, payments, debts } = stateRef.current;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers, products, sales, payments, debts, sha: shaRef.current }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.sha !== undefined) shaRef.current = json.sha;
        syncedSeq.current = mutationSeq.current;
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem(LS.lastSync, now.toISOString());
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const restoreFromDrive = useCallback(async () => {
    if (!sessionRef.current?.userId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/sync");
      if (!res.ok) return;
      const json = await res.json();
      const { sha, ...remote } = json;

      if (sha !== undefined) shaRef.current = sha;

      const finalC   = (remote.customers as Customer[]) ?? [];
      const finalP   = (remote.products  as Product[])  ?? [];
      const finalS   = (remote.sales     as Sale[])     ?? [];
      const finalPay = (remote.payments  as Payment[])  ?? [];
      const finalD   = (remote.debts     as Debt[])     ?? [];

      setCustomers(finalC);   lsWrite(LS.customers, finalC);
      setProducts(finalP);    lsWrite(LS.products,  finalP);
      setSales(finalS);       lsWrite(LS.sales,     finalS);
      setPayments(finalPay);  lsWrite(LS.payments,  finalPay);
      setDebts(finalD);       lsWrite(LS.debts,     finalD);
      syncedSeq.current = mutationSeq.current;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sekme gizlenince sync, görününce SHA yenile ───────────────────────────
  useEffect(() => {
    function onVisibilityChange() {
      if (!sessionRef.current?.userId) return;

      if (document.visibilityState === "hidden") {
        // Değişiklik yoksa gönderme
        if (mutationSeq.current === syncedSeq.current) return;
        const { customers, products, sales, payments, debts } = stateRef.current;
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customers, products, sales, payments, debts, sha: shaRef.current }),
          keepalive: true,
        }).catch(() => {/* best-effort */});
        // Not: response okunamıyor (keepalive), SHA güncellemesi visible'da yapılıyor
      }

      if (document.visibilityState === "visible") {
        // Taze SHA al — keepalive POST'tan sonra SHA stale olabilir
        fetch("/api/sync")
          .then(r => r.ok ? r.json() : null)
          .then(json => { if (json?.sha !== undefined) shaRef.current = json.sha; })
          .catch(() => {});
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // ── Periyodik sync (her 3 dakikada bir) ──────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => syncToDrive(), 3 * 60 * 1000);
    return () => clearInterval(id);
  }, [status, syncToDrive]);

  // ── Müşteri mutasyonları ──────────────────────────────────────────────────
  const addCustomer = useCallback((data: NewCustomerFormData) => {
    const now = new Date().toISOString();
    const newC: Customer = { ...data, id: `c_${Date.now()}`, createdAt: now, updatedAt: now };
    setC(prev => [newC, ...prev]);
  }, [setC]);

  const updateCustomer = useCallback((id: string, data: Partial<NewCustomerFormData>) => {
    setC(prev => prev.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    ));
  }, [setC]);

  const deleteCustomer = useCallback((id: string) => {
    setC(prev => prev.filter(c => c.id !== id));
    setS(prev => prev.filter(s => s.customerId !== id));
    setPay(prev => prev.filter(p => p.customerId !== id));
    setD(prev => prev.filter(d => d.customerId !== id));
  }, [setC, setS, setPay, setD]);

  // ── Ürün mutasyonları ─────────────────────────────────────────────────────
  const addProduct = useCallback((data: NewProductFormData) => {
    const now = new Date().toISOString();
    const newP: Product = { ...data, id: `p_${Date.now()}`, createdAt: now, updatedAt: now };
    setP(prev => [newP, ...prev]);
  }, [setP]);

  const updateProduct = useCallback((id: string, data: Partial<NewProductFormData>) => {
    setP(prev => prev.map(p =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    ));
  }, [setP]);

  const deleteProduct = useCallback((id: string) => {
    setP(prev => prev.filter(p => p.id !== id));
  }, [setP]);

  // ── Satış & tahsilat ──────────────────────────────────────────────────────
  const addSale = useCallback((data: Omit<Sale, "id">) => {
    const newS: Sale = { ...data, id: `s_${Date.now()}` };
    setS(prev => [newS, ...prev]);
    // Satılan ürünlerin stokunu düşür
    const now = new Date().toISOString();
    setP(prev => prev.map(p => {
      const item = data.items.find(i => i.productId === p.id);
      if (!item) return p;
      return { ...p, stock: Math.max(0, p.stock - item.quantity), updatedAt: now };
    }));
  }, [setS, setP]);

  const updateSale = useCallback((id: string, data: Omit<Sale, "id" | "customerId">) => {
    const oldSale = stateRef.current.sales.find(s => s.id === id);
    if (!oldSale) return;
    const now = new Date().toISOString();
    // Stokları tek geçişte düzelt: eski miktarları geri ekle, yeni miktarları düş
    setP(prev => prev.map(p => {
      const oldItem = oldSale.items.find(i => i.productId === p.id);
      const newItem = data.items.find(i => i.productId === p.id);
      const restored = oldItem ? p.stock + oldItem.quantity : p.stock;
      const applied  = newItem ? Math.max(0, restored - newItem.quantity) : restored;
      if (restored === p.stock && applied === p.stock) return p;
      return { ...p, stock: applied, updatedAt: now };
    }));
    setS(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, [setS, setP]);

  const deleteSale = useCallback((id: string) => {
    // Silinen satışın stoklarını geri yükle
    const sale = stateRef.current.sales.find(s => s.id === id);
    if (sale) {
      const now = new Date().toISOString();
      setP(prev => prev.map(p => {
        const item = sale.items.find(i => i.productId === p.id);
        if (!item) return p;
        return { ...p, stock: p.stock + item.quantity, updatedAt: now };
      }));
    }
    setS(prev => prev.filter(s => s.id !== id));
  }, [setS, setP]);

  const addPayment = useCallback((data: Omit<Payment, "id">) => {
    const newP: Payment = { ...data, id: `pay_${Date.now()}` };
    setPay(prev => [newP, ...prev]);
  }, [setPay]);

  const updatePayment = useCallback((id: string, data: Pick<Payment, "amount" | "description">) => {
    setPay(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, [setPay]);

  const deletePayment = useCallback((id: string) => {
    setPay(prev => prev.filter(p => p.id !== id));
  }, [setPay]);

  const addDebt = useCallback((data: Omit<Debt, "id">) => {
    const newD: Debt = { ...data, id: `d_${Date.now()}` };
    setD(prev => [newD, ...prev]);
  }, [setD]);

  const updateDebt = useCallback((id: string, data: Pick<Debt, "amount" | "description">) => {
    setD(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, [setD]);

  const deleteDebt = useCallback((id: string) => {
    setD(prev => prev.filter(d => d.id !== id));
  }, [setD]);

  const clearAllData = useCallback(async () => {
    setCustomers([]); lsWrite(LS.customers, []);
    setProducts([]);  lsWrite(LS.products,  []);
    setSales([]);     lsWrite(LS.sales,     []);
    setPayments([]);  lsWrite(LS.payments,  []);
    setDebts([]);     lsWrite(LS.debts,     []);
    mutationSeq.current += 1;
    if (sessionRef.current?.userId) {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customers: [], products: [], sales: [], payments: [], debts: [],
          sha: shaRef.current,
        }),
      }).catch(console.error);
      if (res && res instanceof Response && res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.sha !== undefined) shaRef.current = json.sha;
        syncedSeq.current = mutationSeq.current;
      }
    }
  }, []);

  // ── Hesaplama yardımcıları ────────────────────────────────────────────────
  const getCustomerTotals = useCallback((customerId: string) => {
    const totalRevenue   = sales.filter(s => s.customerId === customerId).reduce((sum, s) => sum + s.total, 0);
    const totalCollected = payments.filter(p => p.customerId === customerId).reduce((sum, p) => sum + p.amount, 0);
    const myDebt         = debts.filter(d => d.customerId === customerId).reduce((sum, d) => sum + d.amount, 0);
    return { totalRevenue, totalCollected, currentDebt: totalRevenue - totalCollected, myDebt };
  }, [sales, payments, debts]);

  const getCustomerFeed = useCallback((customerId: string): ActivityItem[] => {
    return buildActivityFeed(
      sales.filter(s => s.customerId === customerId),
      payments.filter(p => p.customerId === customerId),
      debts.filter(d => d.customerId === customerId),
    );
  }, [sales, payments, debts]);

  const value = useMemo<DataContextValue>(() => ({
    customers, products, sales, payments, debts,
    isLoading, isSyncing, lastSyncTime,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addSale, updateSale, deleteSale, addPayment, updatePayment, deletePayment,
    addDebt, updateDebt, deleteDebt,
    getCustomerTotals, getCustomerFeed,
    syncToDrive, restoreFromDrive, clearAllData,
  }), [
    customers, products, sales, payments, debts,
    isLoading, isSyncing, lastSyncTime,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addSale, updateSale, deleteSale, addPayment, updatePayment, deletePayment,
    addDebt, updateDebt, deleteDebt,
    getCustomerTotals, getCustomerFeed,
    syncToDrive, restoreFromDrive, clearAllData,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}