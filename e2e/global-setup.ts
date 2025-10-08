import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: '.env.test' });

  // Make sure PUBLIC_UNIT_ID is set
  const publicUnitId = process.env.PUBLIC_UNIT_ID || 'dev-unit-1';
  process.env.PUBLIC_UNIT_ID = publicUnitId;

  const prisma = new PrismaClient();

  try {
    // Clean existing test data
    await prisma.event.deleteMany({
      where: {
        unitId: publicUnitId
      }
    });
    await prisma.unit.deleteMany({
      where: {
        id: publicUnitId
      }
    });

    // Create test data
    await prisma.unit.create({
      data: {
        id: publicUnitId,
        name: 'Test Unit',
        description: 'A test unit for e2e testing',
        status: 'published',
        publishedAt: new Date(),
        events: {
          create: [
            {
              type: 'status_change',
              content: 'Unit published',
              visibility: 'public',
              contentHash: 'hash1',
              chainHash: 'chain1',
              ts: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
              metadata: {
                user: {
                  email: 'test@example.com', // Should be filtered out
                  name: 'Test User'  // Should be filtered out
                },
                status: 'approved'  // Should be kept
              }
            },
            {
              type: 'verification',
              content: 'Unit verified',
              visibility: 'public',
              contentHash: 'hash2',
              chainHash: 'chain2',
              ts: new Date(),
              createdAt: new Date(),
              metadata: {
                user: {
                  email: 'verifier@example.com', // Should be filtered out
                  name: 'Verifier'  // Should be filtered out
                },
                verification: {
                  method: 'manual',  // Should be kept
                  result: 'passed'  // Should be kept
                }
              }
            }
          ]
        }
      }
    });

    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;