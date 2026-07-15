import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/github", () => ({
  readOrMigrateDataFile: vi.fn(),
  writeDataFile: vi.fn(),
}));

import { GET, POST } from "@/app/api/sync/route";
import { auth } from "@/lib/auth";
import { readOrMigrateDataFile, writeDataFile } from "@/lib/github";

const mockAuth  = auth                  as ReturnType<typeof vi.fn>;
const mockRead  = readOrMigrateDataFile as ReturnType<typeof vi.fn>;
const mockWrite = writeDataFile         as ReturnType<typeof vi.fn>;

const SAMPLE_DATA = {
  customers: [{ id: "c1", name: "Ahmet" }],
  products:  [{ id: "p1", name: "Ürün A" }],
  sales:     [{ id: "s1", customerId: "c1", total: 100 }],
  payments:  [{ id: "pay1", customerId: "c1", amount: 50 }],
  debts:     [{ id: "d1", customerId: "c1", amount: 200 }],
};

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
  it("returns all data and single sha from data.json", async () => {
    mockRead.mockResolvedValue({ data: SAMPLE_DATA, sha: "sha_main" });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.customers).toEqual(SAMPLE_DATA.customers);
    expect(json.products).toEqual(SAMPLE_DATA.products);
    expect(json.sales).toEqual(SAMPLE_DATA.sales);
    expect(json.payments).toEqual(SAMPLE_DATA.payments);
    expect(json.debts).toEqual(SAMPLE_DATA.debts);
    expect(json.sha).toBe("sha_main");
  });

  it("returns empty arrays and null sha when data.json doesn't exist", async () => {
    mockRead.mockResolvedValue({ data: null, sha: null });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.customers).toEqual([]);
    expect(json.products).toEqual([]);
    expect(json.sales).toEqual([]);
    expect(json.payments).toEqual([]);
    expect(json.debts).toEqual([]);
    expect(json.sha).toBeNull();
  });

  it("calls readOrMigrateDataFile exactly once with userId", async () => {
    mockRead.mockResolvedValue({ data: SAMPLE_DATA, sha: "sha1" });

    await GET();

    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(mockRead).toHaveBeenCalledWith("user1");
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

  it("returns 500 when readOrMigrateDataFile throws", async () => {
    mockRead.mockRejectedValue(new Error("GitHub unavailable"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Read failed");
  });
});

// ─── POST handler ────────────────────────────────────────────────────────────

describe("POST /api/sync", () => {
  it("writes all data atomically and returns new sha", async () => {
    mockWrite.mockResolvedValue("new_sha");

    const req = makePostRequest({ ...SAMPLE_DATA, sha: "old_sha" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.sha).toBe("new_sha");
    expect(mockWrite).toHaveBeenCalledTimes(1);
  });

  it("passes all data types and sha to writeDataFile", async () => {
    mockWrite.mockResolvedValue("written_sha");

    const req = makePostRequest({ ...SAMPLE_DATA, sha: "current_sha" });
    await POST(req);

    expect(mockWrite).toHaveBeenCalledWith(
      "user1",
      {
        customers: SAMPLE_DATA.customers,
        products:  SAMPLE_DATA.products,
        sales:     SAMPLE_DATA.sales,
        payments:  SAMPLE_DATA.payments,
        debts:     SAMPLE_DATA.debts,
      },
      "current_sha"
    );
  });

  it("uses empty arrays when data fields are missing from body", async () => {
    mockWrite.mockResolvedValue("sha");

    const req = makePostRequest({ sha: null });
    await POST(req);

    expect(mockWrite).toHaveBeenCalledWith(
      "user1",
      { customers: [], products: [], sales: [], payments: [], debts: [] },
      null
    );
  });

  it("defaults sha to null when sha is missing from body", async () => {
    mockWrite.mockResolvedValue("sha");

    const req = makePostRequest({ customers: [{ id: "c1" }] });
    await POST(req);

    const [, , sha] = mockWrite.mock.calls[0] as [string, unknown, unknown];
    expect(sha).toBeNull();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const req = makePostRequest(SAMPLE_DATA);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("returns 500 when writeDataFile throws", async () => {
    mockWrite.mockRejectedValue(new Error("Network error"));

    const req = makePostRequest(SAMPLE_DATA);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Sync failed");
  });

  it("returns null sha in response when writeDataFile returns null (write failed)", async () => {
    mockWrite.mockResolvedValue(null);

    const req = makePostRequest(SAMPLE_DATA);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.sha).toBeNull();
  });
});