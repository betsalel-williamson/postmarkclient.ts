import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } }, // Changed to globals.node
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/inspect_schema.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
      sourceType: 'commonjs',
    },
    rules: {
      'no-undef': 'off', // Allow Node.js globals without explicit declaration
      '@typescript-eslint/no-require-imports': 'off', // Allow require in JS files
    },
  },
  {
    ignores: ['dist/**'],
  },
];
