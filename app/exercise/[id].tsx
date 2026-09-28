import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import {
  AppCard,
  palette,
  SectionHeader,
  IconButton,
  LineChart,
  PeriodSelector,
} from "@/components/app/ui";
import { useMemo, useState } from "react";

type ChartMetric = "weight" | "reps" | "volume" | "rir";
type Period = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { database } = useFitness();
  const router = useRouter();
  const [metric, setMetric] = useState<ChartMetric>("weight");
  const [period, setPeriod] = useState<Period>("30d");

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

  const chartData = useMemo(() => {
    const cutoff = new Date();
    if (period === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (period === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (period === "3m") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (period === "6m") cutoff.setMonth(cutoff.getMonth() - 6);
    else if (period === "1y") cutoff.setFullYear(cutoff.getFullYear() - 1);
    else cutoff.setFullYear(2000); // all

    const filtered = history.filter((h) => new Date(h.date) >= cutoff);
    // Reverse to chronological order for the chart
    const chronological = [...filtered].reverse();

    const labels: string[] = [];
    const values: number[] = [];

    chronological.forEach((entry) => {
      labels.push(
        new Intl.DateTimeFormat("es-ES", {
          day: "numeric",
          month: "short",
        }).format(new Date(entry.date)),
      );
      let val = 0;
      if (metric === "weight") {
        val = Math.max(...entry.sets.map((s) => s.weight));
      } else if (metric === "reps") {
        val = Math.max(...entry.sets.map((s) => s.reps));
      } else if (metric === "volume") {
        val = entry.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
      } else if (metric === "rir") {
        const rirs = entry.sets.map((s) => s.rir ?? 0);
        val = rirs.length ? rirs.reduce((a, b) => a + b, 0) / rirs.length : 0;
      }
      values.push(val);
    });

    return { labels, values };
  }, [history, period, metric]);

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

      <SectionHeader title="Rendimiento" />
      <AppCard style={{ marginBottom: 24 }}>
        <PeriodSelector period={period} onChange={setPeriod} />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {(["weight", "reps", "volume", "rir"] as ChartMetric[]).map((m) => (
            <Text
              key={m}
              onPress={() => setMetric(m)}
              style={{
                color: metric === m ? palette.lime : palette.muted,
                fontWeight: "bold",
                fontSize: 12,
                textTransform: "uppercase",
                paddingVertical: 4,
                paddingHorizontal: 8,
                backgroundColor:
                  metric === m ? palette.limeSoft : "transparent",
                borderRadius: 8,
                overflow: "hidden",
              }}>
              {m === "weight"
                ? "Peso Max"
                : m === "reps"
                  ? "Reps Max"
                  : m === "volume"
                    ? "Volumen"
                    : "RIR Prom"}
            </Text>
          ))}
        </View>

        {chartData.values.length > 0 ? (
          <LineChart values={chartData.values} labels={chartData.labels} />
        ) : (
          <Text
            style={{
              color: palette.muted,
              textAlign: "center",
              paddingVertical: 24,
            }}>
            No hay datos para el período seleccionado.
          </Text>
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
