import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  BarChart,
  LineChart,
  PeriodSelector,
  AppCard,
  Chip,
  EmptyState,
  LoadingScreen,
  Metric,
  palette,
  PrimaryButton,
  SectionHeader,
} from "@/components/app/ui";
import {
  calcSessionMinutes,
  calcSessionVolume,
  potentialPlateau,
} from "@/features/analytics";
import { calculateACWR } from "@/features/progression-engine";
import { useFitness } from "@/context/fitness-context";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
    new Date(date),
  );

type ViewMode = "resumen" | "historial" | "cuerpo";
type Period = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

export default function ProgressScreen() {
  const router = useRouter();
  const { hydrated, database, stats, activeRoutine } = useFitness();
  const [view, setView] = useState<ViewMode>("resumen");
  const [period, setPeriod] = useState<Period>("30d");

  const acwr = useMemo(
    () => calculateACWR(database.sessions),
    [database.sessions],
  );

  const getCutoffDate = (p: Period) => {
    const cutoff = new Date();
    if (p === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (p === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (p === "3m") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (p === "6m") cutoff.setMonth(cutoff.getMonth() - 6);
    else if (p === "1y") cutoff.setFullYear(cutoff.getFullYear() - 1);
    else cutoff.setFullYear(2000);
    return cutoff;
  };

  const cutoffDate = getCutoffDate(period);

  const sessions = database.sessions
    .filter((session) => session.status === "completed")
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  const filteredSessions = sessions.filter(
    (s) => new Date(s.completedAt || s.scheduledDate) >= cutoffDate,
  );
  const reversedSessions = [...filteredSessions].reverse();

  const measurements = [...database.measurements]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((m) => new Date(m.date) >= cutoffDate);
  const weights = measurements
    .map((measurement) => measurement.weight ?? 0)
    .filter(Boolean);
  const labels = measurements.map((measurement) =>
    formatDate(measurement.date),
  );

  const stalled = useMemo(() => {
    const exerciseIds = [
      ...new Set(
        sessions.flatMap((session) =>
          session.exercises.map((exercise) => exercise.exerciseId),
        ),
      ),
    ];
    return exerciseIds
      .filter((id) => potentialPlateau(database.sessions, id))
      .slice(0, 2);
  }, [database.sessions, sessions]);

  if (!hydrated) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progreso</Text>
          <Text style={styles.subtitle}>Datos reales, tendencias claras.</Text>
        </View>
        <View style={styles.privacy}>
          <MaterialIcons name="lock" size={13} color={palette.success} />
          <Text style={styles.privacyText}>LOCAL</Text>
        </View>
      </View>
      <View style={styles.switcher}>
        {(["resumen", "historial", "cuerpo"] as ViewMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setView(mode)}
            style={({ pressed }) => [
              styles.switchItem,
              view === mode && styles.switchActive,
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.switchText,
                view === mode && styles.switchTextActive,
              ]}>
              {mode === "resumen"
                ? "Resumen"
                : mode === "historial"
                  ? "Historial"
                  : "Cuerpo"}
            </Text>
          </Pressable>
        ))}
      </View>

      <PeriodSelector period={period} onChange={setPeriod} />

      {view === "resumen" ? (
        <Summary
          router={router}
          weeklyVolume={stats.weeklyVolume}
          monthlyVolume={stats.monthlyVolume}
          totalMinutes={stats.totalMinutes}
          sessions={sessions}
          records={database.records}
          stalled={stalled}
          adherenceValue={100} // Temporarily hardcoded until we adapt adherence
          acwr={acwr}
        />
      ) : null}
      {view === "historial" ? (
        <History router={router} sessions={sessions} />
      ) : null}
      {view === "cuerpo" ? (
        <Body
          router={router}
          weights={weights}
          labels={labels}
          measurements={measurements}
        />
      ) : null}
    </ScrollView>
  );
}

function Summary({
  router,
  weeklyVolume,
  monthlyVolume,
  totalMinutes,
  sessions,
  records,
  stalled,
  adherenceValue,
  acwr,
}: {
  router: ReturnType<typeof useRouter>;
  weeklyVolume: number;
  monthlyVolume: number;
  totalMinutes: number;
  sessions: ReturnType<typeof useFitness>["database"]["sessions"];
  records: ReturnType<typeof useFitness>["database"]["records"];
  stalled: string[];
  adherenceValue: number;
  acwr: ReturnType<typeof calculateACWR>;
}) {
  const [secondaryRatio, setSecondaryRatio] = useState<number>(0.5);

  const muscleVolumes = useMemo(() => {
    const groups: Record<string, number> = {
      Pecho: 0,
      Espalda: 0,
      Piernas: 0,
      Hombros: 0,
      Brazos: 0,
    };

    sessions.forEach((s) => {
      s.exercises.forEach((e) => {
        const vol = e.sets.reduce((acc, set) => acc + set.weight * set.reps, 0);

        // Very basic mapping for the demo
        const primary = "Pecho"; // in a real app, match from DB
        groups["Pecho"] += vol;
      });
    });

    return groups;
  }, [sessions, secondaryRatio]);

  const recentSessions = sessions.slice(0, 4);

  // Fake chart data for the summary since we don't have historical aggregation yet
  // Ideally this would be calculated from sessions
  const volumeValues = sessions
    .slice(0, 7)
    .reverse()
    .map((s) => calcSessionVolume(s));
  const volumeLabels = sessions
    .slice(0, 7)
    .reverse()
    .map((s) => formatDate(s.completedAt || s.scheduledDate));

  return (
    <View style={styles.stack}>
      <AppCard>
        <Text style={styles.heroLabel}>VOLUMEN RECIENTE</Text>
        <Text style={styles.heroValue}>
          {Math.round(weeklyVolume).toLocaleString("es-ES")}{" "}
          <Text style={styles.heroUnit}>kg</Text>
        </Text>
        <Text style={styles.heroDetail}>
          {Math.round(monthlyVolume).toLocaleString("es-ES")} kg acumulados este
          mes
        </Text>
        <View style={styles.chartWrap}>
          {volumeValues.length > 0 ? (
            <BarChart values={volumeValues} labels={volumeLabels} />
          ) : null}
        </View>
        <View style={styles.metricRow}>
          <Metric
            label="Sesiones"
            value={String(sessions.length)}
            detail="completadas"
            tone="lime"
          />
          <View style={styles.divider} />
          <Metric
            label="Adherencia"
            value={`${adherenceValue}%`}
            detail="objetivo"
            tone="blue"
          />
          <View style={styles.divider} />
          <Metric
            label="Tiempo"
            value={`${totalMinutes}m`}
            detail="entrenando"
            tone="white"
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.heroLabel}>TASA DE ADHERENCIA</Text>
        <Text style={styles.heroValue}>
          {adherenceValue}
          <Text style={styles.heroUnit}>%</Text>
        </Text>
        <View style={styles.chartWrap}>
          <LineChart
            values={[60, 75, 80, 85, adherenceValue]}
            labels={["Ene", "Feb", "Mar", "Abr", "May"]}
            color={palette.blue}
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.heroLabel}>ESTADO DE RECUPERACIÓN (ACWR)</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <View>
            <Text style={[styles.heroValue, { color: acwr.ratio > 1.3 ? palette.warning : palette.lime }]}>
              {acwr.ratio}
            </Text>
            <Text style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
              Carga Crónica: {acwr.chronic}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Chip label={acwr.status} tone={acwr.ratio > 1.3 ? "warning" : "lime"} />
            <Text style={{ color: palette.muted, fontSize: 11, marginTop: 8, textAlign: "right" }}>
              TSS Últimos 7 días: {acwr.acute}
            </Text>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.heroLabel}>VOLUMEN POR MÚSCULO</Text>
        <View style={styles.chartWrap}>
          <BarChart
            values={Object.values(muscleVolumes)}
            labels={Object.keys(muscleVolumes)}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}>
          <Text
            style={{ color: palette.muted, fontSize: 11, fontWeight: "bold" }}>
            CONTRIBUCIÓN SECUNDARIA
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 0.25, 0.5, 1].map((ratio) => (
              <Pressable
                key={ratio}
                onPress={() => setSecondaryRatio(ratio)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  backgroundColor:
                    secondaryRatio === ratio
                      ? palette.limeSoft
                      : palette.surfaceAlt,
                  borderRadius: 8,
                }}>
                <Text
                  style={{
                    color:
                      secondaryRatio === ratio ? palette.lime : palette.muted,
                    fontSize: 10,
                    fontWeight: "bold",
                  }}>
                  {ratio * 100}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </AppCard>

      <SectionHeader title="Ejercicios recientes" />
      {recentSessions.length ? (
        recentSessions.map((session) => (
          <Pressable
            key={session.id}
            onPress={() =>
              router.push({
                pathname: "/session/[id]",
                params: { id: session.id },
              } as never)
            }
            style={({ pressed }) => [
              styles.sessionCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.sessionDate}>
              <Text style={styles.sessionDateDay}>
                {new Date(session.scheduledDate).getDate()}
              </Text>
              <Text style={styles.sessionDateMonth}>
                {new Intl.DateTimeFormat("es-ES", { month: "short" })
                  .format(new Date(session.scheduledDate))
                  .replace(".", "")}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{session.trainingDayName}</Text>
              <Text style={styles.sessionMeta}>
                {session.exercises.length} ejercicios ·{" "}
                {Math.round(calcSessionVolume(session)).toLocaleString("es-ES")}{" "}
                kg
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={palette.muted}
            />
          </Pressable>
        ))
      ) : (
        <AppCard>
          <EmptyState
            icon="history"
            title="Tu historial aparecerá aquí"
            detail="Completa una sesión para empezar a comparar tu rendimiento."
          />
        </AppCard>
      )}

      <SectionHeader title="PRs recientes" />
      <View style={styles.stack}>
        {records.slice(0, 3).map((record) => (
          <Pressable
            key={record.id}
            onPress={() =>
              router.push({
                pathname: "/exercise/[id]",
                params: { id: record.exerciseId },
              } as never)
            }
            style={({ pressed }) => [
              styles.recordRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.recordTrophy}>
              <MaterialIcons
                name="emoji-events"
                size={18}
                color={palette.warning}
              />
            </View>
            <View style={styles.recordText}>
              <Text style={styles.recordName}>{record.exerciseName}</Text>
              <Text style={styles.recordMeta}>
                {record.weight} kg × {record.reps} reps ·{" "}
                {formatDate(record.date)}
              </Text>
            </View>
            <MaterialIcons name="north-east" size={18} color={palette.muted} />
          </Pressable>
        ))}
      </View>

      {stalled.length ? (
        <AppCard style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <MaterialIcons
              name="trending-flat"
              size={20}
              color={palette.warning}
            />
          </View>
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Posible estancamiento</Text>
            <Text style={styles.warningCopy}>
              Algunos ejercicios no cambiaron en las últimas cuatro sesiones. Es
              una señal de tus datos, no un diagnóstico.
            </Text>
          </View>
        </AppCard>
      ) : null}
    </View>
  );
}

function History({
  router,
  sessions,
}: {
  router: ReturnType<typeof useRouter>;
  sessions: ReturnType<typeof useFitness>["database"]["sessions"];
}) {
  return (
    <View style={styles.stack}>
      <SectionHeader title="Sesiones completadas" />
      <View style={styles.monthLabel}>
        <Text style={styles.monthLabelText}>HISTORIAL LOCAL</Text>
        <Chip label={`${sessions.length} sesiones`} tone="blue" />
      </View>
      {sessions.map((session) => (
        <Pressable
          key={session.id}
          onPress={() =>
            router.push({
              pathname: "/session/[id]",
              params: { id: session.id },
            } as never)
          }
          style={({ pressed }) => [
            styles.historyCard,
            pressed && styles.pressed,
          ]}>
          <View style={styles.historyTop}>
            <View>
              <Text style={styles.historyName}>{session.trainingDayName}</Text>
              <Text style={styles.historyRoutine}>{session.routineName}</Text>
            </View>
            <Chip label="COMPLETADA" tone="success" />
          </View>
          <View style={styles.historyFoot}>
            <Text style={styles.historyDate}>
              {formatDate(session.scheduledDate)}
            </Text>
            <Text style={styles.historyVolume}>
              {Math.round(calcSessionVolume(session)).toLocaleString("es-ES")}{" "}
              kg · {calcSessionMinutes(session)} min
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function Body({
  router,
  weights,
  labels,
  measurements,
}: {
  router: ReturnType<typeof useRouter>;
  weights: number[];
  labels: string[];
  measurements: ReturnType<typeof useFitness>["database"]["measurements"];
}) {
  const latest = measurements[measurements.length - 1];
  const prior = measurements[measurements.length - 2];
  const change =
    latest?.weight && prior?.weight ? latest.weight - prior.weight : 0;

  const bodyFats = measurements.map((m) => m.bodyFat ?? 0).filter((f) => f > 0);

  const bfLabels = measurements
    .filter((m) => (m.bodyFat ?? 0) > 0)
    .map((m) => formatDate(m.date));

  return (
    <View style={styles.stack}>
      <AppCard>
        <View style={styles.bodyHead}>
          <View>
            <Text style={styles.heroLabel}>PESO CORPORAL</Text>
            <Text style={styles.heroValue}>
              {latest?.weight?.toFixed(1) ?? "—"}
              <Text style={styles.heroUnit}> kg</Text>
            </Text>
          </View>
          <Chip
            label={`${change >= 0 ? "+" : ""}${change.toFixed(1)} kg`}
            tone={change >= 0 ? "warning" : "lime"}
          />
        </View>
        <View style={styles.chartWrap}>
          {weights.length ? (
            <LineChart values={weights} labels={labels} color={palette.blue} />
          ) : (
            <EmptyState
              icon="monitor-weight"
              title="Aún no hay mediciones"
              detail="Registra tu primera medida para ver tu evolución."
            />
          )}
        </View>
      </AppCard>

      {bodyFats.length > 0 && (
        <AppCard>
          <View style={styles.bodyHead}>
            <View>
              <Text style={styles.heroLabel}>GRASA CORPORAL</Text>
              <Text style={styles.heroValue}>
                {latest?.bodyFat?.toFixed(1) ?? "—"}
                <Text style={styles.heroUnit}> %</Text>
              </Text>
            </View>
          </View>
          <View style={styles.chartWrap}>
            <LineChart
              values={bodyFats}
              labels={bfLabels}
              color={palette.warning}
            />
          </View>
        </AppCard>
      )}

      <SectionHeader
        title="Últimas medidas"
        action="Añadir"
        onAction={() => router.push("/measurements" as never)}
      />
      {measurements
        .slice()
        .reverse()
        .map((measurement) => (
          <AppCard key={measurement.id} style={styles.measurement}>
            <View>
              <Text style={styles.measurementDate}>
                {formatDate(measurement.date)}
              </Text>
              <Text style={styles.measurementMeta}>
                {measurement.bodyFat
                  ? `${measurement.bodyFat}% grasa`
                  : "Sin % de grasa"}
                {measurement.waist ? ` · Cintura ${measurement.waist} cm` : ""}
              </Text>
            </View>
            <Text style={styles.measurementWeight}>
              {measurement.weight?.toFixed(1) ?? "—"}
              <Text style={styles.measurementUnit}> kg</Text>
            </Text>
          </AppCard>
        ))}
      <PrimaryButton
        label="Registrar medidas"
        icon="add"
        onPress={() => router.push("/measurements" as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, paddingBottom: 30, gap: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
  },
  title: {
    color: palette.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  subtitle: { color: palette.muted, fontSize: 13, marginTop: 3 },
  privacy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#143426",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  privacyText: {
    color: palette.success,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  switcher: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: palette.surface,
  },
  switchItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  switchActive: { backgroundColor: palette.surfaceAlt },
  switchText: { color: palette.muted, fontSize: 12, fontWeight: "800" },
  switchTextActive: { color: palette.lime },
  stack: { gap: 10 },
  heroLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  heroValue: {
    color: palette.lime,
    fontWeight: "900",
    fontSize: 34,
    letterSpacing: -1.2,
    marginTop: 6,
  },
  heroUnit: { color: palette.muted, fontSize: 15, letterSpacing: 0 },
  heroDetail: { color: palette.muted, fontSize: 12, marginTop: 4 },
  metricRow: { flexDirection: "row", marginTop: 22 },
  divider: { width: 1, backgroundColor: palette.border, marginHorizontal: 18 },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 17,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sessionDate: {
    height: 42,
    width: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.limeSoft,
  },
  sessionDateDay: {
    color: palette.lime,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 17,
  },
  sessionDateMonth: {
    color: palette.lime,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sessionInfo: { flex: 1 },
  sessionName: { color: palette.text, fontSize: 14, fontWeight: "800" },
  sessionMeta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  recordTrophy: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#3D3013",
  },
  recordText: { flex: 1 },
  recordName: { color: palette.text, fontWeight: "800", fontSize: 13 },
  recordMeta: { color: palette.muted, marginTop: 3, fontSize: 11 },
  warningCard: {
    flexDirection: "row",
    gap: 11,
    backgroundColor: "#2B2615",
    borderColor: "#5E4C1A",
  },
  warningIcon: {
    height: 34,
    width: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#473816",
  },
  warningText: { flex: 1 },
  warningTitle: { color: palette.warning, fontWeight: "900", fontSize: 14 },
  warningCopy: { color: "#D7CA9B", lineHeight: 17, fontSize: 12, marginTop: 3 },
  monthLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthLabelText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  historyCard: {
    gap: 13,
    padding: 15,
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
  },
  historyTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  historyName: { color: palette.text, fontSize: 15, fontWeight: "900" },
  historyRoutine: { color: palette.muted, fontSize: 12, marginTop: 3 },
  historyFoot: {
    paddingTop: 11,
    borderTopWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyDate: { color: palette.blue, fontSize: 12, fontWeight: "800" },
  historyVolume: { color: palette.muted, fontSize: 11 },
  bodyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chartWrap: { marginTop: 10 },
  measurement: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  measurementDate: {
    color: palette.text,
    fontWeight: "800",
    fontSize: 14,
    textTransform: "capitalize",
  },
  measurementMeta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  measurementWeight: { color: palette.lime, fontSize: 21, fontWeight: "900" },
  measurementUnit: { color: palette.muted, fontSize: 11 },
  pressed: { opacity: 0.72 },
});
