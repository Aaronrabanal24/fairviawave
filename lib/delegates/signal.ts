import { prisma } from '@/lib/db';
import { warnAnyCastStillPresent } from '@/lib/devWarnings';

/**
 * Signal delegate shape - minimal interface for what we need
 */
type SignalDelegateShape = {
  findFirst: (args?: any) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  create: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
  upsert: (args?: any) => Promise<any>;
};

function missing() {
  throw new Error('prisma.signal delegate missing at runtime. Run `npm run check:delegates` and ensure schema + generate are in sync.');
}

/**
 * Centralized escape hatch: one any-cast, nowhere else.
 * If the delegate is absent at runtime we throw a loud error.
 */
export const signalDelegate: SignalDelegateShape =
  ((prisma as any)?.signal ?? { findFirst: missing, findMany: missing, create: missing, count: missing, upsert: missing });

// Warn in dev that we're still using any-cast
if ((prisma as any)?.signal) warnAnyCastStillPresent();