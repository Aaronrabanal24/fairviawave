import { describe, it, expect } from "vitest";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

describe("api content-type sanity", () => {
  it("health returns JSON (not HTML)", async () => {
    const r = await fetch(`${BASE}/api/health`, { redirect: "manual" });
    expect(r.ok).toBe(true);
    const ct = r.headers.get("content-type") || "";
    expect(ct.includes("application/json")).toBe(true);
  });
});