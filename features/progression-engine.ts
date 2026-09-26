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

export function volumeByMuscle(sessions: WorkoutSession[], muscleByExercise: Record<string, string[]>) {
  return sessions.filter((session) => session.status === "completed").reduce<Record<string, number>>((result, session) => {
    session.exercises.forEach((exercise) => {
      const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      (muscleByExercise[exercise.exerciseId] ?? ["Sin clasificar"]).forEach((muscle) => { result[muscle] = (result[muscle] ?? 0) + volume; });
    });
    return result;
  }, {});
}
