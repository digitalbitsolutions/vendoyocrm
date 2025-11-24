// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Añadimos extensiones TS/TSX por si acaso y dejamos opciones de transform
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver.sourceExts || []), "cjs", "ts", "tsx"],
};

config.transformer = {
  ...config.transformer,
  // Mantener experimentalImportSupport en false suele evitar warnings de dynamic import
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
