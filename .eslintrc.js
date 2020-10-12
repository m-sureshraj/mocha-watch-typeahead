module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',

    // uses the recommended rules from the `@typescript-eslint/eslint-plugin`
    'plugin:@typescript-eslint/recommended',

    // Uses `eslint-config-prettier` to disable ESLint rules from
    // `@typescript-eslint/eslint-plugin` that would conflict with prettier
    'prettier/@typescript-eslint',

    'plugin:prettier/recommended',
  ],

  // 0: off, 1: warn, 2: error
  rules: {
    'no-console': 0,
    'prefer-template': 2,
    curly: [2, 'multi-line'],

    // https://eslint.org/docs/2.0.0/rules/no-unused-vars
    'no-unused-vars': [2, { args: 'all', argsIgnorePattern: '^_' }],
  },
};
