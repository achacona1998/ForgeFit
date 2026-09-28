import type { ExerciseTemplate, SessionExercise, WorkoutSession } from "@/types/fitness";
import { getExerciseHistory, estimateOneRepMax } from "./analytics";

export type ProgressionType = "DOUBLE_PROGRESSION" | "FIXED_REPS" | "RIR_BASED" | "FST7" | "SUPERSET" | "BODYWEIGHT" | "CUSTOM";

export interface ProgressionSuggestion {
  kind: "increase_weight" | "add_reps" | "maintain" | "reduce_weight";
  title: string;
  detail: string;
  nextWeight?: number;
  nextRepMin?: number;
  confidence: "high" | "medium" | "low";
}

export function suggestNextProgression(
  template: Pick<ExerciseTemplate, "repRangeMin" | "repRangeMax" | "targetWeight" | "targetRir" | "sets">,
  latest: SessionExercise | undefined,
  increment = 2.5,
): ProgressionSuggestion {
  if (!latest || !latest.sets.length) return { kind: "maintain", title: "Primera sesión", detail: "Registra una base para calcular tu próximo objetivo.", confidence: "low" };
  const completed = latest.sets.filter((set) => set.completedAt || set.reps > 0);
  const allAtTop = completed.length >= template.sets && completed.every((set) => set.reps >= template.repRangeMax);
  const averageRir = completed.reduce((sum, set) => sum + (set.rir ?? template.targetRir ?? 2), 0) / Math.max(1, completed.length);
  const targetRir = template.targetRir ?? 2;
  const lastWeight = completed[completed.length - 1]?.weight ?? template.targetWeight ?? 0;

  if (allAtTop && averageRir >= targetRir) {
    return { kind: "increase_weight", title: "Subir carga sugerido", detail: `Completaste el máximo del rango con RIR objetivo. Prueba ${lastWeight + increment} kg.`, nextWeight: lastWeight + increment, confidence: "high" };
  }
  if (averageRir < targetRir - 1 || completed.some((set) => set.reps < template.repRangeMin)) {
    return { kind: "reduce_weight", title: "Mantener técnica", detail: "La última sesión quedó por debajo del objetivo. Mantén o reduce ligeramente la carga.", nextWeight: Math.max(0, lastWeight - increment), confidence: "medium" };
  }
  return { kind: "add_reps", title: "Buscar más repeticiones", detail: `Mantén ${lastWeight} kg e intenta acercarte a ${template.repRangeMax} reps.`, nextWeight: lastWeight, nextRepMin: Math.min(template.repRangeMax, template.repRangeMin + 1), confidence: "medium" };
}

export function progressionForExercise(sessions: WorkoutSession[], exerciseId: string) {
  return getExerciseHistory(sessions, exerciseId).map(({ session, exercise }) => {
    const best = exercise.sets.reduce((current, set) => estimateOneRepMax(set.weight, set.reps) > estimateOneRepMax(current.weight, current.reps) ? set : current, exercise.sets[0]);
    return { date: session.scheduledDate, weight: best?.weight ?? 0, reps: best?.reps ?? 0, volume: exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0), e1rm: best ? estimateOneRepMax(best.weight, best.reps) : 0 };
  }).reverse();
}

export function adherence(scheduled: number, completed: number) {
  return scheduled <= 0 ? 0 : Math.min(100, Math.round((completed / scheduled) * 100));
}

// Fase 6: Training Stress Score (TSS) and Fatigue Engine
// Calculates the TSS of a single session based on Volume, RPE/RIR, and total duration.
export function calculateSessionTSS(session: WorkoutSession): number {
  if (!session.exercises || session.exercises.length === 0) return 0;
  
  let totalTSS = 0;
  
  session.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.skipped) return;
      const weight = set.weight || 1; // avoid zero
      const reps = set.reps || 1;
      const rir = set.rir ?? 2;
      const intensityFactor = 1 + (Math.max(0, 5 - rir) * 0.05); // closer to failure = higher intensity
      
      const setVolume = weight * reps;
      const setTSS = (setVolume / 100) * intensityFactor;
      totalTSS += setTSS;
    });
  });

  return Math.round(totalTSS);
}

// Acute:Chronic Workload Ratio (ACWR)
export function calculateACWR(sessions: WorkoutSession[]): { acute: number, chronic: number, ratio: number, status: string } {
  const completed = sessions.filter(s => s.status === "completed" && s.completedAt);
  if (completed.length === 0) return { acute: 0, chronic: 0, ratio: 0, status: "Descansado" };

  const now = new Date().getTime();
  const ONE_DAY = 1000 * 60 * 60 * 24;

  let acuteLoad = 0; // last 7 days
  let chronicLoad = 0; // last 28 days

  completed.forEach(s => {
    const sessionDate = new Date(s.completedAt!).getTime();
    const daysAgo = (now - sessionDate) / ONE_DAY;
    const tss = calculateSessionTSS(s);

    if (daysAgo <= 7) {
      acuteLoad += tss;
    }
    if (daysAgo <= 28) {
      chronicLoad += tss;
    }
  });

  const chronicAvg = chronicLoad / 4; // average weekly load over 4 weeks
  const ratio = chronicAvg > 0 ? (acuteLoad / chronicAvg) : 0;

  let status = "Óptimo";
  if (ratio < 0.8) status = "Baja carga (Pérdida de forma)";
  else if (ratio >= 0.8 && ratio <= 1.3) status = "Zona de adaptación (Óptimo)";
  else if (ratio > 1.3 && ratio <= 1.5) status = "Precaución (Alerta de fatiga)";
  else if (ratio > 1.5) status = "Peligro (Riesgo de lesión)";

  return {
    acute: Math.round(acuteLoad),
    chronic: Math.round(chronicAvg),
    ratio: Number(ratio.toFixed(2)),
    status
  };
}

export function volumeByMuscle(sessions: WorkoutSession[], muscleByExercise: Record<string, string[]>) {
  return sessions.filter((session) => session.status === "completed").reduce<Record<string, number>>((result, session) => {
    session.exercises.forEach((exercise) => {
      const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      (muscleByExercise[exercise.exerciseId] ?? ["Sin clasificar"]).forEach((muscle) => { result[muscle] = (result[muscle] ?? 0) + volume; });
    });
    return result;
  }, {});
}
