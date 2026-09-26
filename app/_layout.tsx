import { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FitnessProvider } from "@/context/fitness-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { initializeDbAsync, getDb } from "../drizzle/client";
import migrations from "../drizzle/migrations/migrations";
import { Text, View, Platform } from "react-native";

export default function RootLayout() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Enable immersive mode on Android
    if (Platform.OS === "android") {
      Promise.all([
        NavigationBar.setPositionAsync("absolute"),
        NavigationBar.setVisibilityAsync("hidden"),
        NavigationBar.setBehaviorAsync("overlay-swipe")
      ]).catch(err => console.log("Navigation bar error:", err));
    }

    if (
      Platform.OS === "web" &&
      navigator.storage &&
      navigator.storage.persist
    ) {
      navigator.storage.persist().then((persistent) => {
        if (persistent)
          console.log(
            "Storage will not be cleared except by explicit user action",
          );
        else
          console.log(
            "Storage may be cleared by the UA under storage pressure.",
          );
      }).catch(err => console.log("Storage persist error:", err));
    }

    // Run migrations asynchronously to avoid blocking the main thread on web
    const runMigrations = async () => {
      try {
        await initializeDbAsync();
        const db = getDb();
        await migrate(db, migrations);
        setSuccess(true);
      } catch (e) {
        console.error("Migration error:", e);
        const errorMessage = typeof e === 'object' && e !== null ? JSON.stringify(e, Object.getOwnPropertyNames(e)) : String(e);
        setError(e instanceof Error ? e : new Error(errorMessage));
      }
    };

    void runMigrations();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error en la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Inicializando base de datos local...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FitnessProvider>
          <StatusBar style="light" hidden={true} />
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="workout/[id]"
              options={{ presentation: "card", animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="exercise/[id]"
              options={{ presentation: "card", animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="session/[id]"
              options={{ presentation: "card", animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="routine-builder"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="measurements"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="records"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="calendar"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
        </FitnessProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
