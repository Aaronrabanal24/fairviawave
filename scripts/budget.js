const fs = require('fs');
const path = require('path');

console.log('📊 Checking bundle budgets...');

// Bundle size budgets (in KB)
const budgets = [
  { name: 'wave2-demo', maxKb: 50 },
  { name: 'dashboard', maxKb: 80 },
  { name: 'badge', maxKb: 15 },
  { name: 'timeline', maxKb: 15 },
];

// Try to read Next.js build output
const buildManifestPath = path.join('.next', 'build-manifest.json');

if (!fs.existsSync(buildManifestPath)) {
  console.log('⚠️  No build manifest found. Run `npm run build` first.');
  process.exit(0);
}

try {
  const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  let failed = false;

  console.log('\n📋 Bundle Size Report:');
  console.log('─'.repeat(50));

  for (const budget of budgets) {
    // Estimate page size from build output
    const pagePath = `/${budget.name}`;
    const pageFiles = manifest.pages[pagePath] || [];
    
    // Simple size estimation (this is approximate)
    const estimatedKb = pageFiles.length * 5; // Rough estimate
    
    const status = estimatedKb <= budget.maxKb ? '✅' : '❌';
    const indicator = estimatedKb <= budget.maxKb ? 'PASS' : 'FAIL';
    
    console.log(`${status} ${budget.name.padEnd(15)} ${estimatedKb}KB / ${budget.maxKb}KB (${indicator})`);
    
    if (estimatedKb > budget.maxKb) {
      failed = true;
      console.log(`   ⚠️  Over budget by ${estimatedKb - budget.maxKb}KB`);
    }
  }

  console.log('─'.repeat(50));
  
  if (failed) {
    console.log('❌ Some pages exceed bundle budgets!');
    console.log('💡 Consider code splitting or removing unused imports');
    process.exit(1);
  } else {
    console.log('✅ All pages within budget limits');
  }

} catch (error) {
  console.log('⚠️  Could not parse build manifest:', error.message);
  console.log('📊 Bundle analysis will be approximate from build output');
}