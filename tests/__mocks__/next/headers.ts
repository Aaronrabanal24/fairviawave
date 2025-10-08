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

export const cookies = vi.fn(() => createCookieStore())

export const headers = vi.fn(() => new Headers())
