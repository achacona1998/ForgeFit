import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard, AppInput, Chip, IconButton, palette, PrimaryButton, SectionHeader } from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";

const parseNumber = (value: string) => value.trim() ? Number(value.replace(",", ".")) : undefined;

export default function MeasurementsScreen() {
  const router = useRouter();
  const { addMeasurement, database } = useFitness();
  const latest = [...database.measurements].sort((a, b) => b.date.localeCompare(a.date))[0];
  const [weight, setWeight] = useState(latest?.weight?.toString() ?? "");
  const [bodyFat, setBodyFat] = useState(latest?.bodyFat?.toString() ?? "");
  const [waist, setWaist] = useState(latest?.waist?.toString() ?? "");
  const [chest, setChest] = useState(latest?.chest?.toString() ?? "");
  const [rightBicep, setRightBicep] = useState(latest?.rightBicep?.toString() ?? "");
  const [shoulders, setShoulders] = useState(latest?.shoulders?.toString() ?? "");
  const [hips, setHips] = useState(latest?.hips?.toString() ?? "");

  const save = async () => {
    const values = [weight, bodyFat, waist, chest, rightBicep, shoulders, hips].map(parseNumber);
    if (values.some((value) => value !== undefined && (Number.isNaN(value) || value < 0))) {
      Alert.alert("Revisa los valores", "Las medidas deben ser números iguales o mayores que cero.");
      return;
    }
    if (values.every((value) => value === undefined)) {
      Alert.alert("Añade una medida", "Registra al menos un dato para guardar la entrada.");
      return;
    }
    await addMeasurement({ date: new Date().toISOString().slice(0, 10), weight: parseNumber(weight), bodyFat: parseNumber(bodyFat), waist: parseNumber(waist), chest: parseNumber(chest), rightBicep: parseNumber(rightBicep), shoulders: parseNumber(shoulders), hips: parseNumber(hips) });
    router.back();
  };

  return <View style={styles.screen}><View style={styles.header}><IconButton icon="close" label="Cerrar" onPress={() => router.back()} /><View style={styles.headerCenter}><Text style={styles.headerTitle}>Medidas corporales</Text><Text style={styles.headerSubtitle}>Registro local · Hoy</Text></View><IconButton icon="check" accent label="Guardar" onPress={() => void save()} /></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><AppCard style={styles.intro}><View style={styles.introIcon}><MaterialIcons name="monitor-weight" size={22} color={palette.lime} /></View><View style={styles.introText}><Text style={styles.introTitle}>Consistencia sobre perfección</Text><Text style={styles.introCopy}>Mide bajo condiciones similares para que la tendencia sea útil.</Text></View></AppCard><SectionHeader title="Composición" /><View style={styles.grid}><AppInput label="Peso (kg)" placeholder="79.2" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /><AppInput label="Grasa corporal (%)" placeholder="16.2" value={bodyFat} onChangeText={setBodyFat} keyboardType="decimal-pad" /></View><SectionHeader title="Perímetros (cm)" /><View style={styles.grid}><AppInput label="Pecho" placeholder="102" value={chest} onChangeText={setChest} keyboardType="decimal-pad" /><AppInput label="Hombros" placeholder="118" value={shoulders} onChangeText={setShoulders} keyboardType="decimal-pad" /><AppInput label="Cintura" placeholder="79" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" /><AppInput label="Cadera" placeholder="98" value={hips} onChangeText={setHips} keyboardType="decimal-pad" /><AppInput label="Bíceps derecho" placeholder="37" value={rightBicep} onChangeText={setRightBicep} keyboardType="decimal-pad" /></View><View style={styles.customRow}><MaterialIcons name="add-circle-outline" size={18} color={palette.blue} /><Text style={styles.customText}>Podrás añadir métricas personalizadas en una futura actualización local.</Text></View><PrimaryButton label="Guardar medidas" icon="check" onPress={() => void save()} /></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg }, header: { height: 70, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: palette.border }, headerCenter: { alignItems: "center" }, headerTitle: { color: palette.text, fontWeight: "900", fontSize: 15 }, headerSubtitle: { color: palette.muted, fontSize: 10, marginTop: 2 }, content: { padding: 18, paddingBottom: 34, gap: 13 }, intro: { flexDirection: "row", gap: 11, alignItems: "center", backgroundColor: palette.limeSoft, borderColor: "#3B5D1B" }, introIcon: { height: 40, width: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#365317" }, introText: { flex: 1 }, introTitle: { color: palette.lime, fontSize: 14, fontWeight: "900" }, introCopy: { color: "#C3D7AD", fontSize: 11, marginTop: 3, lineHeight: 16 }, grid: { gap: 11 }, customRow: { flexDirection: "row", gap: 8, backgroundColor: palette.blueSoft, padding: 12, borderRadius: 13, alignItems: "flex-start" }, customText: { flex: 1, color: "#BBDFF4", fontSize: 11, lineHeight: 16 },
});
