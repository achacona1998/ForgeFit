import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { openDb, migrate } from "../db";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-provider";

export function BootstrapScreen() {
  const { colors } = useTheme();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Enable immersive mode on Android
    if (Platform.OS === "android") {
      try {
        void NavigationBar.setVisibilityAsync("hidden");
      } catch (err) {
        console.log("Navigation bar error:", err);
      }
    }

    let mounted = true;

    const runMigrations = async () => {
      try {
        console.log("[BootstrapScreen] Starting database initialization...");
        const db = await openDb();
        console.log("[BootstrapScreen] Database initialized, running migrations...");
        await migrate(db);
        console.log("[BootstrapScreen] Migrations completed successfully");
        if (mounted) {
          await SplashScreen.hideAsync();
          router.replace("/(tabs)" as any);
        }
      } catch (e) {
        console.error("[BootstrapScreen] Migration error:", e);
        const errorMessage =
          typeof e === "object" && e !== null
            ? JSON.stringify(e, Object.getOwnPropertyNames(e))
            : String(e);
        const normalizedError =
          e instanceof Error ? e : new Error(errorMessage);
        if (mounted) {
          setError(normalizedError);
          await SplashScreen.hideAsync();
        }
      }
    };

    void runMigrations();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: colors.background,
        }}>
      <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
        Error en la base de datos:
      </Text>
      <Text style={{ color: colors.muted, textAlign: "center" }}>
        {error.message}
      </Text>
      <Text style={{ color: colors.muted, textAlign: "center", marginTop: 10 }}>
        Revisa la consola para más detalles. Reinicia la app.
      </Text>
    </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}>
    <Image
      source={require("@/assets/logo.png")}
      style={{
        width: 120,
        height: 120,
        marginBottom: 32,
      }}
      resizeMode="contain"
    />
    <ActivityIndicator color={colors.primary} size="large" />
    <Text style={{ color: colors.muted, marginTop: 16 }}>
      Inicializando base de datos local...
    </Text>
  </View>
  );
}