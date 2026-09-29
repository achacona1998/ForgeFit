import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { useRoute } from "@react-navigation/native";
import { LoadingScreen, AppCard, palette, PrimaryButton } from "@/components/app/ui";

export default function RoutineBuilderScreen() {
  const route = useRoute();
  const { id, dayId } = route.params as { id: string; dayId?: string };
  const { hydrated, database, activeRoutine, createRoutine } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  const routine = database.routines.find(r => r.id === id) || activeRoutine;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Constructor de Rutinas</Text>
        <Text style={styles.subtitle}>
          {routine?.name || "Nueva rutina"} {dayId ? `· Día: ${dayId}` : ""}
        </Text>
        <PrimaryButton
          label="Añadir ejercicio"
          icon="add"
          onPress={() => alert("Función pendiente")}
          variant="blue"
        />
        <PrimaryButton
          label="Añadir día"
          icon="calendar-plus"
          onPress={() => alert("Función pendiente")}
          variant="ghost"
        />
        <Text style={styles.note}>Versión simplificada - editor completo pendiente</Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.text, fontSize: 24, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: palette.muted, fontSize: 14, marginBottom: 16 },
  note: { color: palette.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
});