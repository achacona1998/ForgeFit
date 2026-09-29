import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function CalendarScreen() {
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const completed = database.sessions.filter(s => s.status === 'completed');

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>Visualiza tu consistencia.</Text>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completed.length}</Text>
          <Text style={styles.statLabel}>Sesiones completadas</Text>
        </View>
        <Text style={styles.note}>Versión simplificada - Heatmap pendiente</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 28, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: palette.muted, fontSize: 14, marginBottom: 16 },
  stat: { padding: 20, backgroundColor: palette.surface, borderRadius: 12, alignItems: "center" },
  statValue: { color: palette.lime, fontSize: 48, fontWeight: "900" },
  statLabel: { color: palette.muted, fontSize: 13, marginTop: 4 },
  note: { color: palette.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
});