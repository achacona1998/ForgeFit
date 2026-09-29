import { View, Text, StyleSheet } from "react-native";
import { useFitness } from "@/context/fitness-context";
import { LoadingScreen, AppCard, palette } from "@/components/app/ui";

export default function RecordsScreen() {
  const { hydrated, database } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <AppCard style={{ margin: 16 }}>
        <Text style={styles.title}>Registros Rápidos</Text>
        <Text style={styles.subtitle}>Añade PRs manuales o notas.</Text>
        <Text style={styles.note}>Versión simplificada</Text>
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