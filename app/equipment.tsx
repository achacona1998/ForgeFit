import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  IconButton,
  NumberStep,
  palette,
  PrimaryButton,
  SectionHeader,
} from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";

const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function EquipmentScreen() {
  const router = useRouter();
  const { database, updateSettings } = useFitness();

  const currentProfile = database.settings.equipmentProfile ?? {
    barWeight: 20,
    availablePlates: DEFAULT_PLATES,
  };

  const [barWeight, setBarWeight] = useState(currentProfile.barWeight);
  const [plates, setPlates] = useState<number[]>(
    currentProfile.availablePlates,
  );

  const togglePlate = (weight: number) => {
    setPlates((prev) =>
      prev.includes(weight)
        ? prev.filter((p) => p !== weight)
        : [...prev, weight].sort((a, b) => b - a),
    );
  };

  const handleSave = async () => {
    await updateSettings({
      equipmentProfile: {
        barWeight,
        availablePlates: plates,
      },
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Perfil de Equipamiento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Barra" />
        <AppCard style={styles.card}>
          <Text style={styles.label}>Peso de la barra vacía (kg)</Text>
          <Text style={styles.description}>
            El peso base que se restará al calcular los discos.
          </Text>
          <View style={styles.stepperContainer}>
            <NumberStep
              value={barWeight}
              onChange={setBarWeight}
              step={2.5}
              min={0}
            />
          </View>
        </AppCard>

        <SectionHeader title="Discos disponibles" />
        <AppCard style={styles.card}>
          <Text style={styles.description}>
            Selecciona los discos que tienes disponibles en tu gimnasio. Se
            usarán para calcular exactamente qué discos poner en la barra.
          </Text>
          <View style={styles.platesGrid}>
            {[50, 45, 25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25].map((weight) => {
              const active = plates.includes(weight);
              return (
                <View key={weight} style={styles.plateItem}>
                  <PrimaryButton
                    label={`${weight}`}
                    variant={active ? "blue" : "ghost"}
                    onPress={() => togglePlate(weight)}
                  />
                </View>
              );
            })}
          </View>
        </AppCard>

        <View style={{ marginTop: 20 }}>
          <PrimaryButton
            label="Guardar preferencias"
            icon="save"
            variant="lime"
            onPress={() => void handleSave()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingTop: 12,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  headerTitle: { color: palette.text, fontSize: 16, fontWeight: "900" },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  card: { gap: 12 },
  label: { color: palette.text, fontSize: 15, fontWeight: "900" },
  description: { color: palette.muted, fontSize: 13, lineHeight: 18 },
  stepperContainer: { alignItems: "flex-start", marginTop: 8 },
  platesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  plateItem: {
    width: "30%",
  },
  inactivePlate: {
    opacity: 0.5,
  },
});
