import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function PRsScreen() {
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Records Personales</Text>
        <Text style={styles.subtitle}>Tus mejores marcas detectadas automáticamente.</Text>
        {database.records.length > 0 ? (
          database.records.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.recordItem}>
              <Text style={styles.recordName}>{r.exerciseName}</Text>
              <Text style={styles.recordDetail}>
                {r.weight} kg × {r.reps} reps
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No hay PRs aún. ¡Entrena para verlos aquí!</Text>
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
  recordItem: { padding: 12, backgroundColor: palette.surface, borderRadius: 12, marginBottom: 8 },
  recordName: { color: palette.text, fontSize: 16, fontWeight: "800" },
  recordDetail: { color: palette.muted, fontSize: 13, marginTop: 2 },
  empty: { color: palette.muted, fontSize: 16, marginTop: 16, textAlign: "center" },
  note: { color: palette.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
});