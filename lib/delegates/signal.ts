import { prisma } from '@/lib/db';
import { Signal } from '@prisma/client';

/**
 * Signal delegate for interacting with signal events in the database
 */
export const signalDelegate = {
  /**
   * Count signals matching the given criteria
   */
  async count(args: {
    where: {
      unitId: string;
      type: string;
      createdAt?: { gte: Date };
    };
  }): Promise<number> {
    return prisma.signal.count({
      where: args.where
    });
  },

  /**
   * Create a new signal
   */
  async create(data: {
    unitId: string;
    type: string;
    sessionId: string;
    ipHash: string;
    metadata?: Record<string, any>;
  }): Promise<Signal> {
    return prisma.signal.create({
      data: {
        unitId: data.unitId,
        type: data.type,
        sessionId: data.sessionId,
        ipHash: data.ipHash,
        metadata: data.metadata || {}
      }
    });
  },

  /**
   * List signals for a unit
   */
  async list(args: {
    unitId: string;
    limit?: number;
    cursor?: string;
    type?: string;
  }): Promise<Signal[]> {
    return prisma.signal.findMany({
      where: {
        unitId: args.unitId,
        ...(args.type ? { type: args.type } : {})
      },
      take: args.limit || 50,
      ...(args.cursor ? {
        cursor: { id: args.cursor },
        skip: 1
      } : {}),
      orderBy: { createdAt: 'desc' }
    });
  }
};