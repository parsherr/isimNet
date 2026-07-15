import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readGitHubFile, writeGitHubFile } from "@/lib/github";

function b64(data: unknown): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function mockFetch(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status })
    )
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── readGitHubFile ───────────────────────────────────────────────────────────

describe("readGitHubFile", () => {
  it("returns data and sha on 200 OK", async () => {
    const payload = [{ id: "c1", name: "Ali" }];
    mockFetch({ content: b64(payload), sha: "abc123" });

    const result = await readGitHubFile("user1", "customers.json");

    expect(result.data).toEqual(payload);
    expect(result.sha).toBe("abc123");
  });

  it("returns null/null on 404", async () => {
    mockFetch("", 404);

    const result = await readGitHubFile("user1", "customers.json");

    expect(result.data).toBeNull();
    expect(result.sha).toBeNull();
  });

  it("returns null/null on non-ok responses (e.g. 500)", async () => {
    mockFetch({ message: "Server error" }, 500);

    const result = await readGitHubFile("user1", "customers.json");

    expect(result.data).toBeNull();
    expect(result.sha).toBeNull();
  });

  it("calls GitHub API with correct URL structure and auth header", async () => {
    const payload = [{ id: "p1" }];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: b64(payload), sha: "sha1" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await readGitHubFile("userXYZ", "products.json");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/api\.github\.com\/repos\/.+\/.+\/contents\/users\/userXYZ\/products\.json\?ref=.+$/);
    expect((opts.headers as Record<string, string>)["Authorization"]).toMatch(/^token .+/);
  });
});

// ─── writeGitHubFile ─────────────────────────────────────────────────────────

describe("writeGitHubFile", () => {
  it("returns new sha on success", async () => {
    mockFetch({ content: { sha: "new_sha_456" } }, 200);

    const sha = await writeGitHubFile("user1", "products.json", [{ id: "1" }], null);

    expect(sha).toBe("new_sha_456");
  });

  it("returns null and logs error on failure (409 conflict)", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({ message: "conflict" }, 409);

    const sha = await writeGitHubFile("user1", "sales.json", [], "old_sha");

    expect(sha).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("409"),
      expect.stringContaining("conflict")
    );
  });

  it("includes sha in request body when sha is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: { sha: "updated_sha" } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await writeGitHubFile("user1", "debts.json", [], "existing_sha_abc");

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.sha).toBe("existing_sha_abc");
  });

  it("omits sha from request body when sha is null", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: { sha: "created_sha" } }), { status: 201 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await writeGitHubFile("user1", "payments.json", [], null);

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.sha).toBeUndefined();
  });

  it("encodes data as base64 in request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: { sha: "s1" } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = [{ id: "c1", name: "Test" }];
    await writeGitHubFile("user1", "customers.json", data, null);

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    const decoded = JSON.parse(Buffer.from(body.content, "base64").toString("utf-8"));
    expect(decoded).toEqual(data);
  });

  it("uses correct file path structure in PUT URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: { sha: "s1" } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await writeGitHubFile("user42", "sales.json", [], null);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toMatch(/^https:\/\/api\.github\.com\/repos\/.+\/.+\/contents\/users\/user42\/sales\.json$/);
  });

  it("returns null when content.sha is missing from success response", async () => {
    mockFetch({ content: {} }, 200);

    const sha = await writeGitHubFile("user1", "customers.json", [], null);

    expect(sha).toBeNull();
  });
});