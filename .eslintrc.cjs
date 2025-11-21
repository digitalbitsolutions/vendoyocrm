module.exports = {
    env: {
      browser: true,
      node: true,
      es2021: true,
      'react-native/react-native': true,
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      babelOptions: { presets: ['module:metro-react-native-babel-preset'] },
    },
    plugins: ['react', 'react-native', 'import', 'jsx-a11y'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-native/all',
      'plugin:jsx-a11y/recommended',
      'prettier',
    ],
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/prop-types': 'off',
      'react-native/no-inline-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'import/no-unresolved': 'off'
    },
  };
  