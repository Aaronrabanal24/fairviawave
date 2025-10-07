import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const STAGES = [
  "view_trust",
  "precheck_start",
  "precheck_submit",
  "tour_request",
  "application_open",
  "application_submit",
  "lease_open",
  "lease_signed",
] as const;

async function main() {
  // Ensure a dev unit exists
  await prisma.unit.upsert({
    where: { id: "dev-unit-1" },
    update: {},
    create: {
      id: "dev-unit-1",
      name: "Dev Unit One",
      status: "published",
      publishedAt: new Date(),
    },
  });

  // Clear old signals for a clean run
  await prisma.signal.deleteMany({ where: { unitId: "dev-unit-1" } });

  // Insert a small, recent sample set across all stages
  const now = Date.now();
  const recent = (mins: number) => new Date(now - mins * 60_000);

  await prisma.signal.createMany({
    data: [
      { unitId: "dev-unit-1", type: "view_trust", createdAt: recent(5), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "view_trust", createdAt: recent(15), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "precheck_start", createdAt: recent(20), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "precheck_submit", createdAt: recent(25), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "tour_request", createdAt: recent(30), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "application_open", createdAt: recent(40), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "application_submit", createdAt: recent(50), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "lease_open", createdAt: recent(60), sessionId: "seed-session", ipHash: "seed-ip-hash" },
      { unitId: "dev-unit-1", type: "lease_signed", createdAt: recent(70), sessionId: "seed-session", ipHash: "seed-ip-hash" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
