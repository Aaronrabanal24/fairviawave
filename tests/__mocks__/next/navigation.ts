import { vi } from 'vitest'

type MockRouter = {
  push: ReturnType<typeof vi.fn>
  replace: ReturnType<typeof vi.fn>
  refresh: ReturnType<typeof vi.fn>
  back: ReturnType<typeof vi.fn>
  forward: ReturnType<typeof vi.fn>
  prefetch: ReturnType<typeof vi.fn>
}

const createRouter = (): MockRouter => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
})

export const useRouter = vi.fn(() => createRouter())

export const useSearchParams = vi.fn(() => new URLSearchParams())

export const usePathname = vi.fn(() => '/')

export const redirect = vi.fn((destination: string) => {
  const error = new Error(`NEXT_REDIRECT:${destination}`)
  ;(error as { digest?: string }).digest = 'NEXT_REDIRECT'
  throw error
})

export const notFound = vi.fn(() => {
  const error = new Error('NEXT_NOT_FOUND')
  ;(error as { digest?: string }).digest = 'NEXT_NOT_FOUND'
  throw error
})
