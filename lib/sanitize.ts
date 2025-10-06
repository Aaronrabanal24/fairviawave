export const ALLOWED_META_KEYS = new Set([
  'unitId', 'source', 'path', 'ref', 'userAgent', 'label', 'value', 'ipHash', 'uaHint'
]);

type JsonPrimitive = string | number | boolean | null;
type Json = JsonPrimitive | Json[] | { [k: string]: Json };

/** Shallow allowlist: drops unknown keys and non-JSON-safe values. */
export function sanitizeMeta(input: unknown): Record<string, Json> {
  const out: Record<string, Json> = {};
  if (!input || typeof input !== 'object') return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_META_KEYS.has(k)) continue;
    if (v === null) { out[k] = null; continue; }
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') { out[k] = v as JsonPrimitive; continue; }
    // Permit shallow arrays/objects if JSON-safe
    try {
      const jsonable = JSON.parse(JSON.stringify(v));
      out[k] = jsonable as Json;
    } catch {
      /* drop non-serializable */
    }
  }
  return out;
}