import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { useRoute } from "@react-navigation/native";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const exercise = database.exercises.find(e => e.id === id);

  if (!exercise) return <View style={styles.screen}><Text style={styles.error}>Ejercicio no encontrado</Text></View>;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.category}>{exercise.category || "Sin categoría"}</Text>
        <Text style={styles.muscles}>
          {exercise.directMuscles?.join(", ") || exercise.muscleGroups?.join(", ") || "—"}
        </Text>
        <Text style={styles.equipment}>Equipo: {exercise.equipment || "—"}</Text>
        {exercise.instructions && (
          <Text style={styles.instructions}>{exercise.instructions}</Text>
        )}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 28, fontWeight: "900", marginBottom: 4 },
  category: { color: palette.lime, fontSize: 14, fontWeight: "700", marginBottom: 8 },
  muscles: { color: palette.text, fontSize: 15, marginBottom: 8 },
  equipment: { color: palette.muted, fontSize: 14, marginBottom: 12 },
  instructions: { color: palette.text, fontSize: 14, lineHeight: 22 },
  error: { color: palette.danger, fontSize: 16, textAlign: "center", marginTop: 40 },
});