import { vi } from 'vitest'

export type MockRouter = {
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

let router = createRouter()
let pathname = '/'
let searchParams: URLSearchParams | undefined
let params: Record<string, string | string[] | undefined> = {}

const redirectImpl = (destination: string) => {
  const error = new Error(`NEXT_REDIRECT:${destination}`)
  ;(error as { digest?: string }).digest = 'NEXT_REDIRECT'
  throw error
}

const notFoundImpl = () => {
  const error = new Error('NEXT_NOT_FOUND')
  ;(error as { digest?: string }).digest = 'NEXT_NOT_FOUND'
  throw error
}

export const useRouter = vi.fn(() => router)

export const usePathname = vi.fn(() => pathname)

export const useSearchParams = vi.fn(() => searchParams ?? new URLSearchParams())

export const useParams = vi.fn(() => params)

export const redirect = vi.fn(redirectImpl)

export const notFound = vi.fn(notFoundImpl)

export const setMockRouter = (overrides: Partial<MockRouter>) => {
  router = { ...createRouter(), ...overrides }
}

export const setMockPathname = (value: string) => {
  pathname = value
}

export const setMockSearchParams = (
  value: URLSearchParams | Record<string, string> | [string, string][]
) => {
  if (value instanceof URLSearchParams) {
    searchParams = value
    return
  }

  if (Array.isArray(value)) {
    searchParams = new URLSearchParams(value)
    return
  }

  searchParams = new URLSearchParams(value)
}

export const setMockParams = (value: Record<string, string | string[] | undefined>) => {
  params = value
}

export const resetNextNavigationMocks = () => {
  router = createRouter()
  pathname = '/'
  searchParams = undefined
  params = {}

  useRouter.mockImplementation(() => router)
  useRouter.mockClear()

  usePathname.mockImplementation(() => pathname)
  usePathname.mockClear()

  useSearchParams.mockImplementation(() => searchParams ?? new URLSearchParams())
  useSearchParams.mockClear()

  useParams.mockImplementation(() => params)
  useParams.mockClear()

  redirect.mockImplementation(redirectImpl)
  redirect.mockClear()

  notFound.mockImplementation(notFoundImpl)
  notFound.mockClear()
}
