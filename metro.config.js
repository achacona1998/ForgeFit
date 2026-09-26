const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Permitir importar archivos .sql para las migraciones de Drizzle
config.resolver.sourceExts.push("sql");

// Agregar soporte para WebAssembly (wasm) necesario para expo-sqlite en web
config.resolver.assetExts.push("wasm");

// Set required headers for SQLite WebAssembly SharedArrayBuffer
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
});
