import { View, Text, StyleSheet } from "react-native";
import { AppCard, palette } from "@/components/app/ui";

export default function OAuthCallbackScreen() {
  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Autenticación</Text>
        <Text style={styles.subtitle}>Procesando callback...</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16, justifyContent: "center" },
  title: { color: palette.text, fontSize: 24, fontWeight: "900", marginBottom: 4, textAlign: "center" },
  subtitle: { color: palette.muted, fontSize: 14, textAlign: "center" },
});