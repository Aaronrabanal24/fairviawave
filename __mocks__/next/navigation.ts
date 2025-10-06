import { vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
const back = vi.fn();
const forward = vi.fn();

export const useRouter = () => ({ push, replace, refresh, back, forward, prefetch: vi.fn() });
export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => "/";
export const notFound = vi.fn();
export const redirect = vi.fn();

export default {};
