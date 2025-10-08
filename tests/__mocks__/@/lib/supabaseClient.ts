import { vi } from 'vitest'

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

const createQueryBuilder = (): QueryBuilder => {
  const builder: Partial<Record<keyof QueryBuilder, ReturnType<typeof vi.fn>>> = {}

  const chain = () => builder

  builder.select = vi.fn(() => chain())
  builder.insert = vi.fn(() => chain())
  builder.update = vi.fn(() => chain())
  builder.delete = vi.fn(() => chain())
  builder.eq = vi.fn(() => chain())
  builder.in = vi.fn(() => chain())
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }))
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))

  return builder as QueryBuilder
}

const createStorageBucket = () => ({
  upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
  download: vi.fn(() => Promise.resolve({ data: null, error: null })),
  list: vi.fn(() => Promise.resolve({ data: [], error: null })),
})

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithOtp: vi.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
  },
  from: vi.fn(() => createQueryBuilder()),
  storage: {
    from: vi.fn(() => createStorageBucket()),
  },
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
} as const

export const createClient = vi.fn(() => mockSupabaseClient)

export type MockSupabaseClient = typeof mockSupabaseClient

export default mockSupabaseClient
