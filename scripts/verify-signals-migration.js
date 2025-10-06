// Node.js script to verify signals table migration and test API endpoints
// Usage: node scripts/verify-signals-migration.js

const { Pool } = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const UNIT_ID = process.env.TEST_UNIT_ID || 'YOUR_UNIT_ID';

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMigration() {
  console.log('Checking signals table and indexes...');
  const tableRes = await pool.query(`SELECT * FROM information_schema.tables WHERE table_name = 'signals'`);
  if (tableRes.rows.length === 0) throw new Error('signals table not found');

  const indexRes = await pool.query(`SELECT indexname FROM pg_indexes WHERE tablename = 'signals'`);
  console.log('Indexes:', indexRes.rows.map(r => r.indexname));

  const rlsRes = await pool.query(`SELECT relrowsecurity FROM pg_class WHERE relname = 'signals'`);
  if (!rlsRes.rows[0] || !rlsRes.rows[0].relrowsecurity) throw new Error('RLS not enabled');
  console.log('RLS enabled:', rlsRes.rows[0].relrowsecurity);

  console.log('Migration verification complete.');
}

async function testSignalAPI() {
  console.log('Testing POST /api/signals...');
  const postRes = await fetch(`${API_BASE_URL}/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      unitId: UNIT_ID,
      type: 'view_trust',
      sessionId: 'test-session-123',
      userId: 'user-abc',
      metadata: { source: 'direct', deviceType: 'desktop' }
    })
  });
  const postText = await postRes.text();
  console.log('Raw POST response:', postText);
  let postJson;
  try { postJson = JSON.parse(postText); } catch (e) { postJson = postText; }
  console.log('POST response:', postJson);

  console.log('Testing GET /api/signals...');
  const getRes = await fetch(`${API_BASE_URL}/signals?unitId=${UNIT_ID}&timeframe=7d`);
  const getText = await getRes.text();
  console.log('Raw GET response:', getText);
  let getJson;
  try { getJson = JSON.parse(getText); } catch (e) { getJson = getText; }
  console.log('GET response:', getJson);
}

async function main() {
  try {
    await verifyMigration();
    await testSignalAPI();
  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await pool.end();
  }
}

main();
