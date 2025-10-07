import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ensureSignalSeed, closeSeedClient } from "../helpers/seed";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

beforeAll(async () => {
  // Ensure there is data for the API to read.
  await ensureSignalSeed("seed-demo");
});

afterAll(async () => {
  await closeSeedClient();
});

describe("signals sparkline", () => {
  it("requires unitId", async () => {
    const r = await fetch(`${BASE}/api/signals/sparkline`);
    expect(r.status).toBe(400);
  });

  it("returns an array of {dayISO, score} and clamps days", async () => {
    const r = await fetch(`${BASE}/api/signals/sparkline?unitId=seed-demo&days=999`);
    expect(r.ok).toBe(true);
    const j = await r.json();
    expect(Array.isArray(j.points)).toBe(true);
    if (j.points.length) {
      expect(typeof j.points[0].dayISO).toBe("string");
      expect(typeof j.points[0].score).toBe("number");
    }
    expect(typeof j.lastUpdatedISO).toBe("string");
    expect(j.windowDays).toBeLessThanOrEqual(90);
    expect(j.windowDays).toBeGreaterThanOrEqual(1);
  });
});