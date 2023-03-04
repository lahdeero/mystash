// "off" or 0 - turn the rule off
// "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
// "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)

module.exports = {
  'env': {
    'node': true,
    'browser': true,
    'es2021': true,
    'jest': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'plugins': [
    'react'
  ],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-unused-vars': [
      'warn', { 'argsIgnorePattern': '^_' }
    ],
    'react/display-name': 1,
    'react/prop-types': ['off'],
  }
}
