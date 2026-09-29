// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// WASM support for expo-sqlite web worker
config.resolver.assetExts.push("wasm");

// Allow TypeScript in source files (expo-sqlite web uses .ts)
config.resolver.sourceExts.push("ts", "tsx", "mjs");

// Enable package exports resolution
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./global.css" });