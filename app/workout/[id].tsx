import { RecoveryContext } from "@/types/fitness";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import {
  AppCard,
  Chip,
  IconButton,
  LoadingScreen,
  NumberStep,
  palette,
  PrimaryButton,
} from "@/components/app/ui";
import { useFitness } from "@/context/fitness-context";
import { suggestNextProgression } from "@/features/progression-engine";
import { calculatePlates } from "@/features/plate-calculator";

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function WorkoutScreen() {
  useKeepAwake();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { hydrated, database, updateWorkoutSet, finishWorkout } = useFitness();
  const session = database.sessions.find((item) => item.id === params.id);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [shouldAdvance, setShouldAdvance] = useState(false);
  const [notes, setNotes] = useState(session?.notes ?? "");
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [calcWeight, setCalcWeight] = useState<number | null>(null);

  useEffect(() => {
    if (!restEndTime || restPaused) {
      if (!restEndTime) setRestRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((restEndTime - Date.now()) / 1000),
      );
      setRestRemaining(remaining);
      if (remaining <= 0) {
        setRestEndTime(null);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    };

    updateTimer(); // Initial check
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [restEndTime, restPaused]);

  useEffect(() => {
    if (restRemaining !== 0 || !shouldAdvance || !session) return;
    if (exerciseIndex < session.exercises.length - 1) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExerciseIndex((value) => value + 1);
    }
    setShouldAdvance(false);
  }, [exerciseIndex, restRemaining, session, shouldAdvance]);

  const activeExercise = session?.exercises[exerciseIndex];
  const completedSets = useMemo(
    () =>
      session?.exercises.reduce(
        (total, exercise) =>
          total + exercise.sets.filter((set) => set.completedAt).length,
        0,
      ) ?? 0,
    [session],
  );
  const totalSets = useMemo(
    () =>
      session?.exercises.reduce(
        (total, exercise) => total + exercise.sets.length,
        0,
      ) ?? 0,
    [session],
  );
  const suggestion = suggestNextProgression(
    activeExercise?.target ?? { sets: 0, repRangeMin: 1, repRangeMax: 1 },
    activeExercise,
  );
  const pairedExercise = activeExercise?.target.supersetGroup
    ? session?.exercises.find(
        (item) =>
          item.id !== activeExercise.id &&
          item.target.supersetGroup === activeExercise.target.supersetGroup,
      )
    : undefined;

  if (!hydrated) return <LoadingScreen />;
  if (!session || !activeExercise)
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Sesión no encontrada</Text>
        <PrimaryButton
          label="Volver al inicio"
          icon="home"
          variant="ghost"
          onPress={() => router.replace("/(tabs)" as never)}
        />
      </View>
    );

  const completeSet = async (setId: string, skipped = false) => {
    const set = activeExercise.sets.find((item) => item.id === setId);
    if (!set) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const completed = !set.completedAt;
    await updateWorkoutSet(session.id, activeExercise.id, setId, {
      completedAt: completed ? new Date().toISOString() : undefined,
      skipped: completed ? skipped : undefined,
    });
    if (completed) {
      if (activeExercise.target.protocol === "SUPERSET" && pairedExercise) {
        // If it's a superset and the paired exercise has an incomplete set at the same index,
        // we skip the rest and move to the paired exercise.
        const pairedSet = pairedExercise.sets[set.order - 1];
        if (pairedSet && !pairedSet.completedAt) {
          setRestEndTime(null);
          setExerciseIndex(
            session.exercises.findIndex((e) => e.id === pairedExercise.id),
          );
          return;
        }
      }
      const restDuration =
        activeExercise.target.protocol === "FST7"
          ? (activeExercise.target.fst7RestSeconds ?? 45)
          : set.restSeconds;
      setRestEndTime(Date.now() + restDuration * 1000);
      setRestPaused(false);
      if (
        activeExercise.sets.every((item) =>
          item.id === set.id ? true : Boolean(item.completedAt),
        )
      )
        setShouldAdvance(true);
    } else {
      setRestEndTime(null);
      setRestPaused(false);
    }
  };

  const updateSessionContext = async (context: Partial<RecoveryContext>) => {
    if (!session) return;
    const newRecovery = { ...session.recovery, ...context };

    // We update local state first for immediate feedback
    // Since we don't have a direct database.updateSession exposed in context,
    // we use a direct update or dispatch (assuming active session state mutates)
    session.recovery = newRecovery;
  };
  const completeWorkout = async () => {
    const records = await finishWorkout(session.id, notes);
    const message = records.length
      ? `Has registrado ${records.length} nuevo${records.length === 1 ? "" : "s"} PR:\n${records.map((record) => `${record.exerciseName} ${record.weight} × ${record.reps}`).join("\n")}`
      : "Tu sesión queda guardada en el historial local.";
    Alert.alert("Entrenamiento guardado", message, [
      { text: "Ver inicio", onPress: () => router.replace("/(tabs)" as never) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          label="Cerrar entrenamiento"
          onPress={() => router.back()}
        />
        <View style={styles.progressWrap}>
          <Text style={styles.headerTitle}>{session.trainingDayName}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressValue,
                {
                  width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.headerMeta}>
            {completedSets}/{totalSets} series completadas
          </Text>
        </View>
        <IconButton
          icon="more-horiz"
          label="Más opciones"
          onPress={() =>
            Alert.alert(
              "Modo entrenamiento",
              "Los datos se guardan en tu dispositivo después de cada cambio.",
            )
          }
        />
      </View>

      {restRemaining > 0 ? (
        <RestPanel
          seconds={restRemaining}
          isPaused={restPaused}
          onSkip={() => {
            setRestEndTime(null);
            setRestPaused(false);
          }}
          onAdd={(secs) => {
            if (restPaused) {
              setRestRemaining((r) => r + secs);
            } else {
              setRestEndTime((value) => (value || Date.now()) + secs * 1000);
            }
          }}
          onTogglePause={() => {
            if (restPaused) {
              setRestEndTime(Date.now() + restRemaining * 1000);
              setRestPaused(false);
            } else {
              setRestPaused(true);
            }
          }}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.exerciseLabelRow}>
          <View style={styles.exerciseBadges}>
            {activeExercise.target.protocol === "FST7" ? (
              <Chip
                label={`SERIE ${Math.min(7, activeExercise.sets.filter((s) => s.completedAt).length + 1)}/7`}
                tone="lime"
              />
            ) : (
              <Chip
                label={`EJERCICIO ${exerciseIndex + 1} DE ${session.exercises.length}`}
                tone="lime"
              />
            )}
            {activeExercise.target.supersetGroup ? (
              <Chip
                label={`BISERIE ${activeExercise.target.supersetGroup.replace("pair-", "")}`}
                tone="blue"
              />
            ) : null}
          </View>
          <Text style={styles.sessionStatus}>
            {session.status === "in_progress" ? "EN CURSO" : "PROGRAMADO"}
          </Text>
        </View>
        <Text style={styles.exerciseTitle}>{activeExercise.name}</Text>
        {pairedExercise ? (
          <AppCard style={styles.pairedCard}>
            <MaterialIcons name="sync-alt" size={17} color={palette.blue} />
            <View style={styles.pairedText}>
              <Text style={styles.pairedLabel}>SIGUIENTE SIN DESCANSO</Text>
              <Text style={styles.pairedName}>{pairedExercise.name}</Text>
              <Text style={styles.pairedMeta}>
                {pairedExercise.target.sets} ×{" "}
                {pairedExercise.target.repRangeMin}–
                {pairedExercise.target.repRangeMax} reps · después inicia el
                descanso
              </Text>
            </View>
          </AppCard>
        ) : null}
        <View style={styles.targetRow}>
          <Chip
            label={`${activeExercise.target.sets} × ${activeExercise.target.repRangeMin}–${activeExercise.target.repRangeMax} reps`}
            tone="blue"
          />
          {activeExercise.target.protocol === "FST7" ? (
            <Chip label="FST-7" tone="lime" />
          ) : activeExercise.target.protocol === "SUPERSET" ? (
            <Chip label="SUPERSERIE" tone="lime" />
          ) : null}
          {activeExercise.target.targetRir !== undefined ? (
            <Chip label={`RIR ${activeExercise.target.targetRir}`} />
          ) : null}
          <Chip
            label={`Descanso ${Math.round(activeExercise.target.restSeconds / 60)} min`}
          />
        </View>

        {activeExercise.previousPerformance ? (
          <AppCard style={styles.previousCard}>
            <View style={styles.previousIcon}>
              <MaterialIcons name="history" size={18} color={palette.blue} />
            </View>
            <View>
              <Text style={styles.previousLabel}>ÚLTIMA SESIÓN</Text>
              <Text style={styles.previousValue}>
                {activeExercise.previousPerformance.weight} kg ×{" "}
                {activeExercise.previousPerformance.reps} reps
                {activeExercise.previousPerformance.rir !== undefined
                  ? ` · RIR ${activeExercise.previousPerformance.rir}`
                  : ""}
              </Text>
            </View>
          </AppCard>
        ) : null}
        <AppCard style={styles.suggestionCard}>
          <View style={styles.suggestionIcon}>
            <MaterialIcons
              name={
                suggestion.kind === "increase_weight"
                  ? "trending-up"
                  : suggestion.kind === "reduce_weight"
                    ? "trending-down"
                    : "track-changes"
              }
              size={18}
              color={palette.lime}
            />
          </View>
          <View style={styles.suggestionText}>
            <Text style={styles.suggestionLabel}>OBJETIVO SUGERIDO</Text>
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionCopy}>{suggestion.detail}</Text>
          </View>
        </AppCard>

        <View style={styles.tableHead}>
          <Text style={[styles.tableLabel, styles.setCol]}>SERIE</Text>
          <Pressable
            style={[
              styles.weightCol,
              { flexDirection: "row", alignItems: "center", gap: 4 },
            ]}
            onPress={() =>
              setCalcWeight(
                activeExercise.sets.find((s) => !s.completedAt)?.weight ??
                  activeExercise.sets[0]?.weight ??
                  20,
              )
            }>
            <Text style={[styles.tableLabel]}>KG</Text>
            <MaterialIcons name="calculate" size={14} color={palette.blue} />
          </Pressable>
          <Text style={[styles.tableLabel, styles.repsCol]}>REPS</Text>
          {database.settings.showRir ? (
            <Text style={[styles.tableLabel, styles.rirCol]}>RIR</Text>
          ) : null}
          <Text style={styles.tableLabel}>LISTA</Text>
        </View>
        <View style={styles.setStack}>
          {activeExercise.sets.map((set) => (
            <SetRow
              key={set.id}
              index={set.order}
              completed={Boolean(set.completedAt)}
              skipped={set.skipped}
              type={set.type}
              weight={set.weight}
              reps={set.reps}
              rir={set.rir}
              quality={set.quality}
              showRir={database.settings.showRir}
              onType={(type) =>
                void updateWorkoutSet(session.id, activeExercise.id, set.id, {
                  type,
                })
              }
              onWeight={(weight) =>
                void updateWorkoutSet(session.id, activeExercise.id, set.id, {
                  weight,
                })
              }
              onReps={(reps) =>
                void updateWorkoutSet(session.id, activeExercise.id, set.id, {
                  reps,
                })
              }
              onRir={(rir) =>
                void updateWorkoutSet(session.id, activeExercise.id, set.id, {
                  rir,
                })
              }
              onComplete={() => void completeSet(set.id)}
              onSkip={() => void completeSet(set.id, true)}
              onQuality={(quality) =>
                void updateWorkoutSet(session.id, activeExercise.id, set.id, {
                  quality,
                })
              }
            />
          ))}
        </View>

        <View style={styles.navButtons}>
          <PrimaryButton
            label="Anterior"
            icon="arrow-back"
            variant="ghost"
            disabled={exerciseIndex === 0}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setExerciseIndex((value) => Math.max(0, value - 1));
            }}
          />
          <PrimaryButton
            label={
              exerciseIndex < session.exercises.length - 1
                ? "Siguiente"
                : "Finalizar"
            }
            icon={
              exerciseIndex < session.exercises.length - 1
                ? "arrow-forward"
                : "check"
            }
            onPress={() => {
              if (exerciseIndex < session.exercises.length - 1) {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setExerciseIndex((value) => value + 1);
              } else {
                void completeWorkout();
              }
            }}
          />
        </View>

        <AppCard style={styles.noteCard}>
          <Text style={styles.noteLabel}>NOTAS DE LA SESIÓN</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Sensaciones, energía, técnica…"
            placeholderTextColor={palette.muted}
            multiline
            style={styles.notesInput}
          />
        </AppCard>
        <View style={{ flex: 1, paddingBottom: 20 }}>
          <View style={{ gap: 12 }}>
            <AppCard>
              <Text style={styles.noteLabel}>CONTEXTO DE RECUPERACIÓN</Text>
              <Text
                style={{
                  color: palette.muted,
                  fontSize: 13,
                  marginBottom: 12,
                  marginTop: 4,
                }}>
                Evalúa cómo te sientes al terminar. Esto alimentará tu Ratio de
                Carga Aguda/Crónica (ACWR).
              </Text>

              <View style={{ gap: 16 }}>
                <View>
                  <Text
                    style={{
                      color: palette.text,
                      fontSize: 13,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}>
                    ENERGÍA (1-10)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}>
                    {[2, 4, 6, 8, 10].map((val) => (
                      <Pressable
                        key={val}
                        onPress={() =>
                          void updateSessionContext({ energy: val })
                        }
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                          backgroundColor:
                            session.recovery?.energy === val
                              ? palette.lime
                              : palette.surfaceAlt,
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <Text
                          style={{
                            color:
                              session.recovery?.energy === val
                                ? palette.bg
                                : palette.text,
                            fontWeight: "bold",
                          }}>
                          {val}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      color: palette.text,
                      fontSize: 13,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}>
                    FATIGA (1-10)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}>
                    {[2, 4, 6, 8, 10].map((val) => (
                      <Pressable
                        key={val}
                        onPress={() =>
                          void updateSessionContext({ fatigue: val })
                        }
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                          backgroundColor:
                            session.recovery?.fatigue === val
                              ? palette.warning
                              : palette.surfaceAlt,
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <Text
                          style={{
                            color:
                              session.recovery?.fatigue === val
                                ? palette.bg
                                : palette.text,
                            fontWeight: "bold",
                          }}>
                          {val}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </AppCard>

            <PrimaryButton
              label="Guardar y finalizar sesión"
              icon="check-circle"
              variant="blue"
              onPress={() => void completeWorkout()}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={calcWeight !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalcWeight(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calculadora de Discos</Text>
              <IconButton icon="close" onPress={() => setCalcWeight(null)} />
            </View>

            {calcWeight !== null && (
              <PlateCalcContent
                targetWeight={calcWeight}
                onChangeTarget={setCalcWeight}
                profile={
                  database.settings.equipmentProfile ?? {
                    barWeight: 20,
                    availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25],
                  }
                }
              />
            )}

            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                label="Cerrar"
                onPress={() => setCalcWeight(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RestPanel({
  seconds,
  isPaused,
  onSkip,
  onAdd,
  onTogglePause,
}: {
  seconds: number;
  isPaused: boolean;
  onSkip: () => void;
  onAdd: (secs: number) => void;
  onTogglePause: () => void;
}) {
  return (
    <View style={styles.restPanel}>
      <View>
        <Text style={styles.restLabel}>
          {isPaused ? "DESCANSO PAUSADO" : "DESCANSO EN CURSO"}
        </Text>
        <Text style={styles.restClock}>{clock(seconds)}</Text>
      </View>
      <View style={styles.restActions}>
        <Pressable
          onPress={() => onAdd(15)}
          style={({ pressed }) => [styles.restMini, pressed && styles.pressed]}>
          <Text style={styles.restMiniText}>+15s</Text>
        </Pressable>
        <Pressable
          onPress={() => onAdd(30)}
          style={({ pressed }) => [styles.restMini, pressed && styles.pressed]}>
          <Text style={styles.restMiniText}>+30s</Text>
        </Pressable>
        <Pressable
          onPress={onTogglePause}
          style={({ pressed }) => [styles.restSkip, pressed && styles.pressed]}>
          <MaterialIcons
            name={isPaused ? "play-arrow" : "pause"}
            size={20}
            color={palette.bg}
          />
        </Pressable>
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.restSkip, pressed && styles.pressed]}>
          <MaterialIcons name="skip-next" size={20} color={palette.bg} />
        </Pressable>
      </View>
    </View>
  );
}

function SetRow({
  index,
  completed,
  skipped,
  type,
  weight,
  reps,
  rir,
  quality,
  showRir,
  onType,
  onWeight,
  onReps,
  onRir,
  onComplete,
  onQuality,
  onSkip,
}: {
  index: number;
  completed: boolean;
  skipped?: boolean;
  type?: "warmup" | "working" | "dropset" | "failure";
  weight: number;
  reps: number;
  rir?: number;
  quality?: "excellent" | "acceptable" | "poor";
  showRir: boolean;
  onType: (value: "warmup" | "working" | "dropset" | "failure") => void;
  onWeight: (value: number) => void;
  onReps: (value: number) => void;
  onRir: (value: number) => void;
  onComplete: () => void;
  onQuality: (value: "excellent" | "acceptable" | "poor") => void;
  onSkip: () => void;
}) {
  const getLabel = () => {
    if (type === "warmup") return "W";
    if (type === "dropset") return "D";
    if (type === "failure") return "F";
    return index;
  };

  const toggleType = () => {
    if (type === "warmup") onType("working");
    else if (type === "working" || !type) onType("dropset");
    else if (type === "dropset") onType("failure");
    else onType("warmup");
  };

  const toggleQuality = () => {
    if (quality === "excellent") onQuality("acceptable");
    else if (quality === "acceptable") onQuality("poor");
    else onQuality("excellent");
  };

  const qualityColor =
    quality === "excellent"
      ? palette.lime
      : quality === "acceptable"
        ? palette.warning
        : quality === "poor"
          ? "#ff4444"
          : palette.muted;

  const qualityLabel =
    quality === "excellent"
      ? "Excelente"
      : quality === "acceptable"
        ? "Aceptable"
        : quality === "poor"
          ? "Pobre"
          : "Calificar técnica";

  return (
    <View style={{ gap: 4 }}>
      <View
        style={[
          styles.setRow,
          completed && styles.setRowDone,
          skipped && { opacity: 0.5 },
        ]}>
        <Pressable onPress={toggleType} style={styles.setCol}>
          <Text
            style={[
              styles.setNumber,
              completed && styles.setNumberDone,
              type === "warmup" && { color: palette.warning },
              type === "dropset" && { color: palette.blue },
              type === "failure" && { color: "#ff4444" },
            ]}>
            {getLabel()}
          </Text>
        </Pressable>
        <View style={styles.weightCol}>
          <NumberStep value={weight} onChange={onWeight} step={2.5} min={0} />
        </View>
        <View style={styles.repsCol}>
          <NumberStep value={reps} onChange={onReps} min={1} />
        </View>
        {showRir ? (
          <View style={styles.rirCol}>
            <NumberStep value={rir ?? 2} onChange={onRir} min={0} />
          </View>
        ) : null}
        <Pressable
          onPress={onComplete}
          style={({ pressed }) => [
            styles.completeButton,
            completed && !skipped && styles.completeButtonDone,
            skipped && {
              backgroundColor: palette.surfaceAlt,
              borderColor: palette.muted,
            },
            pressed && styles.pressed,
          ]}>
          <MaterialIcons
            name={skipped ? "block" : completed ? "check" : "circle"}
            size={20}
            color={
              skipped ? palette.muted : completed ? palette.bg : palette.muted
            }
          />
        </Pressable>
      </View>
      {completed && !skipped && (
        <View style={{ flexDirection: "row", gap: 8, paddingLeft: 34 }}>
          <Pressable
            onPress={toggleQuality}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 8,
              backgroundColor: palette.surfaceAlt,
              borderRadius: 8,
            }}>
            <MaterialIcons name="thumb-up" size={12} color={qualityColor} />
            <Text
              style={{ color: qualityColor, fontSize: 11, fontWeight: "800" }}>
              {qualityLabel}
            </Text>
          </Pressable>
        </View>
      )}
      {!completed && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingRight: 4,
          }}>
          <Pressable onPress={onSkip} style={{ padding: 4 }}>
            <Text
              style={{ color: palette.muted, fontSize: 10, fontWeight: "800" }}>
              Omitir serie
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function PlateCalcContent({
  targetWeight,
  onChangeTarget,
  profile,
}: {
  targetWeight: number;
  onChangeTarget: (w: number) => void;
  profile: { barWeight: number; availablePlates: number[] };
}) {
  const calc = calculatePlates(
    targetWeight,
    profile.barWeight,
    profile.availablePlates,
  );

  return (
    <View style={styles.plateCalcContainer}>
      <View style={styles.plateCalcHeader}>
        <Text style={styles.plateCalcLabel}>OBJETIVO (KG)</Text>
        <NumberStep
          value={targetWeight}
          onChange={onChangeTarget}
          step={2.5}
          min={profile.barWeight}
        />
      </View>

      <View style={styles.plateCalcVisual}>
        <View style={styles.plateCalcBarLeft} />
        <View style={styles.plateCalcBarSleeve}>
          {calc.platesPerSide.map((p, i) => (
            <View
              key={i}
              style={[
                styles.plateGraphic,
                {
                  height: 40 + p * 2,
                  backgroundColor:
                    p >= 20
                      ? palette.blue
                      : p >= 10
                        ? palette.lime
                        : palette.surfaceAlt,
                },
              ]}>
              <Text style={styles.plateGraphicText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.plateCalcDetails}>
        <Text style={styles.plateCalcText}>Barra: {profile.barWeight} kg</Text>
        <Text style={styles.plateCalcText}>
          Discos por lado:{" "}
          {calc.platesPerSide.length > 0
            ? calc.platesPerSide.join(", ")
            : "Ninguno"}
        </Text>
        <Text style={styles.plateCalcTotal}>
          Total en barra: {calc.actualWeight} kg
        </Text>
        {calc.remainder > 0 && (
          <Text style={styles.plateCalcWarning}>
            Faltan {calc.remainder} kg (discos no disponibles)
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  notFound: {
    flex: 1,
    backgroundColor: palette.bg,
    justifyContent: "center",
    padding: 24,
    gap: 18,
  },
  notFoundTitle: {
    color: palette.text,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
  },
  header: {
    padding: 14,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  progressWrap: { flex: 1, alignItems: "center", gap: 4 },
  headerTitle: { color: palette.text, fontWeight: "900", fontSize: 13 },
  headerMeta: { color: palette.muted, fontSize: 10 },
  progressTrack: {
    height: 4,
    width: "76%",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressValue: {
    height: "100%",
    backgroundColor: palette.lime,
    borderRadius: 4,
  },
  content: { padding: 18, paddingBottom: 38, gap: 14 },
  exerciseLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  sessionStatus: {
    color: palette.success,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  exerciseTitle: {
    color: palette.text,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  targetRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  previousCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: palette.blueSoft,
    borderColor: "#214D68",
  },
  previousIcon: {
    height: 32,
    width: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B4057",
  },
  previousLabel: {
    color: "#9DD6F6",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  previousValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    backgroundColor: palette.limeSoft,
    borderColor: "#3B5D1B",
  },
  suggestionIcon: {
    height: 32,
    width: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#365317",
  },
  suggestionText: { flex: 1 },
  suggestionLabel: {
    color: palette.lime,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  suggestionTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  suggestionCopy: {
    color: "#C3D7AD",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  pairedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 11,
    backgroundColor: palette.blueSoft,
    borderColor: "#214D68",
  },
  pairedText: { flex: 1 },
  pairedLabel: {
    color: palette.blue,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  pairedName: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  pairedMeta: { color: "#BBDFF4", fontSize: 11, marginTop: 2 },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    gap: 6,
  },
  tableLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
  },
  setCol: { width: 27 },
  weightCol: { flex: 1.35 },
  repsCol: { flex: 1.1 },
  rirCol: { flex: 1.05 },
  setStack: { gap: 7 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 7,
    borderRadius: 15,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  setRowDone: { backgroundColor: "#172C1A", borderColor: "#426B2A" },
  setNumber: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  setNumberDone: { color: palette.lime },
  completeButton: {
    height: 34,
    width: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.border,
    borderWidth: 1,
  },
  completeButtonDone: {
    backgroundColor: palette.lime,
    borderColor: palette.lime,
  },
  navButtons: { flexDirection: "row", gap: 10, marginTop: 5 },
  noteCard: { gap: 7, padding: 13 },
  noteLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  notesInput: {
    minHeight: 54,
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  restPanel: {
    backgroundColor: palette.lime,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restLabel: {
    color: "#395900",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  restClock: {
    color: palette.bg,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 2,
  },
  restActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  restMini: {
    backgroundColor: "#D6FF8A",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 11,
  },
  restMiniText: { color: palette.bg, fontWeight: "900", fontSize: 12 },
  restSkip: {
    height: 36,
    width: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.bg,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  plateCalcContainer: {
    gap: 20,
  },
  plateCalcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plateCalcLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  plateCalcVisual: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    backgroundColor: palette.bg,
    borderRadius: 12,
    overflow: "hidden",
  },
  plateCalcBarLeft: {
    width: "40%",
    height: 16,
    backgroundColor: palette.muted,
  },
  plateCalcBarSleeve: {
    width: "60%",
    height: 24,
    backgroundColor: palette.border,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    gap: 2,
  },
  plateGraphic: {
    width: 14,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  plateGraphicText: {
    color: palette.bg,
    fontSize: 8,
    fontWeight: "900",
    transform: [{ rotate: "-90deg" }],
  },
  plateCalcDetails: {
    backgroundColor: palette.bg,
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  plateCalcText: {
    color: palette.text,
    fontSize: 14,
  },
  plateCalcTotal: {
    color: palette.lime,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  plateCalcWarning: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});
