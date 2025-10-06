/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals'],
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'playwright-report/**',
    'test-results/**',
    'coverage/**',
    '*.generated.js'
  ],
  rules: {
    // Import optimization rules
    'import/no-namespace': 'error',
    'no-restricted-imports': ['error', {
      paths: [
        { 
          name: '@/lib/db', 
          message: 'Server-only. Import from server components or API routes.' 
        },
        { 
          name: '@/lib/prisma', 
          message: 'Server-only. Import from server components or API routes.' 
        },
        { 
          name: '@/lib/rateLimit', 
          message: 'Server-only. Guard at API boundary.' 
        },
      ],
      patterns: [
        { 
          group: ['@/components/**/index'], 
          message: 'Avoid large barrels in client; import leaf files.' 
        },
        { 
          group: [
            '**/*copy*', 
            '**/*-copy.*', 
            '**/*.bak', 
            '**/*.backup.*', 
            '**/*.orig', 
            '**/*.old.*',
            '**/*_backup*'
          ], 
          message: 'No backup files allowed.' 
        }
      ]
    }],
    // React optimization rules
    'react/no-unescaped-entities': 'error',
    'react/jsx-no-leaked-render': 'error',
    // Performance rules
    '@next/next/no-img-element': 'error',
    '@next/next/no-css-tags': 'error'
  },
  overrides: [
    {
      // Allow server-only imports in API routes, server components, and lib modules
      files: [
        'app/api/**/*',
        'lib/**/*',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx'
      ],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { 
              group: ['@/components/**/index'], 
              message: 'Avoid large barrels in client; import leaf files.' 
            },
            { 
              group: [
                '**/*copy*', 
                '**/*-copy.*', 
                '**/*.bak', 
                '**/*.backup.*', 
                '**/*.orig', 
                '**/*.old.*',
                '**/*_backup*'
              ], 
              message: 'No backup files allowed.' 
            }
          ]
        }]
      }
    }
  ]
};