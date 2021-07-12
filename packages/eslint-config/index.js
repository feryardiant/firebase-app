module.exports = {
  extends: ['standard', 'prettier'],
  plugins: ['prettier'],
  ignorePatterns: [
    'dist/**',
    'node_modules/',
    'tests/**',
    '**.old',
    '**.cjs',
    '**.mjs'
  ],
  rules: {
    'prettier/prettier': ['error'],
    'no-unused-vars': 0,
    'one-var': 0
  }
}
