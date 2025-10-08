import { vi } from 'vitest'

const defaultOk = { data: null, error: null } as const
const defaultSession = { data: { session: null }, error: null } as const
const defaultUser = { data: { user: null }, error: null } as const

export type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

const createQueryBuilder = (): MockQueryBuilder => {
  const builder: Partial<Record<keyof MockQueryBuilder, ReturnType<typeof vi.fn>>> = {}

  const chain = () => builder

  builder.select = vi.fn(() => chain())
  builder.insert = vi.fn(() => chain())
  builder.update = vi.fn(() => chain())
  builder.delete = vi.fn(() => chain())
  builder.eq = vi.fn(() => chain())
  builder.in = vi.fn(() => chain())
  builder.single = vi.fn(() => Promise.resolve(defaultOk))
  builder.maybeSingle = vi.fn(() => Promise.resolve(defaultOk))

  return builder as MockQueryBuilder
}

export type MockStorageBucket = ReturnType<typeof createStorageBucket>

const createStorageBucket = () => ({
  upload: vi.fn(() => Promise.resolve(defaultOk)),
  download: vi.fn(() => Promise.resolve(defaultOk)),
  list: vi.fn(() => Promise.resolve({ data: [], error: null })),
})

const defaultAuth = () => ({
  getSession: vi.fn(() => Promise.resolve(defaultSession)),
  getUser: vi.fn(() => Promise.resolve(defaultUser)),
  signInWithOtp: vi.fn(() => Promise.resolve(defaultOk)),
  signOut: vi.fn(() => Promise.resolve({ error: null })),
})

export const mockSupabaseClient = {
  auth: defaultAuth(),
  from: vi.fn(() => createQueryBuilder()),
  storage: {
    from: vi.fn(() => createStorageBucket()),
  },
  rpc: vi.fn(() => Promise.resolve(defaultOk)),
} as const

export type MockSupabaseClient = typeof mockSupabaseClient

export const createClient = vi.fn(() => mockSupabaseClient)

export const setMockSupabaseAuth = (
  overrides: Partial<MockSupabaseClient['auth']>
) => {
  Object.assign(mockSupabaseClient.auth, defaultAuth(), overrides)
}

export const resetMockSupabaseClient = () => {
  Object.assign(mockSupabaseClient.auth, defaultAuth())

  mockSupabaseClient.from.mockImplementation(() => createQueryBuilder())
  mockSupabaseClient.from.mockClear()

  mockSupabaseClient.storage.from.mockImplementation(() => createStorageBucket())
  mockSupabaseClient.storage.from.mockClear()

  mockSupabaseClient.rpc.mockImplementation(() => Promise.resolve(defaultOk))
  mockSupabaseClient.rpc.mockClear()

  createClient.mockImplementation(() => mockSupabaseClient)
  createClient.mockClear()
}

// resetMockSupabaseClient() // Removed to avoid unexpected side effects; use afterEach in setup.ts

export default mockSupabaseClient
