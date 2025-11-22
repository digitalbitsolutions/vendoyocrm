// eslint.config.cjs
/**
 * ESLint flat config (v9+) — "pro" migration.
 * Este archivo carga las recomendaciones públicas de los plugins y
 * luego aplica tus reglas/overrides. Si falta algún plugin, npm te lo dirá.
 */

const babelParser = require("@babel/eslint-parser");

// cargar plugins (si no están instalados, npm dirá qué falta)
const pluginReact = require("eslint-plugin-react");
const pluginReactNative = require("eslint-plugin-react-native");
const pluginJsxA11y = require("eslint-plugin-jsx-a11y");
const pluginImport = require("eslint-plugin-import");

// Helpers para obtener reglas recomendadas si existen
const reactRecommended =
  (pluginReact.configs &&
    pluginReact.configs.recommended &&
    pluginReact.configs.recommended.rules) ||
  {};
const reactNativeRecommended =
  (pluginReactNative.configs &&
    pluginReactNative.configs.recommended &&
    pluginReactNative.configs.recommended.rules) ||
  {};
const jsxA11yRecommended =
  (pluginJsxA11y.configs &&
    pluginJsxA11y.configs.recommended &&
    pluginJsxA11y.configs.recommended.rules) ||
  {};

module.exports = [
  // Ignorar carpetas comunes
  {
    ignores: ["node_modules/**", "build/**", "dist/**", ".expo/**"],
  },

  // Reglas/globales para JS/JSX
  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        babelOptions: { presets: ["babel-preset-expo"] },
      },
      globals: {
        __DEV__: "readonly",
      },
    },

    // registrar plugins
    plugins: {
      react: pluginReact,
      "react-native": pluginReactNative,
      "jsx-a11y": pluginJsxA11y,
      import: pluginImport,
    },

    // settings (ej. react version detect)
    settings: {
      react: { version: "detect" },
    },

    // combinamos las reglas recomendadas de los plugins + tus overrides
    rules: {
      // reglas recomendadas de los plugins (si existen)
      ...reactRecommended,
      ...reactNativeRecommended,
      ...jsxA11yRecommended,

      // tus overrides (mantener tus preferencias)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/prop-types": "off",
      "react-native/no-inline-styles": "warn",
      "react-native/split-platform-components": "warn",
      "import/no-unresolved": "off",

      // evitar el error clásico en proyectos con JSX automático (React 17+)
      "react/react-in-jsx-scope": "off",

      // si quieres añadir más reglas "pro" aquí, se añaden abajo
    },
  },
];
