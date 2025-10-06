import { vi } from 'vitest'

export function createPrismaMock() {
  return {
    unit: { findUnique: vi.fn() },
    signal: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn()
    },
    event: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}

export type PrismaMock = ReturnType<typeof createPrismaMock>
