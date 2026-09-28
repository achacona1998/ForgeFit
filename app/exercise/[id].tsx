import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import {
  AppCard,
  palette,
  SectionHeader,
  IconButton,
} from "@/components/app/ui";
import { useMemo } from "react";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { database } = useFitness();
  const router = useRouter();

  const exercise = useMemo(() => {
    return database.exercises.find((e) => e.id === id);
  }, [database.exercises, id]);

  const history = useMemo(() => {
    // Find all session exercises that match this exercise ID, and have completed sets
    const sessions = database.sessions.filter((s) => s.status === "completed");
    const result = [];

    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (ex.exerciseId === id) {
          result.push({
            date: session.completedAt || session.scheduledDate,
            sessionName: session.trainingDayName,
            sets: ex.sets.filter((s) => s.completedAt && !s.skipped),
          });
        }
      }
    }

    // Sort descending by date
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [database.sessions, id]);

  if (!exercise) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}>
        <Text style={styles.title}>Ejercicio no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}>
        <IconButton icon="arrow-back" onPress={() => router.back()} />
        <Text
          style={[styles.title, { marginLeft: 12, flex: 1 }]}
          numberOfLines={2}>
          {exercise.name}
        </Text>
      </View>

      <AppCard style={{ marginBottom: 24 }}>
        <Text
          style={{
            color: palette.muted,
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 4,
          }}>
          MÚSCULOS PRINCIPALES
        </Text>
        <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>
          {exercise.directMuscles?.join(", ") ||
            exercise.muscleGroups?.join(", ") ||
            "No especificado"}
        </Text>

        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <>
            <Text
              style={{
                color: palette.muted,
                fontSize: 12,
                fontWeight: "bold",
                marginBottom: 4,
              }}>
              MÚSCULOS SECUNDARIOS
            </Text>
            <Text
              style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>
              {exercise.secondaryMuscles.join(", ")}
            </Text>
          </>
        )}

        <Text
          style={{
            color: palette.muted,
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 4,
          }}>
          EQUIPAMIENTO
        </Text>
        <Text style={{ color: palette.text, fontSize: 16, marginBottom: 12 }}>
          {exercise.equipment || "No especificado"}
        </Text>

        {exercise.aliases && exercise.aliases.length > 0 && (
          <>
            <Text
              style={{
                color: palette.muted,
                fontSize: 12,
                fontWeight: "bold",
                marginBottom: 4,
              }}>
              OTROS NOMBRES
            </Text>
            <Text
              style={{ color: palette.text, fontSize: 14, marginBottom: 12 }}>
              {exercise.aliases.join(", ")}
            </Text>
          </>
        )}
      </AppCard>

      <SectionHeader title="Historial de Entrenamiento" />

      {history.length === 0 ? (
        <Text
          style={{ color: palette.muted, textAlign: "center", marginTop: 24 }}>
          Aún no has registrado este ejercicio en un entrenamiento.
        </Text>
      ) : (
        <View style={{ gap: 12 }}>
          {history.map((entry, idx) => (
            <AppCard key={idx}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                <Text style={{ color: palette.lime, fontWeight: "bold" }}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <Text style={{ color: palette.muted, fontSize: 12 }}>
                  {entry.sessionName}
                </Text>
              </View>

              {entry.sets.map((set, sIdx) => (
                <View
                  key={sIdx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    borderBottomWidth: sIdx < entry.sets.length - 1 ? 1 : 0,
                    borderBottomColor: palette.border,
                  }}>
                  <Text style={{ color: palette.text }}>Serie {set.order}</Text>
                  <Text style={{ color: palette.text, fontWeight: "bold" }}>
                    {set.weight} kg × {set.reps} reps
                  </Text>
                </View>
              ))}
            </AppCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: palette.text,
  },
});
