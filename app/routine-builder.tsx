import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard, AppInput, Chip, EmptyState, IconButton, LoadingScreen, NumberStep, palette, PrimaryButton, SectionHeader } from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";
import type { ExerciseTemplate, TrainingDay } from "@/types/fitness";

const recommendedDays = [
  { weekday: 1, name: "Pecho + Hombros" }, { weekday: 2, name: "Piernas" }, { weekday: 3, name: "Espalda" }, { weekday: 4, name: "Brazos + Deltoides" }, { weekday: 5, name: "Femoral + Glúteos" },
];

export default function RoutineBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; dayId?: string }>();
  const { hydrated, database, updateRoutine, addTrainingDay, addExerciseToDay, updateTemplate } = useFitness();
  const routine = database.routines.find((item) => item.id === params.id);
  const [selectedDayId, setSelectedDayId] = useState(params.dayId);
  const [query, setQuery] = useState("");

  const selectedDay = routine?.trainingDays.find((day) => day.id === selectedDayId) ?? routine?.trainingDays[0];
  const availableDays = useMemo(() => recommendedDays.filter((entry) => !routine?.trainingDays.some((day) => day.weekday === entry.weekday)), [routine?.trainingDays]);
  const exercises = database.exercises.filter((exercise) => !query || exercise.name.toLowerCase().includes(query.toLowerCase())).slice(0, 7);

  if (!hydrated) return <LoadingScreen />;
  if (!routine) return <View style={styles.screen}><EmptyState icon="error-outline" title="Rutina no encontrada" detail="La plantilla local ya no está disponible." /><PrimaryButton label="Volver" onPress={() => router.back()} icon="arrow-back" variant="ghost" /></View>;

  const changeRoutine = (patch: Partial<typeof routine>) => void updateRoutine({ ...routine, ...patch });
  const adjustTemplate = (template: ExerciseTemplate, patch: Partial<ExerciseTemplate>) => void updateTemplate(routine.id, selectedDay!.id, { ...template, ...patch });
  const removeTemplate = (templateId: string) => {
    if (!selectedDay) return;
    Alert.alert("Quitar ejercicio", "Las sesiones ya registradas no se modificarán.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: () => void updateRoutine({ ...routine, trainingDays: routine.trainingDays.map((day) => day.id === selectedDay.id ? { ...day, exercises: day.exercises.filter((template) => template.id !== templateId) } : day) }) },
    ]);
  };

  const addSuggestedDay = async () => {
    const next = availableDays[0];
    if (!next) return;
    await addTrainingDay(routine.id, next.weekday, next.name);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}><IconButton icon="close" label="Cerrar" onPress={() => router.back()} /><View style={styles.headerCenter}><Text style={styles.headerTitle}>Constructor de rutina</Text><Text style={styles.headerSubtitle}>Los cambios sólo afectan sesiones futuras</Text></View><IconButton icon="check" accent label="Guardar" onPress={() => router.back()} /></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppCard style={styles.nameCard}>
          <AppInput label="Nombre de la rutina" value={routine.name} onChangeText={(name) => changeRoutine({ name })} returnKeyType="done" />
          <View style={styles.goalRow}><Chip label={routine.goal} tone="lime" /><Chip label={`${routine.trainingDays.length} días`} tone="blue" /><Pressable onPress={() => changeRoutine({ goal: routine.goal === "Hipertrofia" ? "Fuerza" : "Hipertrofia" })} style={({ pressed }) => [styles.changeGoal, pressed && styles.pressed]}><Text style={styles.changeGoalText}>Cambiar objetivo</Text></Pressable></View>
        </AppCard>

        <SectionHeader title="Días de entrenamiento" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
          {routine.trainingDays.map((day) => <Pressable key={day.id} onPress={() => setSelectedDayId(day.id)} style={({ pressed }) => [styles.dayTab, selectedDay?.id === day.id && styles.dayTabActive, pressed && styles.pressed]}><Text style={[styles.dayTabTop, selectedDay?.id === day.id && styles.dayTabTopActive]}>{["D", "L", "M", "X", "J", "V", "S"][day.weekday]}</Text><Text numberOfLines={1} style={[styles.dayTabText, selectedDay?.id === day.id && styles.dayTabTextActive]}>{day.name}</Text></Pressable>)}
          {availableDays.length ? <Pressable onPress={() => void addSuggestedDay()} style={({ pressed }) => [styles.addDay, pressed && styles.pressed]}><MaterialIcons name="add" size={20} color={palette.lime} /><Text style={styles.addDayText}>Añadir día</Text></Pressable> : null}
        </ScrollView>

        {!selectedDay ? (
          <AppCard><EmptyState icon="calendar-today" title="Empieza con un día" detail="Añade un día y la app generará sesiones basadas en esta plantilla." /></AppCard>
        ) : (
          <>
            <View style={styles.dayDetailHeader}><View><Text style={styles.dayDetailTitle}>{selectedDay.name}</Text><Text style={styles.dayDetailMeta}>{selectedDay.exercises.length} ejercicios · se programa {selectedDay.weekday === 0 ? "domingo" : "entre semana"}</Text></View><Chip label="PLANTILLA" tone="blue" /></View>
            {selectedDay.exercises.map((template, index) => <ExerciseConfig key={template.id} template={template} index={index} onChange={(patch) => adjustTemplate(template, patch)} onRemove={() => removeTemplate(template.id)} />)}
            <SectionHeader title="Añadir desde biblioteca" />
            <AppInput placeholder="Buscar ejercicio local…" value={query} onChangeText={setQuery} />
            <View style={styles.libraryStack}>{exercises.map((exercise) => <Pressable key={exercise.id} onPress={() => void addExerciseToDay(routine.id, selectedDay.id, exercise)} style={({ pressed }) => [styles.libraryRow, pressed && styles.pressed]}><View style={styles.libraryIcon}><MaterialIcons name="fitness-center" color={palette.blue} size={18} /></View><View style={styles.libraryText}><Text style={styles.libraryName}>{exercise.name}</Text><Text style={styles.libraryMeta}>{exercise.muscleGroups.join(" · ")} · {exercise.equipment}</Text></View><MaterialIcons name="add-circle" size={22} color={palette.lime} /></Pressable>)}</View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ExerciseConfig({ template, index, onChange, onRemove }: { template: ExerciseTemplate; index: number; onChange: (patch: Partial<ExerciseTemplate>) => void; onRemove: () => void }) {
  return (
    <AppCard style={styles.exerciseCard}>
      <View style={styles.exerciseTop}><View style={styles.exerciseIndex}><Text style={styles.exerciseIndexText}>{index + 1}</Text></View><View style={styles.exerciseHeading}><Text style={styles.exerciseName}>{template.name}</Text><Text style={styles.exerciseTarget}>Objetivo: {template.sets} × {template.repRangeMin}–{template.repRangeMax} reps</Text></View><Pressable onPress={onRemove} style={({ pressed }) => [styles.remove, pressed && styles.pressed]}><MaterialIcons name="close" size={18} color={palette.muted} /></Pressable></View>
      <View style={styles.configGrid}>
        <View style={styles.configItem}><Text style={styles.configLabel}>SERIES</Text><NumberStep value={template.sets} min={1} onChange={(sets) => onChange({ sets })} /></View>
        <View style={styles.configItem}><Text style={styles.configLabel}>REPS MÍN.</Text><NumberStep value={template.repRangeMin} min={1} onChange={(repRangeMin) => onChange({ repRangeMin, repRangeMax: Math.max(repRangeMin, template.repRangeMax) })} /></View>
        <View style={styles.configItem}><Text style={styles.configLabel}>REPS MÁX.</Text><NumberStep value={template.repRangeMax} min={template.repRangeMin} onChange={(repRangeMax) => onChange({ repRangeMax })} /></View>
      </View>
      <View style={styles.configGrid}>
        <View style={styles.configItem}><Text style={styles.configLabel}>CARGA KG</Text><NumberStep value={template.targetWeight ?? 0} min={0} step={2.5} onChange={(targetWeight) => onChange({ targetWeight })} /></View>
        <View style={styles.configItem}><Text style={styles.configLabel}>RIR</Text><NumberStep value={template.targetRir ?? 2} min={0} onChange={(targetRir) => onChange({ targetRir })} /></View>
        <View style={styles.configItem}><Text style={styles.configLabel}>DESCANSO</Text><NumberStep value={Math.round(template.restSeconds / 60)} min={0} suffix="m" onChange={(minutes) => onChange({ restSeconds: minutes * 60 })} /></View>
      </View>
      <Pressable onPress={() => { const protocol = template.protocol === "FST7" ? undefined : template.protocol === "SUPERSET" ? "FST7" : "SUPERSET"; onChange({ protocol, supersetGroup: protocol === "SUPERSET" ? (template.supersetGroup ?? `pair-${Math.floor(index / 2) + 1}`) : undefined, sets: protocol === "FST7" ? 7 : template.sets, repRangeMin: protocol === "FST7" ? 10 : template.repRangeMin, repRangeMax: protocol === "FST7" ? 15 : template.repRangeMax, restSeconds: protocol === "FST7" ? 30 : template.restSeconds }); }} style={({ pressed }) => [styles.protocolButton, pressed && styles.pressed]}>
        <MaterialIcons name={template.protocol ? "sync-alt" : "tune"} size={16} color={template.protocol ? palette.lime : palette.blue} />
        <Text style={styles.protocolText}>{template.protocol === "FST7" ? "FST-7 · 7 series · 30 s" : template.protocol === "SUPERSET" ? "Superserie · grupo activo" : "Añadir protocolo: superserie / FST-7"}</Text>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg }, content: { padding: 18, paddingBottom: 36, gap: 13 },
  header: { height: 70, paddingHorizontal: 18, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderColor: palette.border }, headerCenter: { alignItems: "center" }, headerTitle: { color: palette.text, fontSize: 15, fontWeight: "900" }, headerSubtitle: { color: palette.muted, fontSize: 10, marginTop: 2 },
  nameCard: { gap: 12 }, goalRow: { flexDirection: "row", alignItems: "center", gap: 7 }, changeGoal: { marginLeft: "auto", padding: 5 }, changeGoalText: { color: palette.blue, fontSize: 12, fontWeight: "800" },
  dayTabs: { gap: 9, paddingRight: 18 }, dayTab: { width: 102, minHeight: 71, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 16, padding: 10, justifyContent: "space-between" }, dayTabActive: { backgroundColor: palette.limeSoft, borderColor: palette.lime }, dayTabTop: { color: palette.muted, fontWeight: "900", fontSize: 12 }, dayTabTopActive: { color: palette.lime }, dayTabText: { color: palette.text, fontWeight: "800", fontSize: 11 }, dayTabTextActive: { color: palette.lime }, addDay: { minWidth: 96, borderStyle: "dashed", borderWidth: 1, borderColor: palette.border, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 4, padding: 10 }, addDayText: { color: palette.lime, fontSize: 11, fontWeight: "800" },
  dayDetailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }, dayDetailTitle: { color: palette.text, fontSize: 21, fontWeight: "900" }, dayDetailMeta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  exerciseCard: { gap: 13 }, exerciseTop: { flexDirection: "row", alignItems: "center", gap: 10 }, exerciseIndex: { height: 28, width: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: palette.blueSoft }, exerciseIndexText: { color: palette.blue, fontSize: 12, fontWeight: "900" }, exerciseHeading: { flex: 1 }, exerciseName: { color: palette.text, fontSize: 15, fontWeight: "900" }, exerciseTarget: { color: palette.muted, fontSize: 12, marginTop: 2 }, remove: { padding: 5 },
  configGrid: { flexDirection: "row", gap: 8 }, configItem: { flex: 1, backgroundColor: palette.surfaceAlt, borderRadius: 13, padding: 9, gap: 7 }, configLabel: { color: palette.muted, fontWeight: "900", letterSpacing: 0.4, fontSize: 9 },
  libraryStack: { gap: 8 }, libraryRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: palette.surface, borderRadius: 15, padding: 11, borderWidth: 1, borderColor: palette.border }, libraryIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: palette.blueSoft }, libraryText: { flex: 1 }, libraryName: { color: palette.text, fontWeight: "800", fontSize: 13 }, libraryMeta: { color: palette.muted, fontSize: 11, marginTop: 2 }, protocolButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: palette.surfaceAlt, borderRadius: 12, padding: 11, borderWidth: 1, borderColor: palette.border }, protocolText: { color: palette.muted, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
