import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError, api, resolveBackendBase } from "./api";

const originalFetch = global.fetch;

function mockFetch(status: number, body: unknown): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () =>
      Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response);
}

beforeEach(() => {
  delete (window as { up?: unknown }).up;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("resolveBackendBase", () => {
  it("uses the Electron bridge port when present", () => {
    (window as { up?: { backendPort: number } }).up = { backendPort: 54321 };
    expect(resolveBackendBase()).toBe("http://127.0.0.1:54321");
  });

  it("falls back to the page origin in the browser", () => {
    expect(resolveBackendBase()).toBe(window.location.origin);
  });
});

describe("api error normalisation", () => {
  it("maps a FastAPI {detail:{code,message}} body to ApiRequestError", async () => {
    mockFetch(422, { detail: { code: "bad_input", message: "Geçersiz veri." } });
    await expect(api.headline()).rejects.toMatchObject({
      name: "ApiRequestError",
      code: "bad_input",
      message: "Geçersiz veri.",
      status: 422,
    });
  });

  it("maps a plain string detail to the message", async () => {
    mockFetch(404, { detail: "Bulunamadı" });
    const err = await api.headline().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect((err as ApiRequestError).message).toBe("Bulunamadı");
  });

  it("falls back to a generic Turkish message for an opaque error", async () => {
    mockFetch(500, {});
    await expect(api.headline()).rejects.toMatchObject({
      code: "unknown",
      message: "Beklenmeyen bir hata oluştu.",
    });
  });

  it("wraps a network failure as code 'network'", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api.health()).rejects.toMatchObject({
      code: "network",
      status: 0,
    });
  });

  it("returns the parsed body on success", async () => {
    mockFetch(200, { status: "ok" });
    await expect(api.health()).resolves.toEqual({ status: "ok" });
  });
});
