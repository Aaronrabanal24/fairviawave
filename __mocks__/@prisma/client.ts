import { vi } from "vitest";

// Mock Prisma Client with all necessary methods
const mockPrismaClient = {
  unit: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  event: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  signal: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn((callback) => callback(mockPrismaClient)),
};

export class PrismaClient {
  unit = mockPrismaClient.unit;
  event = mockPrismaClient.event;
  signal = mockPrismaClient.signal;
  $connect = mockPrismaClient.$connect;
  $disconnect = mockPrismaClient.$disconnect;
  $transaction = mockPrismaClient.$transaction;
}

export default mockPrismaClient;
