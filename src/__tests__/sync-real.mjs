/**
 * Gerçek GitHub API integration testi.
 * Çalıştırma: node --env-file=.env.local src/__tests__/sync-real.mjs
 *
 * Yaptığı:
 *  1. Test kullanıcısı için GitHub'a veri yazar (PUT)
 *  2. Geri okur (GET)
 *  3. Gönderilen ile gelen kayıt sayılarını ve ID'leri karşılaştırır
 *  4. Eksik/fazla varsa detaylı rapor üretir
 *  5. Test verisini GitHub'dan temizler
 */

const BASE      = "https://api.github.com";
const OWNER     = process.env.GITHUB_REPO_OWNER;
const REPO      = process.env.GITHUB_REPO_NAME;
const BRANCH    = process.env.GITHUB_BRANCH ?? "main";
const TOKEN     = process.env.GITHUB_TOKEN;
const TEST_USER = `test_sim_${Date.now()}`;

if (!TOKEN || !OWNER || !REPO) {
  console.error("Eksik env değişkeni: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME zorunlu.");
  process.exit(1);
}

// ── Renkli log yardımcıları ──────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ── Veri üretimi ──────────────────────────────────────────────────────────────
const NOW = new Date().toISOString();
const COUNTS = { customers: 100, products: 150, debts: 100, payments: 110, sales: 150 };

function makeCustomers() {
  return Array.from({ length: COUNTS.customers }, (_, i) => ({
    id: `c_${i + 1}`, name: `Müşteri ${i + 1}`,
    phone: `555-${String(i + 1).padStart(4, "0")}`,
    note: i % 5 === 0 ? `Not ${i + 1}` : undefined,
    createdAt: NOW, updatedAt: NOW,
  }));
}

function makeProducts() {
  return Array.from({ length: COUNTS.products }, (_, i) => ({
    id: `p_${i + 1}`, name: `Ürün ${i + 1}`,
    description: `Açıklama ${i + 1}`,
    price: (i + 1) * 10, stock: (i % 50) + 1,
    createdAt: NOW, updatedAt: NOW,
  }));
}

function makeDebts(customers) {
  return Array.from({ length: COUNTS.debts }, (_, i) => ({
    id: `d_${i + 1}`, customerId: customers[i % customers.length].id,
    date: NOW, amount: (i + 1) * 25, description: `Borç ${i + 1}`,
  }));
}

function makePayments(customers) {
  return Array.from({ length: COUNTS.payments }, (_, i) => ({
    id: `pay_${i + 1}`, customerId: customers[i % customers.length].id,
    date: NOW, amount: (i + 1) * 15, description: `Tahsilat ${i + 1}`,
  }));
}

function makeSales(customers, products) {
  const vatRates = [0, 10, 20];
  return Array.from({ length: COUNTS.sales }, (_, i) => {
    const itemCount = (i % 3) + 1;
    const items = Array.from({ length: itemCount }, (_, j) => {
      const prod = products[(i * 3 + j) % products.length];
      return { productId: prod.id, productName: prod.name, quantity: j + 1, unitPrice: prod.price };
    });
    const vatRate  = vatRates[i % 3];
    const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const vatAmount = Math.round(subtotal * vatRate / 100);
    return {
      id: `s_${i + 1}`, customerId: customers[i % customers.length].id,
      date: NOW, items, vatRate, subtotal, vatAmount, total: subtotal + vatAmount,
    };
  });
}

// ── GitHub API yardımcıları ───────────────────────────────────────────────────
const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

function dataPath() {
  return `users/${TEST_USER}/data.json`;
}

async function ghWrite(data, sha) {
  const content = Buffer.from(JSON.stringify(data)).toString("base64");
  const body = { message: "sync: integration test write", content, branch: BRANCH };
  if (sha) body.sha = sha;

  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${dataPath()}`, {
    method: "PUT", headers, body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GitHub PUT başarısız [${res.status}]: ${JSON.stringify(json)}`);
  return json.content?.sha ?? null;
}

async function ghRead() {
  const res = await fetch(
    `${BASE}/repos/${OWNER}/${REPO}/contents/${dataPath()}?ref=${BRANCH}`,
    { headers }
  );
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET başarısız [${res.status}]`);
  const json = await res.json();
  const data = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
  return { data, sha: json.sha };
}

async function ghDelete(sha) {
  const body = { message: "sync: integration test cleanup", sha, branch: BRANCH };
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${dataPath()}`, {
    method: "DELETE", headers, body: JSON.stringify(body),
  });
  return res.ok;
}

// ── Karşılaştırma yardımcıları ────────────────────────────────────────────────
function compare(label, expected, actual) {
  const expIds = new Set(expected.map(r => r.id));
  const actIds = new Set((actual ?? []).map(r => r.id));
  const missing = [...expIds].filter(id => !actIds.has(id));
  const extra   = [...actIds].filter(id => !expIds.has(id));
  return { label, expected: expected.length, actual: (actual ?? []).length, missing, extra };
}

// ── Ana test akışı ────────────────────────────────────────────────────────────
async function run() {
  console.log(bold(`\n=== IsimNet Sync Real Integration Test ===`));
  console.log(`Test kullanıcısı : ${TEST_USER}`);
  console.log(`GitHub repo      : ${OWNER}/${REPO} (${BRANCH})`);
  console.log(`Veri dosyası     : ${dataPath()}\n`);

  // 1. Veri üret
  console.log("1. Veri üretiliyor...");
  const customers = makeCustomers();
  const products  = makeProducts();
  const debts     = makeDebts(customers);
  const payments  = makePayments(customers);
  const sales     = makeSales(customers, products);
  const payload   = { customers, products, debts, payments, sales };

  const totalExpected = customers.length + products.length + debts.length + payments.length + sales.length;
  console.log(`   Beklenen toplam kayıt: ${totalExpected}`);
  console.log(`   - ${customers.length} müşteri, ${products.length} ürün, ${debts.length} borç, ${payments.length} tahsilat, ${sales.length} satış`);

  const payloadBytes = Buffer.byteLength(JSON.stringify(payload));
  console.log(`   Payload boyutu: ${(payloadBytes / 1024).toFixed(1)} KB\n`);

  // 2. GitHub'a yaz
  console.log("2. GitHub'a yazılıyor (PUT)...");
  const t0 = Date.now();
  let writeSha;
  try {
    writeSha = await ghWrite(payload, null);
    console.log(green(`   ✓ Yazma başarılı (${Date.now() - t0}ms) — SHA: ${writeSha?.slice(0, 12)}...\n`));
  } catch (err) {
    console.error(red(`   ✗ YAZMA BAŞARISIZ: ${err.message}`));
    process.exit(1);
  }

  // 3. GitHub'dan geri oku
  console.log("3. GitHub'dan okunuyor (GET)...");
  const t1 = Date.now();
  let readData, readSha;
  try {
    ({ data: readData, sha: readSha } = await ghRead());
    console.log(green(`   ✓ Okuma başarılı (${Date.now() - t1}ms) — SHA: ${readSha?.slice(0, 12)}...\n`));
  } catch (err) {
    console.error(red(`   ✗ OKUMA BAŞARISIZ: ${err.message}`));
    process.exit(1);
  }

  // 4. SHA tutarlılığı
  if (writeSha !== readSha) {
    console.warn(yellow(`   ⚠ SHA uyuşmazlığı: write=${writeSha?.slice(0,12)} read=${readSha?.slice(0,12)}`));
  }

  // 5. Karşılaştır
  console.log("4. Karşılaştırma yapılıyor...\n");
  const results = [
    compare("customers", customers, readData?.customers),
    compare("products",  products,  readData?.products),
    compare("debts",     debts,     readData?.debts),
    compare("payments",  payments,  readData?.payments),
    compare("sales",     sales,     readData?.sales),
  ];

  let allOk = true;
  for (const r of results) {
    const countOk = r.expected === r.actual;
    const idOk    = r.missing.length === 0 && r.extra.length === 0;
    const ok      = countOk && idOk;
    if (!ok) allOk = false;

    const icon = ok ? green("✓") : red("✗");
    console.log(`   ${icon} ${r.label.padEnd(12)}: beklenen=${r.expected}, gelen=${r.actual}${ok ? "" : red(" ← FARK VAR")}`);
    if (r.missing.length > 0) {
      const sample = r.missing.slice(0, 10).join(", ");
      const more   = r.missing.length > 10 ? ` (+${r.missing.length - 10} daha)` : "";
      console.log(red(`             Eksik ID'ler (${r.missing.length}): ${sample}${more}`));
      console.log(red(`             Olası sebep: SHA stale → 409 conflict → null SHA → 422 → veri yazılamadı`));
    }
    if (r.extra.length > 0) {
      console.log(yellow(`             Fazladan ID'ler (${r.extra.length}): ${r.extra.slice(0, 5).join(", ")}`));
    }
  }

  // Toplam
  const totalActual = results.reduce((s, r) => s + r.actual, 0);
  console.log(`\n   Toplam: beklenen=${totalExpected}, gelen=${totalActual}`);
  if (totalExpected === totalActual) {
    console.log(green(`   ✓ Kayıt sayısı tam eşleşiyor.\n`));
  } else {
    console.log(red(`   ✗ ${totalExpected - totalActual} kayıt kayboldu!\n`));
  }

  // 6. Temizlik
  console.log("5. GitHub'daki test verisi temizleniyor...");
  try {
    const deleted = await ghDelete(readSha ?? writeSha);
    if (deleted) console.log(green(`   ✓ Temizlik tamamlandı. ${dataPath()} silindi.\n`));
    else         console.log(yellow(`   ⚠ Silme isteği başarısız oldu (yine de devam).\n`));
  } catch (err) {
    console.warn(yellow(`   ⚠ Temizlik hatası: ${err.message}\n`));
  }

  // 7. Sonuç
  console.log(bold("=== SONUÇ ==="));
  if (allOk) {
    console.log(green("✓ Tüm testler geçti. Veri kaybı yok, round-trip başarılı."));
  } else {
    console.log(red("✗ Veri bütünlüğü ihlali tespit edildi. Yukarıdaki raporu inceleyin."));
    process.exit(1);
  }
  console.log();
}

run().catch(err => {
  console.error(red(`\nBeklenmedik hata: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});