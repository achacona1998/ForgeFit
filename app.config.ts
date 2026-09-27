import { ExpoConfig } from "@expo/config-types";

const config: ExpoConfig = {
  name: "ForgeFit",
  slug: "forgefit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png",
  scheme: "forgefit",
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.achadev.forgefit",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#133875",
      foregroundImage: "./assets/images/padded-icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.achadev.forgefit",
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "forgefit",
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    eas: {
      projectId: "074a5da9-2317-4358-9647-1ef6f94140ad",
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#F4F7F9",
        dark: {
          backgroundColor: "#0A0F14",
        },
      },
    ],
  ],
};

export default config;