module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    //
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    //
    '@typescript-eslint',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      //
      './tsconfig.json',
    ],
  },
  settings: {
  },
  rules: {
  }
}
