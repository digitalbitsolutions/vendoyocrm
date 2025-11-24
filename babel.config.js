// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // preset recomendado para proyectos Expo
      "babel-preset-expo",
    ],
    plugins: [
      // transforma las llamadas de expo-router (require.context) correctamente
      "expo-router/babel",

      // permite parsear "export type { ... }" / Flow en node_modules (ej: gesture-handler)
      "@babel/plugin-syntax-flow",

      // plugin recomendado para react-native-reanimated (si lo usas)
      "react-native-reanimated/plugin",
    ],
  };
};
