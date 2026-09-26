import type {
  PersonalRecord,
  WorkoutSession,
  WorkoutStats,
} from "@/types/fitness";
import { makeId } from "./sample-data";

export const calcSetVolume = (weight: number, reps: number) => weight * reps;

export const calcSessionVolume = (session: WorkoutSession) =>
  session.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets
        .filter((s) => s.type !== "warmup")
        .reduce(
          (setsTotal, set) => setsTotal + calcSetVolume(set.weight, set.reps),
          0,
        ),
    0,
  );

export const calcSessionMinutes = (session: WorkoutSession) => {
  if (!session.startedAt || !session.completedAt) return 0;
  const duration =
    new Date(session.completedAt).getTime() -
    new Date(session.startedAt).getTime();
  return Math.max(0, Math.round(duration / 60000));
};

export const dayStamp = (value: string) => value.slice(0, 10);

export const beginningOfWeek = (date = new Date()) => {
  const copy = new Date(date);
  const offset = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - offset);
  return copy;
};

export const getWorkoutStats = (
  sessions: WorkoutSession[],
  records: PersonalRecord[],
): WorkoutStats => {
  const now = new Date();
  const weekStart = beginningOfWeek(now).getTime();
  const month = now.getMonth();
  const year = now.getFullYear();
  const completed = sessions.filter(
    (session) => session.status === "completed",
  );
  const weekly = completed.filter(
    (session) => new Date(session.scheduledDate).getTime() >= weekStart,
  );
  const monthly = completed.filter((session) => {
    const date = new Date(session.scheduledDate);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  return {
    weeklySessions: weekly.length,
    monthlySessions: monthly.length,
    weeklyVolume: weekly.reduce(
      (total, session) => total + calcSessionVolume(session),
      0,
    ),
    monthlyVolume: monthly.reduce(
      (total, session) => total + calcSessionVolume(session),
      0,
    ),
    totalMinutes: completed.reduce(
      (total, session) => total + calcSessionMinutes(session),
      0,
    ),
    recentRecords: [...records]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3),
  };
};

export const getExerciseHistory = (
  sessions: WorkoutSession[],
  exerciseId: string,
) =>
  sessions
    .filter((session) => session.status === "completed")
    .flatMap((session) =>
      session.exercises
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .map((exercise) => ({ session, exercise })),
    )
    .sort((a, b) =>
      b.session.scheduledDate.localeCompare(a.session.scheduledDate),
    );

export const getLastPerformance = (
  sessions: WorkoutSession[],
  exerciseId: string,
) => {
  const history = getExerciseHistory(sessions, exerciseId);
  const latest = history[0]?.exercise.sets.find((s) => s.type !== "warmup");
  if (!latest) return undefined;
  return {
    weight: latest.weight,
    reps: latest.reps,
    rir: latest.rir,
    rpe: latest.rpe,
  };
};

export const estimateOneRepMax = (weight: number, reps: number) =>
  Math.round(weight * (1 + reps / 30));

export const detectNewRecords = (
  session: WorkoutSession,
  priorSessions: WorkoutSession[],
  existing: PersonalRecord[],
): PersonalRecord[] => {
  const previousBestByExercise = new Map<
    string,
    { weight: number; e1rm: number }
  >();
  priorSessions
    .filter((item) => item.status === "completed")
    .forEach((item) =>
      item.exercises.forEach((exercise) =>
        exercise.sets
          .filter((s) => s.type !== "warmup")
          .forEach((set) => {
            const current = previousBestByExercise.get(exercise.exerciseId) ?? {
              weight: 0,
              e1rm: 0,
            };
            previousBestByExercise.set(exercise.exerciseId, {
              weight: Math.max(current.weight, set.weight),
              e1rm: Math.max(
                current.e1rm,
                estimateOneRepMax(set.weight, set.reps),
              ),
            });
          }),
      ),
    );

  const newRecords: PersonalRecord[] = [];
  session.exercises.forEach((exercise) => {
    const bestSet = [...exercise.sets]
      .filter((s) => s.type !== "warmup")
      .sort(
        (a, b) =>
          estimateOneRepMax(b.weight, b.reps) -
          estimateOneRepMax(a.weight, a.reps),
      )[0];
    if (!bestSet) return;
    const previous = previousBestByExercise.get(exercise.exerciseId) ?? {
      weight: 0,
      e1rm: 0,
    };
    const alreadyRecorded = existing.some(
      (record) =>
        record.sourceSessionId === session.id &&
        record.exerciseId === exercise.exerciseId,
    );
    if (alreadyRecorded) return;

    if (bestSet.weight > previous.weight) {
      newRecords.push({
        id: makeId("pr"),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        date: session.scheduledDate,
        weight: bestSet.weight,
        reps: bestSet.reps,
        type: "weight",
        sourceSessionId: session.id,
      });
    } else if (
      estimateOneRepMax(bestSet.weight, bestSet.reps) > previous.e1rm
    ) {
      newRecords.push({
        id: makeId("pr"),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        date: session.scheduledDate,
        weight: bestSet.weight,
        reps: bestSet.reps,
        type: "estimated_1rm",
        sourceSessionId: session.id,
      });
    }
  });

  return newRecords;
};

export const potentialPlateau = (
  sessions: WorkoutSession[],
  exerciseId: string,
) => {
  const history = getExerciseHistory(sessions, exerciseId).slice(0, 4);
  if (history.length < 4) return false;
  const topSets = history
    .map((entry) => entry.exercise.sets[0])
    .filter(Boolean);
  return topSets.every(
    (set) => set.weight === topSets[0].weight && set.reps === topSets[0].reps,
  );
};

export const percentageChange = (values: number[]) => {
  if (values.length < 2 || values[0] === 0) return 0;
  return ((values[values.length - 1] - values[0]) / values[0]) * 100;
};
