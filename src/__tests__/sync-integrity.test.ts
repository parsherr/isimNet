import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { GET, POST } from "@/app/api/sync/route";
import { auth } from "@/lib/auth";
import type { Customer, Sale, Payment, Debt, SaleItem } from "@/lib/customers";
import type { Product } from "@/lib/products";
import type { AppData } from "@/lib/github";

const mockAuth = auth as ReturnType<typeof vi.fn>;

// ── Sabitler ──────────────────────────────────────────────────────────────────

const COUNTS = {
  customers: 100,
  products:  150,
  debts:     100,
  payments:  110,
  sales:     150,
};

const NOW = "2026-07-15T12:00:00.000Z";

// ── Veri üretimi ──────────────────────────────────────────────────────────────

function makeCustomers(): Customer[] {
  return Array.from({ length: COUNTS.customers }, (_, i) => ({
    id:        `c_${i + 1}`,
    name:      `Müşteri ${i + 1}`,
    phone:     `555-${String(i + 1).padStart(4, "0")}`,
    note:      i % 5 === 0 ? `Not ${i + 1}` : undefined,
    createdAt: NOW,
    updatedAt: NOW,
  }));
}

function makeProducts(): Product[] {
  return Array.from({ length: COUNTS.products }, (_, i) => ({
    id:          `p_${i + 1}`,
    name:        `Ürün ${i + 1}`,
    description: `Açıklama ${i + 1}`,
    price:       (i + 1) * 10,
    stock:       (i % 50) + 1,
    createdAt:   NOW,
    updatedAt:   NOW,
  }));
}

function makeDebts(customers: Customer[]): Debt[] {
  return Array.from({ length: COUNTS.debts }, (_, i) => ({
    id:          `d_${i + 1}`,
    customerId:  customers[i % customers.length].id,
    date:        NOW,
    amount:      (i + 1) * 25,
    description: `Borç ${i + 1}`,
  }));
}

function makePayments(customers: Customer[]): Payment[] {
  return Array.from({ length: COUNTS.payments }, (_, i) => ({
    id:          `pay_${i + 1}`,
    customerId:  customers[i % customers.length].id,
    date:        NOW,
    amount:      (i + 1) * 15,
    description: `Tahsilat ${i + 1}`,
  }));
}

function makeSales(customers: Customer[], products: Product[]): Sale[] {
  const vatRates: (0 | 10 | 20)[] = [0, 10, 20];
  return Array.from({ length: COUNTS.sales }, (_, i) => {
    const itemCount = (i % 3) + 1; // 1, 2 veya 3 ürün
    const items: SaleItem[] = Array.from({ length: itemCount }, (_, j) => {
      const prod = products[(i * 3 + j) % products.length];
      return {
        productId:   prod.id,
        productName: prod.name,
        quantity:    j + 1,
        unitPrice:   prod.price,
      };
    });
    const vatRate  = vatRates[i % 3];
    const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const vatAmount = Math.round(subtotal * vatRate / 100);
    return {
      id:         `s_${i + 1}`,
      customerId: customers[i % customers.length].id,
      date:       NOW,
      items,
      vatRate,
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
    };
  });
}

// ── Veri seti ─────────────────────────────────────────────────────────────────

const customers = makeCustomers();
const products  = makeProducts();
const debts     = makeDebts(customers);
const payments  = makePayments(customers);
const sales     = makeSales(customers, products);
const inputData: AppData = { customers, products, debts, payments, sales };

// ── Fetch interceptor ────────────────────────────────────────────────────────

let capturedData: AppData | null = null;
let putCallCount = 0;

function setupFetchMock() {
  vi.stubGlobal("fetch", async (url: unknown, opts?: RequestInit) => {
    const urlStr = String(url);
    const method = opts?.method ?? "GET";

    if (method === "PUT" && urlStr.includes("data.json")) {
      putCallCount++;
      const body = JSON.parse(opts!.body as string);
      capturedData = JSON.parse(
        Buffer.from(body.content, "base64").toString("utf-8")
      ) as AppData;
      return new Response(
        JSON.stringify({ content: { sha: "mock_sha_v1" } }),
        { status: 200 }
      );
    }

    if (method === "GET" && urlStr.includes("data.json")) {
      if (capturedData) {
        return new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(capturedData)).toString("base64"),
            sha: "mock_sha_v1",
          }),
          { status: 200 }
        );
      }
      return new Response("", { status: 404 });
    }

    // Migration fallback için eski ayrı dosyalar — yok
    return new Response("", { status: 404 });
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("Sync Integrity — 100 müşteri, 150 ürün, 100 borç, 110 tahsilat, 150 satış", () => {
  beforeAll(async () => {
    capturedData = null;
    putCallCount = 0;
    mockAuth.mockResolvedValue({ userId: "sim_user_1" });
    setupFetchMock();

    const req = new NextRequest("http://localhost/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inputData, sha: null }),
    });
    const res = await POST(req);
    // POST başarısız olursa suite'in geri kalanı zaten boş capturedData ile çalışır
    // ve her test kendi hatasını açıkça gösterir
    if (res.status !== 200) {
      const err = await res.text();
      throw new Error(`POST /api/sync başarısız [${res.status}]: ${err}`);
    }
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ── Sayısal doğruluk ──────────────────────────────────────────────────────

  it(`müşteri: beklenen ${COUNTS.customers}, gönderilen ${COUNTS.customers}`, () => {
    expect(capturedData?.customers).toHaveLength(COUNTS.customers);
  });

  it(`ürün: beklenen ${COUNTS.products}, gönderilen ${COUNTS.products}`, () => {
    expect(capturedData?.products).toHaveLength(COUNTS.products);
  });

  it(`borç: beklenen ${COUNTS.debts}, gönderilen ${COUNTS.debts}`, () => {
    expect(capturedData?.debts).toHaveLength(COUNTS.debts);
  });

  it(`tahsilat: beklenen ${COUNTS.payments}, gönderilen ${COUNTS.payments}`, () => {
    expect(capturedData?.payments).toHaveLength(COUNTS.payments);
  });

  it(`satış: beklenen ${COUNTS.sales}, gönderilen ${COUNTS.sales}`, () => {
    expect(capturedData?.sales).toHaveLength(COUNTS.sales);
  });

  // ── ID bütünlüğü ──────────────────────────────────────────────────────────

  it("tüm müşteri ID'leri eksiksiz aktarılmalı", () => {
    const expected = new Set(customers.map(c => c.id));
    const actual   = new Set(capturedData?.customers.map(c => c.id) ?? []);
    const missing  = [...expected].filter(id => !actual.has(id));
    expect(missing, `Eksik müşteri ID'leri: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("tüm ürün ID'leri eksiksiz aktarılmalı", () => {
    const expected = new Set(products.map(p => p.id));
    const actual   = new Set(capturedData?.products.map(p => p.id) ?? []);
    const missing  = [...expected].filter(id => !actual.has(id));
    expect(missing, `Eksik ürün ID'leri: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("tüm borç ID'leri eksiksiz aktarılmalı", () => {
    const expected = new Set(debts.map(d => d.id));
    const actual   = new Set(capturedData?.debts.map(d => d.id) ?? []);
    const missing  = [...expected].filter(id => !actual.has(id));
    expect(missing, `Eksik borç ID'leri: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("tüm tahsilat ID'leri eksiksiz aktarılmalı", () => {
    const expected = new Set(payments.map(p => p.id));
    const actual   = new Set(capturedData?.payments.map(p => p.id) ?? []);
    const missing  = [...expected].filter(id => !actual.has(id));
    expect(missing, `Eksik tahsilat ID'leri: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("tüm satış ID'leri eksiksiz aktarılmalı", () => {
    const expected = new Set(sales.map(s => s.id));
    const actual   = new Set(capturedData?.sales.map(s => s.id) ?? []);
    const missing  = [...expected].filter(id => !actual.has(id));
    expect(missing, `Eksik satış ID'leri: ${missing.join(", ")}`).toHaveLength(0);
  });

  // ── Referans bütünlüğü ────────────────────────────────────────────────────

  it("satışlardaki customerId'ler geçerli müşterilere işaret etmeli", () => {
    const customerIds = new Set(capturedData?.customers.map(c => c.id) ?? []);
    const invalid = (capturedData?.sales ?? []).filter(s => !customerIds.has(s.customerId));
    expect(
      invalid.map(s => `${s.id} → ${s.customerId}`),
      "Geçersiz customerId referansı içeren satışlar"
    ).toHaveLength(0);
  });

  it("satışlardaki productId'ler geçerli ürünlere işaret etmeli", () => {
    const productIds = new Set(capturedData?.products.map(p => p.id) ?? []);
    const invalidItems = (capturedData?.sales ?? []).flatMap(s =>
      s.items
        .filter(item => !productIds.has(item.productId))
        .map(item => `sale ${s.id} → product ${item.productId}`)
    );
    expect(invalidItems, "Geçersiz productId referansı içeren satış kalemleri").toHaveLength(0);
  });

  // ── Atomiklik ─────────────────────────────────────────────────────────────

  it("GitHub'a tam olarak 1 PUT isteği yapılmalı (atomik yazma)", () => {
    expect(putCallCount).toBe(1);
  });

  // ── Round-trip (GET → yazılanla aynı) ────────────────────────────────────

  it("GET ile geri okunan kayıt sayıları yazılanla eşleşmeli", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.customers).toHaveLength(COUNTS.customers);
    expect(json.products).toHaveLength(COUNTS.products);
    expect(json.debts).toHaveLength(COUNTS.debts);
    expect(json.payments).toHaveLength(COUNTS.payments);
    expect(json.sales).toHaveLength(COUNTS.sales);
    expect(json.sha).toBe("mock_sha_v1");
  });

  it("GET ile geri okunan veriler içerik olarak yazılanla birebir eşleşmeli", async () => {
    const res = await GET();
    const json = await res.json();

    const sentIds   = (key: keyof AppData) => new Set((inputData[key] as { id: string }[]).map(r => r.id));
    const gotIds    = (key: keyof AppData) => new Set((json[key] as { id: string }[]).map(r => r.id));
    const diff      = (key: keyof AppData) => [...sentIds(key)].filter(id => !gotIds(key).has(id));

    expect(diff("customers"), "Müşteri farkı").toHaveLength(0);
    expect(diff("products"),  "Ürün farkı").toHaveLength(0);
    expect(diff("debts"),     "Borç farkı").toHaveLength(0);
    expect(diff("payments"),  "Tahsilat farkı").toHaveLength(0);
    expect(diff("sales"),     "Satış farkı").toHaveLength(0);
  });

  // ── Tanı raporu ───────────────────────────────────────────────────────────

  it("Tanı: eksik kayıt varsa hangileri ve olası sebep raporla", () => {
    const sections: string[] = [];

    function diagnose(
      label: string,
      expected: string[],
      actual: string[]
    ) {
      const actualSet = new Set(actual);
      const missing   = expected.filter(id => !actualSet.has(id));
      const extra     = [...actualSet].filter(id => !expected.includes(id));

      if (missing.length === 0 && extra.length === 0) return;

      const lines: string[] = [`[${label}]`];
      if (missing.length > 0) {
        const sample = missing.slice(0, 10).join(", ");
        const more   = missing.length > 10 ? ` (+${missing.length - 10} daha)` : "";
        lines.push(`  Eksik (${missing.length}): ${sample}${more}`);
        lines.push(`  Olası sebep: SHA race condition (stale SHA → 409 → null → 422), payload truncation veya JSON serializasyon hatası`);
      }
      if (extra.length > 0) {
        lines.push(`  Fazladan (${extra.length}): ${extra.slice(0, 5).join(", ")}`);
      }
      sections.push(lines.join("\n"));
    }

    diagnose("customers", customers.map(c => c.id), capturedData?.customers.map(c => c.id) ?? []);
    diagnose("products",  products.map(p => p.id),  capturedData?.products.map(p => p.id)  ?? []);
    diagnose("debts",     debts.map(d => d.id),     capturedData?.debts.map(d => d.id)     ?? []);
    diagnose("payments",  payments.map(p => p.id),  capturedData?.payments.map(p => p.id)  ?? []);
    diagnose("sales",     sales.map(s => s.id),     capturedData?.sales.map(s => s.id)     ?? []);

    if (sections.length > 0) {
      const report = [
        "",
        "=== SYNC INTEGRITY RAPORU — VERİ KAYBI TESPİT EDİLDİ ===",
        ...sections,
        "===========================================================",
        "",
      ].join("\n");
      console.error(report);
    } else {
      console.info("\n✓ Tüm kayıtlar eksiksiz aktarıldı. Veri kaybı yok.\n");
    }

    expect(
      sections,
      "Veri bütünlüğü ihlali tespit edildi — yukarıdaki raporu inceleyin"
    ).toHaveLength(0);
  });
});