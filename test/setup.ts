// Extend jest-dom style matchers for Vitest
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from "util";
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;

// Crypto.getRandomValues
if (!(global as any).crypto?.getRandomValues) {
  const nodeCrypto = await import("crypto");
  (global as any).crypto = {
    getRandomValues: (b: Uint8Array) => nodeCrypto.randomFillSync(b),
    subtle: undefined,
  } as unknown as Crypto;
}

// fetch
if (!(global as any).fetch) {
  const { fetch, Headers, Request, Response, FormData, File, Blob } = await import("undici");
  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
  (global as any).Request = Request;
  (global as any).Response = Response;
  (global as any).FormData = FormData;
  (global as any).File = File;
  (global as any).Blob = Blob;
}

// matchMedia
if (!window.matchMedia) {
  (window as any).matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// ResizeObserver
if (!(global as any).ResizeObserver) {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// IntersectionObserver
if (!(global as any).IntersectionObserver) {
  (global as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    root = null;
    rootMargin = "";
    thresholds = [];
    takeRecords() { return []; }
  };
}

// URL.createObjectURL
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn();
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}

// next/image requires this in tests
vi.mock("next/image", () => ({
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return {
      type: 'img',
      props: {
        src: typeof src === "string" ? src : "",
        alt: alt || "",
        ...rest
      }
    };
  },
}));

// Auto-mock Next.js modules
vi.mock("next/navigation");
vi.mock("next/link");
vi.mock("next/headers");
