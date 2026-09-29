import { View, Text, StyleSheet, Switch } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, PrimaryButton, palette, SectionHeader } from "@/components/app/ui";

export default function SettingsScreen() {
  const { hydrated, database, updateSettings, resetDatabase } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const toggleTheme = () => updateSettings({ theme: database.settings.theme === "dark" ? "light" : "dark" });

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <SectionHeader title="Apariencia" />
        <View style={styles.row}>
          <Text style={styles.label}>Tema oscuro</Text>
          <Switch
            value={database.settings.theme === "dark"}
            onValueChange={toggleTheme}
            thumbColor={palette.lime}
            trackColor={{ true: palette.limeSoft, false: palette.border }}
          />
        </View>
      </AppCard>

      <AppCard style={{ margin: 16 }}>
        <SectionHeader title="Datos" />
        <PrimaryButton
          label="Cargar datos de ejemplo"
          icon="download"
          variant="blue"
          onPress={() => alert("Función pendiente")}
        />
        <PrimaryButton
          label="Restablecer todo"
          icon="trash"
          variant="danger"
          onPress={() => alert("Función pendiente")}
        />
      </AppCard>

      <AppCard style={{ margin: 16 }}>
        <SectionHeader title="Sobre la app" />
        <Text style={styles.info}>ForgeFit v1.0.0</Text>
        <Text style={styles.info}>Privacidad local por diseño</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: palette.text, fontSize: 15, fontWeight: "600" },
  info: { color: palette.muted, fontSize: 14, marginTop: 8 },
  note: { color: palette.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
});