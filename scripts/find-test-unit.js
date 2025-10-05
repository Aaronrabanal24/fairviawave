#!/usr/bin/env node
/**
 * Find a published unit for E2E testing
 * Usage: node scripts/find-test-unit.js
 */

const baseUrl = process.argv[2] || 'https://fairviawave.vercel.app';

async function findTestUnit() {
  try {
    const response = await fetch(`${baseUrl}/api/metrics/summary`);
    const data = await response.json();

    console.log('\n📊 Metrics Summary:');
    console.log(`   Total units: ${data.total_units}`);
    console.log(`   Published units: ${data.published_units}`);
    console.log(`   Most active unit: ${data.most_active_unit_id}`);

    if (data.most_active_unit_id) {
      console.log('\n✅ Found test unit candidate:');
      console.log(`   Unit ID: ${data.most_active_unit_id}`);
      console.log('\n💡 To use this for E2E tests, you need:');
      console.log('   1. The unit ID (shown above)');
      console.log('   2. The publishedToken from your database');
      console.log('\n   Query your database with:');
      console.log(`   SELECT "publishedToken" FROM units WHERE id = '${data.most_active_unit_id}';`);
    } else {
      console.log('\n⚠️  No published units found. Create one first.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

findTestUnit();
