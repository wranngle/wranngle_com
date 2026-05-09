import type {FlatXoConfig} from 'xo';

const sharedRulesOff = {
  'unicorn/filename-case': 'off',
  'import/extensions': 'off',
  'import-x/extensions': 'off',
  'capitalized-comments': 'off',
  '@typescript-eslint/naming-convention': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  'no-await-in-loop': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/prefer-query-selector': 'off',
  'unicorn/prefer-dom-node-text-content': 'off',
  'unicorn/prefer-top-level-await': 'off',
  'unicorn/explicit-length-check': 'off',
  'promise/prefer-await-to-then': 'off',
  radix: 'off',
  'no-undef': 'off',
} as const;

const config: FlatXoConfig = [
  {
    ignores: [
      'dist/**',
      'client/dist/**',
      'email-templates/build/**',
      'email-templates/sms/build/**',
      'postcss.config.ts',
      'tailwind.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
  {
    prettier: true,
    space: 2,
    rules: sharedRulesOff,
  },
  {
    files: ['scripts/**/*.ts', 'script/**/*.ts'],
    rules: {
      'unicorn/no-process-exit': 'off',
      'n/prefer-global/process': 'off',
      'n/prefer-global/buffer': 'off',
      'unicorn/prefer-module': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      'no-template-curly-in-string': 'off',
      'unicorn/prefer-single-call': 'off',
      'import-x/no-unassigned-import': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'unicorn/no-process-exit': 'off',
      'n/prefer-global/process': 'off',
      'n/prefer-global/buffer': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'no-template-curly-in-string': 'off',
    },
  },
];

export default config;
