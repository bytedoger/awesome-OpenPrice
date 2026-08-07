import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const legacyWarningRules = new Set([
  '@typescript-eslint/ban-ts-comment',
  '@typescript-eslint/no-empty-object-type',
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/no-require-imports',
  'prefer-const',
  'react/no-unescaped-entities',
  'react-hooks/purity',
  'react-hooks/set-state-in-effect',
]);

function downgradeLegacyErrors(configs) {
  return configs.map(config => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules || {}).map(([rule, setting]) => [
        rule,
        legacyWarningRules.has(rule) ? 'warn' : setting,
      ]),
    ),
  }));
}

export default defineConfig([
  // Keep legacy findings visible without making the Next 16 lint migration block builds.
  ...downgradeLegacyErrors(nextVitals),
  ...downgradeLegacyErrors(nextTypeScript),
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'scraper/venv/**',
    'next-env.d.ts',
  ]),
]);
