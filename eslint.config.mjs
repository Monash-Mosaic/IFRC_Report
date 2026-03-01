import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    'node_modules/**',
    '.open-next/**',
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'public/**',
    'cloudflare-env.d.ts',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
