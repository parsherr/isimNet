import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/github", () => ({
  readGitHubFile: vi.fn(),
  writeGitHubFile: vi.fn(),
}));

import { GET, POST } from "@/app/api/sync/route";
import { auth } from "@/lib/auth";
import { readGitHubFile, writeGitHubFile } from "@/lib/github";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockRead  = readGitHubFile  as ReturnType<typeof vi.fn>;
const mockWrite = writeGitHubFile as ReturnType<typeof vi.fn>;

const FILES = ["customers", "products", "sales", "payments", "debts"] as const;

function makeReadResponse(data: unknown[], sha: string | null) {
  return { data, sha };
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ userId: "user1" });
});

// ─── GET handler ─────────────────────────────────────────────────────────────

describe("GET /api/sync", () => {
  it("reads all 5 files and returns them with shas", async () => {
    const testData = {
      customers: [{ id: "c1", name: "Ahmet" }],
      products:  [{ id: "p1", name: "Ürün A" }],
      sales:     [{ id: "s1", customerId: "c1", total: 100 }],
      payments:  [{ id: "pay1", customerId: "c1", amount: 50 }],
      debts:     [{ id: "d1", customerId: "c1", amount: 200 }],
    };

    mockRead.mockImplementation((_userId: string, fileName: string) => {
      const key = fileName.replace(".json", "") as keyof typeof testData;
      return Promise.resolve(makeReadResponse(testData[key], `sha_${key}`));
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    for (const f of FILES) {
      expect(json[f]).toEqual(testData[f]);
      expect(json.shas[f]).toBe(`sha_${f}`);
    }
  });

  it("reads exactly 5 files (one per data type)", async () => {
    mockRead.mockResolvedValue({ data: [], sha: null });

    await GET();

    expect(mockRead).toHaveBeenCalledTimes(5);
    for (const f of FILES) {
      expect(mockRead).toHaveBeenCalledWith("user1", `${f}.json`);
    }
  });

  it("returns empty array for a file that doesn't exist (404 → null)", async () => {
    mockRead.mockImplementation((_userId: string, fileName: string) => {
      if (fileName === "debts.json") return Promise.resolve({ data: null, sha: null });
      return Promise.resolve({ data: [], sha: "sha1" });
    });

    const res = await GET();
    const json = await res.json();

    expect(json.debts).toEqual([]);
    expect(json.shas.debts).toBeNull();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(mockRead).not.toHaveBeenCalled();
  });

  it("returns 401 when session has no userId", async () => {
    mockAuth.mockResolvedValue({ userId: undefined });

    const res = await GET();

    expect(res.status).toBe(401);
  });
});

// ─── POST handler ────────────────────────────────────────────────────────────

describe("POST /api/sync", () => {
  const sampleBody = {
    customers: [{ id: "c1", name: "Veli" }],
    products:  [{ id: "p1", name: "Çay" }],
    sales:     [{ id: "s1", customerId: "c1", total: 50 }],
    payments:  [{ id: "pay1", customerId: "c1", amount: 25 }],
    debts:     [{ id: "d1", customerId: "c1", amount: 10 }],
    shas: {
      customers: "sha_c",
      products:  "sha_p",
      sales:     "sha_s",
      payments:  "sha_pay",
      debts:     "sha_d",
    },
  };

  it("writes all 5 data types to GitHub", async () => {
    mockWrite.mockResolvedValue("new_sha");

    const req = makePostRequest(sampleBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockWrite).toHaveBeenCalledTimes(5);
  });

  it("writes each file with correct data and sha from body", async () => {
    mockWrite.mockResolvedValue("updated_sha");

    const req = makePostRequest(sampleBody);
    await POST(req);

    for (const f of FILES) {
      expect(mockWrite).toHaveBeenCalledWith(
        "user1",
        `${f}.json`,
        sampleBody[f as keyof typeof sampleBody],
        sampleBody.shas[f as keyof typeof sampleBody.shas]
      );
    }
  });

  it("writes files sequentially — each awaited before the next", async () => {
    const callOrder: string[] = [];
    mockWrite.mockImplementation((_userId: string, fileName: string) => {
      callOrder.push(fileName);
      return Promise.resolve(`sha_${fileName}`);
    });

    const req = makePostRequest(sampleBody);
    await POST(req);

    expect(callOrder).toEqual([
      "customers.json",
      "products.json",
      "sales.json",
      "payments.json",
      "debts.json",
    ]);
  });

  it("returns updated shas for all 5 files in response", async () => {
    mockWrite.mockImplementation((_userId: string, fileName: string) =>
      Promise.resolve(`new_sha_${fileName}`)
    );

    const req = makePostRequest(sampleBody);
    const res = await POST(req);
    const json = await res.json();

    for (const f of FILES) {
      expect(json.shas[f]).toBe(`new_sha_${f}.json`);
    }
  });

  it("continues writing remaining files when one write returns null (partial failure)", async () => {
    mockWrite.mockImplementation((_userId: string, fileName: string) => {
      if (fileName === "sales.json") return Promise.resolve(null);
      return Promise.resolve(`sha_${fileName}`);
    });

    const req = makePostRequest(sampleBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.shas.sales).toBeNull();
    expect(json.shas.customers).toBe("sha_customers.json");
    expect(json.shas.products).toBe("sha_products.json");
    expect(mockWrite).toHaveBeenCalledTimes(5);
  });

  it("uses empty arrays when data type is missing from body", async () => {
    mockWrite.mockResolvedValue("sha");

    const req = makePostRequest({ shas: {} });
    await POST(req);

    for (const f of FILES) {
      expect(mockWrite).toHaveBeenCalledWith("user1", `${f}.json`, [], null);
    }
  });

  it("defaults shas to empty object when shas is missing from body", async () => {
    mockWrite.mockResolvedValue("sha");

    // body has no shas key at all → shas[f] ?? null → null for each file
    const req = makePostRequest({ customers: [{ id: "c1" }] });
    await POST(req);

    expect(mockWrite).toHaveBeenCalledWith("user1", "customers.json", [{ id: "c1" }], null);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const req = makePostRequest(sampleBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("returns 500 when writeGitHubFile throws an exception", async () => {
    mockWrite.mockRejectedValue(new Error("Network error"));

    const req = makePostRequest(sampleBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Sync failed");
  });
});

// ─── GET error branch ────────────────────────────────────────────────────────

describe("GET /api/sync — error handling", () => {
  it("returns 500 when readGitHubFile throws an exception", async () => {
    mockRead.mockRejectedValue(new Error("GitHub unavailable"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Read failed");
  });
});