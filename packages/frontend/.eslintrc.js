module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    indent: ['warn', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'linebreak-style': ['error', 'unix'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
}
