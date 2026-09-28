// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// ===== EXPO-SQLITE WEB SUPPORT =====
// 1. WASM as asset (needed for SQLite WASM binary)
config.resolver.assetExts.push("wasm");

// 2. Allow TypeScript in source files (expo-sqlite web uses .ts)
config.resolver.sourceExts.push("ts", "tsx", "mjs");

// 3. Enable package exports resolution
config.resolver.unstable_enablePackageExports = true;

// 4. Add expo-sqlite web directory to watchFolders so Metro can find worker.ts
const expoSqliteWebPath = path.join(__dirname, "node_modules", "expo-sqlite", "web");
config.watchFolders = [
  ...(config.watchFolders || []),
  expoSqliteWebPath,
];

// 5. Transformer config for proper web worker bundling
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// 6. CRITICAL: Configure serializer to include the expo-sqlite web worker
// The worker is loaded dynamically via: new URL('./worker', window.location.href)
// Metro's serializer needs to know about this file to bundle it as a worker chunk
const workerPath = path.join(expoSqliteWebPath, "worker.ts");

const originalGetModulesRunBeforeMainModule = config.serializer?.getModulesRunBeforeMainModule;
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [
    ...(originalGetModulesRunBeforeMainModule ? originalGetModulesRunBeforeMainModule() : []),
    workerPath,
  ],
};

// 7. Also ensure the worker is treated as an async module (worker)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let expo-sqlite handle its own platform resolution through package exports
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });