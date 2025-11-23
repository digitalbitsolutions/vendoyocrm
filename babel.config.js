// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // react-native-reanimated debe ir al final de la lista de plugins
      "react-native-reanimated/plugin",
    ],
  };
};
