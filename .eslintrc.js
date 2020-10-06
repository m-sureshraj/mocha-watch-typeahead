module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  // 0: off, 1: warn, 2: error
  rules: {
    'prettier/prettier': 2,
    'no-console': 0,
    'prefer-template': 2,
    curly: [2, 'multi-line'],
    // https://eslint.org/docs/2.0.0/rules/no-unused-vars
    'no-unused-vars': [2, { args: 'all', argsIgnorePattern: '^_' }],
  },
};
