#!/usr/bin/env node
/**
 * Verification script for the Vitest testing setup
 * Checks that all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Vitest config exists',
    path: './vitest.config.ts',
    test: (content) => content.includes('jsdom') && content.includes('test/setup.ts')
  },
  {
    name: 'Test setup file exists',
    path: './test/setup.ts',
    test: (content) => content.includes('TextEncoder') && content.includes('matchMedia')
  },
  {
    name: 'Next.js navigation mock exists',
    path: './__mocks__/next/navigation.ts',
    test: (content) => content.includes('useRouter') && content.includes('usePathname')
  },
  {
    name: 'Next.js link mock exists',
    path: './__mocks__/next/link.tsx',
    test: (content) => content.includes('Link')
  },
  {
    name: 'Next.js headers mock exists',
    path: './__mocks__/next/headers.ts',
    test: (content) => content.includes('cookies') && content.includes('headers')
  },
  {
    name: 'Supabase client mock exists',
    path: './__mocks__/@/lib/supabase/client.ts',
    test: (content) => content.includes('createSupabaseClient') && content.includes('auth')
  },
  {
    name: 'Prisma client mock exists',
    path: './__mocks__/@prisma/client.ts',
    test: (content) => content.includes('PrismaClient') && content.includes('unit')
  },
  {
    name: 'Client mocks test exists',
    path: './tests/client-mocks.test.tsx',
    test: (content) => content.includes('Client Component Testing Setup')
  },
  {
    name: 'Testing documentation exists',
    path: './TESTING.md',
    test: (content) => content.includes('Testing Guide') && content.includes('Vitest')
  },
  {
    name: 'Package.json has test scripts',
    path: './package.json',
    test: (content) => {
      const pkg = JSON.parse(content);
      return pkg.scripts.test && pkg.scripts['test:ui'] && pkg.scripts['test:unit'];
    }
  },
  {
    name: 'Required dependencies installed',
    path: './package.json',
    test: (content) => {
      const pkg = JSON.parse(content);
      return pkg.devDependencies['@testing-library/react'] &&
             pkg.devDependencies['@testing-library/jest-dom'] &&
             pkg.devDependencies['undici'] &&
             pkg.devDependencies['jsdom'];
    }
  }
];

console.log('\n🧪 Verifying Vitest Test Setup\n');

let passed = 0;
let failed = 0;

checks.forEach((check) => {
  try {
    const filePath = path.join(process.cwd(), check.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${check.name}: File not found`);
      failed++;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (check.test(content)) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}: Content validation failed`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name}: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed}/${checks.length} checks passed`);

if (failed === 0) {
  console.log('\n✨ All checks passed! Test setup is complete and ready to use.\n');
  console.log('Run the following commands to get started:');
  console.log('  npm test          # Run all tests');
  console.log('  npm run test:ui   # Interactive test mode');
  console.log('  npm run test:unit # Run only unit tests\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} check(s) failed. Please review the output above.\n`);
  process.exit(1);
}
