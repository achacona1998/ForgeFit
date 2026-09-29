import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import {
  AppCard,
  AppInput,
  Chip,
  EmptyState,
  IconButton,
  LoadingScreen,
  Metric,
  palette,
  PrimaryButton,
  SectionHeader,
  Logo,
} from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12
    ? "Buenos días"
    : hour < 19
      ? "Buenas tardes"
      : "Buenas noches";
};

const todayLabel = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "short",
}).format(new Date());

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    database,
    hydrated,
    activeRoutine,
    todayTrainingDay,
    todaySession,
    stats,
    startWorkout,
    completeOnboarding,
  } = useFitness();

  if (!hydrated) return <LoadingScreen />;

  if (!database.settings.firstRunCompleted)
    return <Onboarding onComplete={completeOnboarding} />;

  const handleWorkout = async () => {
    const sessionId = await startWorkout(todayTrainingDay?.id);
    if (sessionId)
      navigation.navigate("WorkoutDetail", { id: sessionId });
  };

  const weeklyTarget = activeRoutine?.daysPerWeek ?? 0;
  const progress = weeklyTarget
    ? Math.min(1, stats.weeklySessions / weeklyTarget)
    : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.greeting}>
            {greeting()}, {database.profile.name}
          </Text>
          <Text style={styles.date}>{todayLabel}</Text>
        </View>
        <IconButton
          icon="notifications-none"
          label="Notificaciones"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      {todayTrainingDay ? (
        <AppCard style={styles.todayCard}>
          <View style={styles.todayDecor} />
          <View style={styles.todayHeader}>
            <Chip
              label={
                todaySession?.status === "in_progress"
                  ? "EN CURSO"
                  : "ENTRENAMIENTO DE HOY"
              }
              tone="lime"
            />
            <Text style={styles.exerciseCount}>
              {todayTrainingDay.exercises.length} ejercicios
            </Text>
          </View>
          <Text style={styles.todayTitle}>{todayTrainingDay.name}</Text>
          <Text style={styles.todayMeta}>
            {activeRoutine?.name} ·{" "}
            {todayTrainingDay.exercises.reduce(
              (sum, item) => sum + item.sets,
              0,
            )}{" "}
            series programadas
          </Text>
          <View style={styles.exercisePreview}>
            {todayTrainingDay.exercises.slice(0, 3).map((exercise) => (
              <View key={exercise.id} style={styles.previewItem}>
                <View style={styles.previewDot} />
                <Text style={styles.previewText}>{exercise.name}</Text>
                <Text style={styles.previewTarget}>
                  {exercise.sets}×{exercise.repRangeMin}–{exercise.repRangeMax}
                </Text>
              </View>
            ))}
          </View>
          <PrimaryButton
            label={
              todaySession?.status === "in_progress"
                ? "Reanudar entrenamiento"
                : "Empezar entrenamiento"
            }
            icon={
              todaySession?.status === "in_progress" ? "play-arrow" : "bolt"
            }
            onPress={() => void handleWorkout()}
          />
        </AppCard>
      ) : (
        <AppCard>
          <EmptyState
            icon="self-improvement"
            title="Día de recuperación"
            detail="No hay sesión programada para hoy. Recuperar también es progresar.">
            <PrimaryButton
              label="Ver rutina"
              onPress={() => navigation.navigate("Routine")}
              icon="format-list-bulleted"
              variant="ghost"
            />
          </EmptyState>
        </AppCard>
      )}

      <SectionHeader
        title="Esta semana"
        action="Ver progreso"
        onAction={() => navigation.navigate("Progress")}
      />
      <AppCard>
        <View style={styles.metricRow}>
          <Metric
            label="Sesiones"
            value={`${stats.weeklySessions}/${weeklyTarget || "–"}`}
            detail="objetivo semanal"
          />
          <View style={styles.divider} />
          <Metric
            label="Volumen"
            value={`${Math.round(stats.weeklyVolume / 1000)}k`}
            detail="kg movidos"
            tone="blue"
          />
          <View style={styles.divider} />
          <Metric
            label="Tiempo"
            value={`${stats.totalMinutes}m`}
            detail="acumulado"
            tone="white"
          />
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressValue, { width: `${progress * 100}%` }]}
          />
        </View>
      </AppCard>

      <SectionHeader
        title="Progreso reciente"
        action="Analizar"
        onAction={() => navigation.navigate("Progress")}
      />
      {stats.recentRecords.length ? (
        <View style={styles.stack}>
          {stats.recentRecords.map((record) => (
            <AppCard key={record.id} style={styles.recordCard}>
              <View style={styles.trophy}>
                <MaterialIcons
                  name="emoji-events"
                  size={20}
                  color={palette.warning}
                />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordName}>{record.exerciseName}</Text>
                <Text style={styles.recordDetail}>
                  {record.weight} kg × {record.reps} reps ·{" "}
                  {record.type === "weight" ? "mejor carga" : "nuevo récord"}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={palette.muted}
              />
            </AppCard>
          ))}
        </View>
      ) : (
        <AppCard>
          <EmptyState
            icon="emoji-events"
            title="Tu próximo PR empieza hoy"
            detail="Completa una sesión para detectar nuevas marcas automáticamente."
          />
        </AppCard>
      )}

      <View style={styles.tip}>
        <MaterialIcons name="info-outline" size={18} color={palette.blue} />
        <Text style={styles.tipText}>
          Las alertas de estancamiento son señales basadas en tus datos, no
          consejos médicos.
        </Text>
      </View>
    </ScrollView>
  );
}

function Onboarding({
  onComplete,
}: {
  onComplete: (
    profile: {
      name: string;
      goal?: string;
      unit?: "kg" | "lb";
      height?: number;
      weight?: number;
      daysPerWeek?: number;
    },
    useExample: boolean,
  ) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Hipertrofia");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [useExample, setUseExample] = useState(true);
  const submit = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Falta tu nombre",
        "Introduce un nombre para personalizar el diario.",
      );
      return;
    }
    await onComplete(
      {
        name: name.trim(),
        goal,
        unit,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        daysPerWeek,
      },
      useExample,
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.onboardWrap}>
      <View style={styles.brandMark}>
        <Logo width={42} height={42} />
      </View>
      <Text style={styles.onboardEyebrow}>FORGEFIT</Text>
      <Text style={styles.onboardTitle}>Empecemos por ti.</Text>
      <Text style={styles.onboardCopy}>
        Estos datos se guardan sólo en tu dispositivo y sirven para personalizar
        tu entrenamiento.
      </Text>
      <AppCard style={styles.onboardForm}>
        <AppInput
          label="Tu nombre"
          placeholder="Ej. Alex"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="next"
        />
        <AppInput
          label="Altura (cm), opcional"
          placeholder="175"
          value={height}
          onChangeText={setHeight}
          keyboardType="number-pad"
        />
        <AppInput
          label={`Peso actual (${unit}), opcional`}
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <Text style={styles.formLabel}>Días de entrenamiento</Text>
        <View style={styles.choiceRow}>
          {[3, 4, 5, 6].map((item) => (
            <Pressable
              key={item}
              onPress={() => setDaysPerWeek(item)}
              style={[
                styles.choice,
                daysPerWeek === item && styles.choiceActive,
              ]}>
              <Text
                style={[
                  styles.choiceText,
                  daysPerWeek === item && styles.choiceTextActive,
                ]}>
                {item} días
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.formLabel}>Objetivo principal</Text>
        <View style={styles.choiceRow}>
          {["Hipertrofia", "Fuerza", "Recomposición"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setGoal(item)}
              style={[styles.choice, goal === item && styles.choiceActive]}>
              <Text
                style={[
                  styles.choiceText,
                  goal === item && styles.choiceTextActive,
                ]}>
              {item}
            </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.formLabel}>Unidad de carga</Text>
        <View style={styles.choiceRow}>
          {(["kg", "lb"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setUnit(item)}
              style={[styles.choice, unit === item && styles.choiceActive]}>
              <Text
                style={[
                  styles.choiceText,
                  unit === item && styles.choiceTextActive,
                ]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => setUseExample((value) => !value)}
          style={styles.exampleRow}>
          <MaterialIcons
            name={useExample ? "check-box" : "check-box-outline-blank"}
            size={20}
            color={useExample ? palette.lime : palette.muted}
          />
          <View>
            <Text style={styles.exampleTitle}>Cargar rutina de ejemplo</Text>
            <Text style={styles.exampleCopy}>
              Empieza con una planificación de 5 días editable.
            </Text>
          </View>
        </Pressable>
        <PrimaryButton
          label={useExample ? "Empezar con mi rutina" : "Crear mi diario"}
          icon="arrow-forward"
          onPress={() => void submit()}
        />
      </AppCard>
      <View style={styles.privacyRow}>
        <MaterialIcons name="lock" size={14} color={palette.success} />
        <Text style={styles.privacyText}>Privacidad local por diseño</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    marginBottom: 4,
  },
  greeting: {
    color: palette.text,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  date: {
    color: palette.muted,
    fontSize: 13,
    textTransform: "capitalize",
    marginTop: 3,
  },
  todayCard: { overflow: "hidden", padding: 18 },
  todayDecor: {
    position: "absolute",
    right: -45,
    top: -55,
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: "#23390F",
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseCount: { color: palette.muted, fontSize: 12, fontWeight: "700" },
  todayTitle: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 15,
  },
  todayMeta: { color: palette.muted, fontSize: 13, marginTop: 5 },
  exercisePreview: { marginVertical: 18, gap: 9 },
  previewItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.lime,
  },
  previewText: {
    flex: 1,
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  previewTarget: { color: palette.muted, fontSize: 12, fontWeight: "700" },
  metricRow: { flexDirection: "row", alignItems: "stretch" },
  divider: { width: 1, backgroundColor: palette.border, marginHorizontal: 12 },
  progressTrack: {
    height: 7,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 17,
  },
  progressValue: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.lime,
  },
  stack: { gap: 9 },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  trophy: {
    height: 38,
    width: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D3013",
  },
  recordInfo: { flex: 1 },
  recordName: { color: palette.text, fontWeight: "800", fontSize: 14 },
  recordDetail: { color: palette.muted, fontSize: 12, marginTop: 3 },
  tip: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: palette.blueSoft,
    borderRadius: 14,
    padding: 13,
    alignItems: "flex-start",
    marginTop: 5,
  },
  tipText: { flex: 1, color: "#BBDFF4", fontSize: 12, lineHeight: 17 },
  onboardWrap: {
    flex: 1,
    backgroundColor: palette.bg,
    justifyContent: "center",
    padding: 28,
  },
  brandMark: {
    height: 72,
    width: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    marginBottom: 24,
    shadowColor: palette.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  onboardEyebrow: {
    color: palette.lime,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.5,
  },
  onboardTitle: {
    color: palette.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 9,
  },
  onboardCopy: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  onboardActions: { gap: 11, marginTop: 30 },
  privacyRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
  },
  privacyText: { color: palette.success, fontSize: 12, fontWeight: "700" },
  onboardForm: { gap: 14, marginTop: 22 },
  formLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: -7,
  },
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  choiceActive: {
    backgroundColor: palette.limeSoft,
    borderColor: palette.lime,
  },
  choiceText: { color: palette.muted, fontWeight: "800", fontSize: 12 },
  choiceTextActive: { color: palette.lime },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 3,
  },
  exampleTitle: { color: palette.text, fontWeight: "800", fontSize: 13 },
  exampleCopy: { color: palette.muted, fontSize: 11, marginTop: 2 },
});