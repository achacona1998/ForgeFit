import { useMemo } from "react";
import { View, Text, FlatList, ScrollView, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { AppCard, palette } from "@/components/app/ui";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function PrsScreen() {
  const { database } = useFitness();

  const prsByExercise = useMemo(() => {
    const groups: Record<string, typeof database.records> = {};
    database.records.forEach((pr) => {
      if (!groups[pr.exerciseName]) groups[pr.exerciseName] = [];
      groups[pr.exerciseName].push(pr);
    });

    // Sort each group by date descending
    Object.values(groups).forEach((group) => {
      group.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [database.records]);

  if (database.records.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}>
        <MaterialIcons name="emoji-events" size={64} color={palette.muted} />
        <Text style={[styles.title, { marginTop: 16, color: palette.muted }]}>
          Sin Récords Aún
        </Text>
        <Text style={[styles.subtitle, { textAlign: "center", marginTop: 8 }]}>
          Completa entrenamientos para registrar tus primeros PRs.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.title, { marginBottom: 16 }]}>
        Récords Personales
      </Text>

      {prsByExercise.map(([exerciseName, records]) => (
        <View key={exerciseName} style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: palette.lime,
              fontSize: 16,
              fontWeight: "900",
              marginBottom: 8,
              paddingLeft: 4,
            }}>
            {exerciseName.toUpperCase()}
          </Text>
          <View style={{ gap: 8 }}>
            {records.map((pr) => (
              <AppCard key={pr.id}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <View>
                    <Text
                      style={{
                        color: palette.text,
                        fontSize: 18,
                        fontWeight: "bold",
                      }}>
                      {pr.weight} kg × {pr.reps} reps
                    </Text>
                    <Text
                      style={{
                        color: palette.muted,
                        fontSize: 12,
                        marginTop: 2,
                      }}>
                      {new Date(pr.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: palette.surfaceAlt,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}>
                    <Text
                      style={{
                        color: palette.blue,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}>
                      {pr.type === "weight"
                        ? "PESO MÁX"
                        : pr.type === "estimated_1rm"
                          ? "1RM EST."
                          : "VOLUMEN"}
                    </Text>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        </View>
      ))}
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
  subtitle: {
    fontSize: 16,
    color: palette.muted,
  },
});
