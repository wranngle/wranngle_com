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
    // tileTracers.ts is a faithful port of a WebGL shader prototype. Its
    // class groups private render helpers ahead of the public API and uses
    // an explicit field assignment in the constructor — both flagged by
    // purely-cosmetic ordering rules that fight the ported structure.
    files: ['client/src/components/tileTracers.ts'],
    rules: {
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/parameter-properties': 'off',
    },
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
    // Generator scripts (.mjs) are dev-time one-shots — exempt from the
    // stricter unicorn/prettier rules that don't earn their bytes here.
    files: ['script/generators/**/*.mjs'],
    rules: {
      'unicorn/no-process-exit': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/better-regex': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/no-array-for-each': 'off',
      'n/prefer-global/buffer': 'off',
      'n/no-extraneous-import': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-absolute-path': 'off',
      'promise/param-names': 'off',
      'no-promise-executor-return': 'off',
      'no-unused-vars': 'off',
      '@stylistic/padding-line-between-statements': 'off',
      'prettier/prettier': 'off',
      'max-lines': 'off',
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
