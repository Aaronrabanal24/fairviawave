import { vi } from 'vitest'

export const mockPrisma = {
  unit: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  event: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  signal: {
    findFirst: vi.fn(),
    upsert: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
}

export const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}