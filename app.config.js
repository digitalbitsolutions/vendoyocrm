// app.config.js
module.exports = {
  expo: {
    name: "Vendoyo",
    slug: "vendoyo-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.vendoyo.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#36AAA7"
      },
      package: "com.vendoyo.app"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      // Configuración de entorno para desarrollo
      apiUrl: process.env.API_URL || "https://api.vendoyo.es",
      enableMocks: process.env.ENABLE_MOCKS === 'true' || true,
    }
  }
};
