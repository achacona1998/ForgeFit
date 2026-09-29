import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function ProgressScreen() {
  const { hydrated, database, stats } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Progreso</Text>
        <Text style={styles.subtitle}>Datos reales, tendencias claras.</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Sesiones completadas</Text>
            <Text style={styles.metricValue}>{database.sessions.filter(s => s.status === 'completed').length}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Volumen semanal</Text>
            <Text style={styles.metricValue}>{Math.round(stats.weeklyVolume).toLocaleString()} kg</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Tiempo total</Text>
            <Text style={styles.metricValue}>{stats.totalMinutes} min</Text>
          </View>
        </View>
        <Text style={styles.note}>Versión simplificada - funcionalidad completa pendiente</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 28, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: palette.muted, fontSize: 14, marginBottom: 16 },
  metrics: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metric: { flex: 1, alignItems: "center" },
  metricLabel: { color: palette.muted, fontSize: 12, fontWeight: "700", marginBottom: 4 },
  metricValue: { color: palette.text, fontSize: 18, fontWeight: "900" },
  note: { color: palette.muted, fontSize: 13, textAlign: "center" },
});