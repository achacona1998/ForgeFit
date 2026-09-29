import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { useRoute } from "@react-navigation/native";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function SessionDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const session = database.sessions.find(s => s.id === id);

  if (!session) return <View style={styles.screen}><Text style={styles.error}>Sesión no encontrada</Text></View>;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>{session.trainingDayName}</Text>
        <Text style={styles.meta}>{session.routineName} · {formatDate(session.scheduledDate)}</Text>
        <Text style={styles.meta}>Estado: {session.status}</Text>
        {session.exercises.map((ex) => (
          <View key={ex.id} style={styles.exercise}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.exerciseSets}>
              {ex.sets.map((set, i) => (
                <Text key={set.id} style={styles.setText}>
                  Serie {i + 1}: {set.weight} kg × {set.reps} reps
                </Text>
              ))}
            </Text>
          </View>
        ))}
      </AppCard>
    </View>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 24, fontWeight: "900", marginBottom: 4 },
  meta: { color: palette.muted, fontSize: 13, marginBottom: 12 },
  exercise: { padding: 12, backgroundColor: palette.surface, borderRadius: 10, marginBottom: 8 },
  exerciseName: { color: palette.text, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  exerciseSets: { color: palette.muted, fontSize: 13 },
  setText: { marginBottom: 2 },
  error: { color: palette.danger, fontSize: 16, textAlign: "center", marginTop: 40 },
});