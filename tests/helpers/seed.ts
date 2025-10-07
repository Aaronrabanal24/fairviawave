import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function ensureSignalSeed(unitId = "seed-demo") {
  // If there are already recent rows, do nothing (idempotent).
  const recent = await prisma.signal.count({
    where: { unitId, createdAt: { gte: new Date(Date.now() - 45*24*60*60*1000) } },
  });
  if (recent >= 3) return;

  // Seed a minimal set that exercises sparkline/funnel.
  const now = new Date();
  await prisma.signal.createMany({
    data: [
      { unitId, type: "view_trust", sessionId: "test_sess", ipHash: "127.0.0.1", createdAt: new Date(now.getTime() - 24*60*60*1000) },
      { unitId, type: "tour_request", sessionId: "test_sess", ipHash: "127.0.0.1", createdAt: new Date(now.getTime() - 12*60*60*1000) },
      { unitId, type: "tour_request", sessionId: "test_sess", ipHash: "127.0.0.1", createdAt: new Date(now.getTime() - 6*60*60*1000) },
      { unitId, type: "application_submit", sessionId: "test_sess", ipHash: "127.0.0.1", createdAt: now },
      { unitId, type: "lease_signed", sessionId: "test_sess", ipHash: "127.0.0.1", createdAt: now },
    ],
    skipDuplicates: true,
  });
}

export async function closeSeedClient() {
  await prisma.$disconnect();
}