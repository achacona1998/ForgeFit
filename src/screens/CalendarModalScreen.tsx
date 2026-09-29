import { View, Text, StyleSheet } from "react-native";
import { LoadingScreen, AppCard, palette, PrimaryButton } from "@/components/app/ui";

export default function CalendarModalScreen() {
  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>Selecciona una fecha.</Text>
        <PrimaryButton
          label="Cerrar"
          icon="x"
          variant="ghost"
          onPress={() => alert("Cerrar modal")}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16, justifyContent: "center" },
  title: { color: palette.text, fontSize: 24, fontWeight: "900", marginBottom: 4, textAlign: "center" },
  subtitle: { color: palette.muted, fontSize: 14, marginBottom: 16, textAlign: "center" },
});