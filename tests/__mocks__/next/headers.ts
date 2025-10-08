import { Headers } from 'undici'
import { vi } from 'vitest'

type CookieStore = {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const createCookieStore = (): CookieStore => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
})

let cookieStore = createCookieStore()

export const cookies = vi.fn(() => cookieStore)

export const headers = vi.fn(() => new Headers())

export const setMockCookies = (overrides: Partial<CookieStore>) => {
  cookieStore = { ...createCookieStore(), ...overrides }
}

export const resetNextHeadersMocks = () => {
  cookieStore = createCookieStore()

  cookies.mockImplementation(() => cookieStore)
  cookies.mockClear()

  headers.mockImplementation(() => new Headers())
  headers.mockClear()
}
