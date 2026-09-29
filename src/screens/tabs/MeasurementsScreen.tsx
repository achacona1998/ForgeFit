import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function MeasurementsScreen() {
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Medidas Corporales</Text>
        <Text style={styles.subtitle}>Registra y visualiza tu evolución física.</Text>
        {database.measurements.length > 0 ? (
          <View style={styles.latest}>
            <Text style={styles.latestLabel}>Última medición</Text>
            <Text style={styles.latestValue}>
              {database.measurements[database.measurements.length - 1]?.weight?.toFixed(1) ?? "—"} kg
            </Text>
          </View>
        ) : (
          <Text style={styles.empty}>No hay mediciones aún</Text>
        )}
        <Text style={styles.note}>Versión simplificada</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 28, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: palette.muted, fontSize: 14, marginBottom: 16 },
  latest: { marginTop: 16, padding: 16, backgroundColor: palette.surfaceAlt, borderRadius: 12 },
  latestLabel: { color: palette.muted, fontSize: 12, fontWeight: "700", marginBottom: 4 },
  latestValue: { color: palette.text, fontSize: 24, fontWeight: "900" },
  empty: { color: palette.muted, fontSize: 16, marginTop: 16, textAlign: "center" },
  note: { color: palette.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
});