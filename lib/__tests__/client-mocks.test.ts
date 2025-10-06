import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient, type Signal, type Unit } from '@prisma/client'
import { createClient, type User } from '@supabase/supabase-js'

// Ensure mocks are applied before imports
vi.mock('@prisma/client', async () => {
  const actual = await vi.importActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: vi.fn(() => ({
      unit: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      event: {
        findMany: vi.fn(),
        create: vi.fn()
      },
      signal: {
        upsert: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      $connect: vi.fn(),
      $disconnect: vi.fn()
    }))
  };
});

vi.mock('@supabase/supabase-js', async () => {
  const actual = await vi.importActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
        match: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn()
      }))
    }))
  };
});

describe('Database Client Mocks', () => {
  let prisma: PrismaClient
  
  beforeEach(() => {
    prisma = new PrismaClient()
    vi.clearAllMocks()
  })

  it('should mock Prisma client operations', async () => {
    const now = new Date()
    const mockUnit: Partial<Unit> = {
      id: '1',
      name: 'test-unit',
      status: 'published',
      createdAt: now,
      updatedAt: now
    }

    vi.mocked(prisma.unit.findFirst).mockResolvedValue(mockUnit as Unit)

    const result = await prisma.unit.findFirst({ where: { status: 'published' } })
    expect(result).toEqual(mockUnit)
    expect(prisma.unit.findFirst).toHaveBeenCalledWith({ where: { status: 'published' } })
  })

  it('should mock Supabase auth operations', async () => {
    const now = new Date().toISOString()
    const mockUser: User = {
      id: '123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: now,
      updated_at: now,
      role: 'authenticated',
      email: 'test@example.com'
    }
    const mockUserResponse = { data: { user: mockUser }, error: null }
    
    const supabase = createClient('http://localhost:54321', 'test-anon-key')
    vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUserResponse)
    
    const response = await supabase.auth.getUser()
    expect(response.data.user).toEqual(mockUser)
    expect(response.error).toBeNull()
    expect(supabase.auth.getUser).toHaveBeenCalled()
  })

  it('should mock signal creation and updates', async () => {
    const now = new Date()
    const mockSignal: Signal = {
      id: '1',
      unitId: '123',
      type: 'view_trust',
      sessionId: 'test-session',
      userId: null,
      ipHash: 'test-ip-hash',
      userAgent: null,
      score: 1,
      metadata: { someData: 'test' } as any,
      createdAt: now,
      updatedAt: now
    }

    vi.mocked(prisma.signal.upsert).mockResolvedValue(mockSignal)

    const result = await prisma.signal.upsert({
      where: { id: mockSignal.id },
      create: {
        unitId: mockSignal.unitId,
        type: mockSignal.type,
        sessionId: mockSignal.sessionId,
        ipHash: mockSignal.ipHash,
        score: mockSignal.score,
        metadata: { someData: 'test' } as any,
        userId: null,
        userAgent: null
      },
      update: {
        score: mockSignal.score,
        metadata: { someData: 'test' } as any
      }
    })

    expect(result).toEqual(mockSignal)
    expect(prisma.signal.upsert).toHaveBeenCalled()
  })
})