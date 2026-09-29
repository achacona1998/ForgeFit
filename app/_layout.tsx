import React from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FitnessProvider } from "@/context/fitness-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { BootstrapScreen } from "./bootstrap";

// Error Boundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}>
          <Text style={{ fontSize: 18, color: "red" }}>
            Error en la aplicación: {this.state.error?.message}
          </Text>
          <Text style={{ marginTop: 10, color: "gray" }}>
            Reinicia la app para intentar de nuevo.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <FitnessProvider>
            <StatusBar style="light" hidden={true} />
            <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
              <Stack.Screen name="bootstrap" options={{ presentation: "card" }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="workout/[id]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="exercise/[id]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="session/[id]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
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
    </ErrorBoundary>
  );
}