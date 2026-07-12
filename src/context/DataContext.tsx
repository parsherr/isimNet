"use client";

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useRef, useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  Customer, NewCustomerFormData, Sale, Payment,
  ActivityItem, buildActivityFeed,
} from "@/lib/customers";
import { Product, NewProductFormData } from "@/lib/products";
import { readDriveFile, writeDriveFile } from "@/lib/drive";

// ── LocalStorage anahtarları ──────────────────────────────────────────────────
const LS = {
  customers: "isimnet_customers",
  products:  "isimnet_products",
  sales:     "isimnet_sales",
  payments:  "isimnet_payments",
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
  isSyncing:  boolean;

  addCustomer:    (data: NewCustomerFormData) => void;
  updateCustomer: (id: string, data: Partial<NewCustomerFormData>) => void;
  deleteCustomer: (id: string) => void;

  addProduct:    (data: NewProductFormData) => void;
  updateProduct: (id: string, data: Partial<NewProductFormData>) => void;
  deleteProduct: (id: string) => void;

  addSale:    (sale: Omit<Sale, "id">) => void;
  deleteSale: (id: string) => void;

  addPayment:    (payment: Omit<Payment, "id">) => void;
  deletePayment: (id: string) => void;

  getCustomerTotals: (customerId: string) => {
    totalRevenue: number; totalCollected: number; currentDebt: number;
  };
  getCustomerFeed: (customerId: string) => ActivityItem[];

  syncToDrive: () => Promise<void>;
  clearAllData: () => Promise<void>;
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const stateRef = useRef({ customers, products, sales, payments });
  stateRef.current = { customers, products, sales, payments };

  const sessionRef = useRef(session);
  sessionRef.current = session;

  // ── Yardımcı: localStorage + state birlikte güncelle ─────────────────────
  const setC = useCallback((fn: (prev: Customer[]) => Customer[]) => {
    setCustomers(prev => { const next = fn(prev); lsWrite(LS.customers, next); return next; });
  }, []);
  const setP = useCallback((fn: (prev: Product[]) => Product[]) => {
    setProducts(prev => { const next = fn(prev); lsWrite(LS.products, next); return next; });
  }, []);
  const setS = useCallback((fn: (prev: Sale[]) => Sale[]) => {
    setSales(prev => { const next = fn(prev); lsWrite(LS.sales, next); return next; });
  }, []);
  const setPay = useCallback((fn: (prev: Payment[]) => Payment[]) => {
    setPayments(prev => { const next = fn(prev); lsWrite(LS.payments, next); return next; });
  }, []);

  // ── Mount: Drive'dan senkronize et ───────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    const token = session.accessToken;

    const hasLocal =
      lsRead(LS.customers) !== null ||
      lsRead(LS.products)  !== null;

    // localStorage boşsa skeleton göster, doluysa hemen isLoading=false
    if (!hasLocal) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    Promise.all([
      readDriveFile<Customer>(token, "customers.json"),
      readDriveFile<Product>(token,  "products.json"),
      readDriveFile<Sale>(token,     "sales.json"),
      readDriveFile<Payment>(token,  "payments.json"),
    ]).then(([c, p, s, pay]) => {
      const finalC   = c   ?? (hasLocal ? stateRef.current.customers : []);
      const finalP   = p   ?? (hasLocal ? stateRef.current.products  : []);
      const finalS   = s   ?? (hasLocal ? stateRef.current.sales     : []);
      const finalPay = pay ?? (hasLocal ? stateRef.current.payments  : []);

      setCustomers(finalC);   lsWrite(LS.customers, finalC);
      setProducts(finalP);    lsWrite(LS.products,  finalP);
      setSales(finalS);       lsWrite(LS.sales,     finalS);
      setPayments(finalPay);  lsWrite(LS.payments,  finalPay);
      setIsLoading(false);
    }).catch(() => {
      // Drive erişilemiyorsa localStorage'daki veri yeterli
      setIsLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);

  // ── Drive'a yaz (manuel veya uygulama kapanışında) ───────────────────────
  const syncToDrive = useCallback(async () => {
    const token = sessionRef.current?.accessToken;
    if (!token) return;
    const { customers, products, sales, payments } = stateRef.current;
    setIsSyncing(true);
    try {
      await Promise.all([
        writeDriveFile(token, "customers.json", customers),
        writeDriveFile(token, "products.json",  products),
        writeDriveFile(token, "sales.json",     sales),
        writeDriveFile(token, "payments.json",  payments),
      ]);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ── Uygulama kapanınca Drive'a yaz ───────────────────────────────────────
  useEffect(() => {
    function onVisibilityHide() {
      if (document.visibilityState === "hidden") {
        const token = sessionRef.current?.accessToken;
        if (!token) return;
        const { customers, products, sales, payments } = stateRef.current;
        // sendBeacon ile güvenilir background gönderim
        // Drive API multipart kabul etmiyor, navigator.sendBeacon kullanamayız.
        // Bunun yerine keepalive fetch kullanıyoruz:
        const body = JSON.stringify({ customers, products, sales, payments });
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body,
          keepalive: true,
        }).catch(() => {/* best-effort */});
      }
    }
    document.addEventListener("visibilitychange", onVisibilityHide);
    return () => document.removeEventListener("visibilitychange", onVisibilityHide);
  }, []);

  // ── Periyodik sync (her 5 dakikada bir) ──────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => syncToDrive(), 5 * 60 * 1000);
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
  }, [setC, setS, setPay]);

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

  const deletePayment = useCallback((id: string) => {
    setPay(prev => prev.filter(p => p.id !== id));
  }, [setPay]);

  const clearAllData = useCallback(async () => {
    const empty = { customers: [] as Customer[], products: [] as Product[], sales: [] as Sale[], payments: [] as Payment[] };
    setCustomers([]); lsWrite(LS.customers, []);
    setProducts([]);  lsWrite(LS.products,  []);
    setSales([]);     lsWrite(LS.sales,     []);
    setPayments([]);  lsWrite(LS.payments,  []);
    const token = sessionRef.current?.accessToken;
    if (token) {
      await Promise.all([
        writeDriveFile(token, "customers.json", empty.customers),
        writeDriveFile(token, "products.json",  empty.products),
        writeDriveFile(token, "sales.json",     empty.sales),
        writeDriveFile(token, "payments.json",  empty.payments),
      ]).catch(console.error);
    }
  }, []);

  // ── Hesaplama yardımcıları ────────────────────────────────────────────────
  const getCustomerTotals = useCallback((customerId: string) => {
    const totalRevenue   = sales.filter(s => s.customerId === customerId).reduce((sum, s) => sum + s.total, 0);
    const totalCollected = payments.filter(p => p.customerId === customerId).reduce((sum, p) => sum + p.amount, 0);
    return { totalRevenue, totalCollected, currentDebt: totalRevenue - totalCollected };
  }, [sales, payments]);

  const getCustomerFeed = useCallback((customerId: string): ActivityItem[] => {
    return buildActivityFeed(
      sales.filter(s => s.customerId === customerId),
      payments.filter(p => p.customerId === customerId),
    );
  }, [sales, payments]);

  const value = useMemo<DataContextValue>(() => ({
    customers, products, sales, payments,
    isLoading, isSyncing,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addSale, deleteSale, addPayment, deletePayment,
    getCustomerTotals, getCustomerFeed,
    syncToDrive, clearAllData,
  }), [
    customers, products, sales, payments,
    isLoading, isSyncing,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addSale, deleteSale, addPayment, deletePayment,
    getCustomerTotals, getCustomerFeed,
    syncToDrive, clearAllData,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}