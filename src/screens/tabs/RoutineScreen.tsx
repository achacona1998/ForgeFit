import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard, Chip, EmptyState, IconButton, LoadingScreen, palette, PrimaryButton, SectionHeader } from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";
import { dayNames } from "@/types/fitness";

export default function RoutineScreen() {
  const navigation = useNavigation();
  const { hydrated, activeRoutine, database, createRoutine, duplicateRoutine, activateRoutine, applyDeload, cancelDeload } = useFitness();
  if (!hydrated) return <LoadingScreen />;

  const createAndOpen = async () => {
    const routine = await createRoutine("Mi rutina");
    navigation.navigate("RoutineBuilder", { id: routine.id });
  };

  if (!activeRoutine) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState icon="format-list-bulleted-add" title="Configura tu rutina una vez" detail="Después Pulso Fit prepara cada sesión con tus objetivos y recuerda tus últimos resultados.">
          <PrimaryButton label="Crear mi rutina" icon="add" onPress={() => void createAndOpen()} />
        </EmptyState>
      </View>
    );
  }

  const otherRoutines = database.routines.filter((routine) => routine.id !== activeRoutine.id);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Tu rutina</Text><Text style={styles.subtitle}>Planifica una vez. Ejecuta cada día.</Text></View>
        <IconButton icon="add" accent label="Nueva rutina" onPress={() => void createAndOpen()} />
      </View>

      <AppCard style={styles.activeCard}>
        <View style={styles.activeDecor} />
        <View style={styles.cardTop}><Chip label="ACTIVA" tone="lime" /><Pressable onPress={() => navigation.navigate("RoutineBuilder", { id: activeRoutine.id })} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><MaterialIcons name="edit" color={palette.text} size={18} /></Pressable></View>
        <Text style={styles.routineName}>{activeRoutine.name}</Text>
        <Text style={styles.routineGoal}>{activeRoutine.goal} · {activeRoutine.daysPerWeek} días por semana</Text>
        <View style={styles.tagRow}>{activeRoutine.block ? <Chip label={activeRoutine.block} tone="blue" /> : null}{activeRoutine.mesocycle ? <Chip label={activeRoutine.mesocycle} /> : null}</View>
        <PrimaryButton label="Editar planificación" icon="tune" variant="ghost" onPress={() => navigation.navigate("RoutineBuilder", { id: activeRoutine.id })} />
      </AppCard>

      <AppCard style={styles.deloadCard}><View style={styles.deloadTop}><View style={styles.deloadIcon}><MaterialIcons name="self-improvement" size={20} color={palette.blue} /></View><View style={styles.deloadText}><Text style={styles.deloadTitle}>{activeRoutine.deload ? `Semana de descarga activa · −${activeRoutine.deload.reductionPercent}%` : "Semana de descarga"}</Text><Text style={styles.deloadCopy}>{activeRoutine.deload ? "Las nuevas sesiones tienen menos series. La rutina original se conserva para restaurarla." : "Reduce el volumen temporalmente sin modificar tu historial."}</Text></View></View><View style={styles.deloadActions}>{activeRoutine.deload ? <PrimaryButton label="Restaurar volumen" icon="restore" variant="ghost" onPress={() => Alert.alert("Restaurar programación", "Las sesiones futuras volverán al número original de series.", [{ text: "Cancelar", style: "cancel" }, { text: "Restaurar", onPress: () => void cancelDeload(activeRoutine.id) }])} /> : <PrimaryButton label="Configurar descarga" icon="tune" variant="blue" onPress={() => Alert.alert("Reducción de volumen", "Elige cuánto reducir durante esta semana.", [{ text: "Cancelar", style: "cancel" }, { text: "−30%", onPress: () => void applyDeload(activeRoutine.id, 30) }, { text: "−40%", onPress: () => void applyDeload(activeRoutine.id, 40) }, { text: "−50%", style: "destructive", onPress: () => void applyDeload(activeRoutine.id, 50) }])} />}</View></AppCard>

      <SectionHeader title="Días de entrenamiento" action="Editar" onAction={() => navigation.navigate("RoutineBuilder", { id: activeRoutine.id })} />
      <View style={styles.dayStack}>
        {activeRoutine.trainingDays.sort((a, b) => a.order - b.order).map((day) => (
          <Pressable key={day.id} onPress={() => navigation.navigate("RoutineBuilder", { id: activeRoutine.id, dayId: day.id })} style={({ pressed }) => [styles.dayCard, pressed && styles.pressed]}>
            <View style={styles.dayNumber}><Text style={styles.dayNumberText}>{dayNames[day.weekday].slice(0, 1)}</Text></View>
            <View style={styles.dayInfo}><Text style={styles.dayName}>{day.name}</Text><Text style={styles.dayMeta}>{day.exercises.length} ejercicios · {day.exercises.reduce((sum, item) => sum + item.sets, 0)} series</Text></View>
            <MaterialIcons name="chevron-right" color={palette.muted} size={22} />
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Otras plantillas" />
      <AppCard>
        <View style={styles.templateRow}><View style={styles.templateIcon}><MaterialIcons name="content-copy" size={20} color={palette.blue} /></View><View style={styles.templateText}><Text style={styles.templateTitle}>Duplica para experimentar</Text><Text style={styles.templateCopy}>Prueba una V2 sin alterar sesiones ni la plantilla activa.</Text></View></View>
        <View style={styles.inlineButtons}><PrimaryButton label="Duplicar rutina" icon="content-copy" variant="blue" onPress={() => void duplicateRoutine(activeRoutine.id)} /></View>
      </AppCard>
      {otherRoutines.map((routine) => <Pressable key={routine.id} onPress={() => Alert.alert("Activar rutina", `¿Usar "${routine.name}" como rutina activa?`, [{ text: "Cancelar", style: "cancel" }, { text: "Activar", onPress: () => void activateRoutine(routine.id) }])} style={({ pressed }) => [styles.otherRoutine, pressed && styles.pressed]}><View><Text style={styles.otherRoutineName}>{routine.name}</Text><Text style={styles.otherRoutineMeta}>{routine.trainingDays.length} días · {routine.goal}</Text></View><Chip label="Activar" tone="blue" /></Pressable>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg }, content: { padding: 18, paddingBottom: 28, gap: 14 },
  emptyWrap: { flex: 1, backgroundColor: palette.bg, justifyContent: "center", padding: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 6, marginBottom: 4 },
  title: { color: palette.text, fontSize: 25, fontWeight: "900", letterSpacing: -0.7 }, subtitle: { color: palette.muted, fontSize: 13, marginTop: 3 },
  activeCard: { overflow: "hidden", gap: 12 }, activeDecor: { position: "absolute", width: 120, height: 120, borderRadius: 60, right: -25, top: -45, backgroundColor: "#1F3510" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, editButton: { height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: palette.surfaceAlt },
  routineName: { color: palette.text, fontSize: 25, fontWeight: "900", letterSpacing: -0.6 }, routineGoal: { color: palette.muted, fontSize: 13 }, tagRow: { flexDirection: "row", gap: 7, marginBottom: 4 },
  dayStack: { gap: 9 }, dayCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: palette.surface, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: palette.border },
  dayNumber: { height: 38, width: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: palette.limeSoft }, dayNumberText: { color: palette.lime, fontWeight: "900", fontSize: 15 },
  dayInfo: { flex: 1 }, dayName: { color: palette.text, fontWeight: "800", fontSize: 15 }, dayMeta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  templateRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" }, templateIcon: { height: 39, width: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: palette.blueSoft }, templateText: { flex: 1 }, templateTitle: { color: palette.text, fontWeight: "800", fontSize: 14 }, templateCopy: { color: palette.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }, inlineButtons: { marginTop: 14 },
  otherRoutine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 17, padding: 13, backgroundColor: palette.surfaceAlt }, otherRoutineName: { color: palette.text, fontWeight: "800" }, otherRoutineMeta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  deloadCard: { backgroundColor: palette.blueSoft, borderColor: "#214D68" }, deloadTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" }, deloadIcon: { height: 38, width: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#1B4057" }, deloadText: { flex: 1 }, deloadTitle: { color: palette.blue, fontWeight: "900", fontSize: 14 }, deloadCopy: { color: "#BBDFF4", fontSize: 11, lineHeight: 16, marginTop: 3 }, deloadActions: { marginTop: 12 },
  pressed: { opacity: 0.7 },
});