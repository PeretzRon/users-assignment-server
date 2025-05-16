module.exports = {
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    extraFileExtensions: ['.json', '.yml', '.yaml'],
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'perfectionist', 'no-loops', 'function-name'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'airbnb-base',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'implicit-arrow-linebreak': 'off',
    'max-len': ['error', { code: 120 }],
    indent: ['error', 2, { ignoredNodes: ['PropertyDefinition'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'linebreak-style': ['error', 'windows'],
    'class-methods-use-this': 'off',
    'no-useless-constructor': 0,
    'no-empty-function': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-nested-ternary': 'error',
    'max-params': ['warn', 4],
    complexity: ['warn', 6],
    'no-confusing-arrow': [
      'error',
      {
        allowParens: true,
        onlyOneSimpleParam: false,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'line-length',
        order: 'asc',
        groups: [['builtin', 'external'], 'internal'],
        'newlines-between': 'always',
      },
    ],
  },
};
