import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { useRoute } from "@react-navigation/native";
import { LoadingScreen, AppCard, palette, PrimaryButton } from "@/components/app/ui";

export default function WorkoutDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { hydrated, database, finishWorkout, updateWorkoutSet } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const session = database.sessions.find(s => s.id === id);

  if (!session) return <View style={styles.screen}><Text style={styles.error}>Sesión no encontrada</Text></View>;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>{session.trainingDayName}</Text>
        <Text style={styles.meta}>{session.exercises.length} ejercicios · {session.status}</Text>
        {session.exercises.map((ex) => (
          <View key={ex.id} style={styles.exercise}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.exerciseTarget}>
              {ex.sets} series × {ex.repRangeMin}–{ex.repRangeMax} reps
            </Text>
          </View>
        ))}
        {session.status !== "completed" && (
          <PrimaryButton
            label="Finalizar entrenamiento"
            icon="check"
            onPress={() => finishWorkout(id)}
            style={{ marginTop: 16 }}
          />
        )}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 24, fontWeight: "900", marginBottom: 4 },
  meta: { color: palette.muted, fontSize: 13, marginBottom: 16 },
  exercise: { padding: 12, backgroundColor: palette.surface, borderRadius: 10, marginBottom: 8 },
  exerciseName: { color: palette.text, fontSize: 16, fontWeight: "800" },
  exerciseTarget: { color: palette.muted, fontSize: 13, marginTop: 2 },
  error: { color: palette.danger, fontSize: 16, textAlign: "center", marginTop: 40 },
});