import type {
  Routine,
  SessionExercise,
  TrainingDay,
  WorkoutSession,
} from "@/types/fitness";
import { getLastPerformance } from "./analytics";
import { isoDate, makeId } from "./sample-data";

const toSessionExercise = (template: TrainingDay["exercises"][number], previous?: SessionExercise["previousPerformance"]): SessionExercise => {
  const suggestedWeight = previous?.weight ?? template.targetWeight ?? 0;
  const suggestedReps = previous?.reps ?? template.repRangeMin;

  return {
    id: makeId("session-exercise"),
    templateId: template.id,
    exerciseId: template.exerciseId,
    name: template.name,
    order: template.order,
    target: {
      sets: template.sets,
      repRangeMin: template.repRangeMin,
      repRangeMax: template.repRangeMax,
      targetWeight: template.targetWeight,
      targetRir: template.targetRir,
      targetRpe: template.targetRpe,
      restSeconds: template.restSeconds,
      tempo: template.tempo,
      notes: template.notes,
      supersetGroup: template.supersetGroup,
      protocol: template.protocol,
      directMuscles: template.directMuscles,
      secondaryMuscles: template.secondaryMuscles,
      priority: template.priority,
      increment: template.increment,
      fst7RestSeconds: template.fst7RestSeconds,
    },
    previousPerformance: previous,
    sets: Array.from({ length: template.sets }, (_, index) => ({
      id: makeId("set"),
      order: index + 1,
      weight: suggestedWeight,
      reps: suggestedReps,
      rir: previous?.rir ?? template.targetRir,
      rpe: previous?.rpe ?? template.targetRpe,
      restSeconds: template.restSeconds,
    })),
  };
};

export const buildSession = (
  routine: Routine,
  trainingDay: TrainingDay,
  existingSessions: WorkoutSession[],
  scheduledDate = isoDate(),
): WorkoutSession => ({
  id: makeId("session"),
  routineId: routine.id,
  routineName: routine.name,
  trainingDayId: trainingDay.id,
  trainingDayName: trainingDay.name,
  scheduledDate,
  status: "scheduled",
  block: routine.block,
  mesocycle: routine.mesocycle,
  exercises: trainingDay.exercises
    .sort((a, b) => a.order - b.order)
    .map((template) => toSessionExercise(template, getLastPerformance(existingSessions, template.exerciseId))),
});

export const findTrainingDayForDate = (routine: Routine | undefined, date = new Date()) =>
  routine?.trainingDays.find((trainingDay) => trainingDay.weekday === date.getDay());
