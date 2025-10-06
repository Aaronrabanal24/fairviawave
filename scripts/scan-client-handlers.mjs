#!/usr/bin/env node
import { globby } from 'globby';
import fs from 'node:fs/promises';

const files = await globby(['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'], {
  ignore: ['app/api/**', 'node_modules/**', '.next/**'],
});

const offenders = [];
for (const f of files) {
  const s = await fs.readFile(f, 'utf8');
  const isClient = /^\s*['"]use client['"]/.test(s);
  const hasHandler = /\son[A-Z][a-zA-Z]+\s*=\s*\{/.test(s);
  if (!isClient && hasHandler) offenders.push(f);
}

if (offenders.length) {
  console.error('Possible handler-in-server files:\n' + offenders.map(x => ` - ${x}`).join('\n'));
  process.exit(1);
} else {
  console.log('No obvious handler leaks found.');
}
