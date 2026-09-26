import type {
  Exercise,
  ExerciseTemplate,
  FitnessDatabase,
  SessionExercise,
  TrainingDay,
  WorkoutSession,
} from "@/types/fitness";

const now = new Date().toISOString();

export const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const isoDate = (date = new Date()) => date.toISOString().slice(0, 10);

export const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
};

export const exerciseLibrary: Exercise[] = [
  { id: "ex-bench", name: "Press banca", muscleGroups: ["Pecho", "Tríceps"], equipment: "Barra", category: "Compuesto", instructions: "Escápulas retraídas, pies firmes y descenso controlado.", isCustom: false },
  { id: "ex-incline", name: "Press inclinado con mancuernas", muscleGroups: ["Pecho", "Hombros"], equipment: "Mancuernas", category: "Compuesto", instructions: "Mantén los codos a unos 45° y controla el rango.", isCustom: false },
  { id: "ex-lateral", name: "Elevaciones laterales", muscleGroups: ["Hombros"], equipment: "Mancuernas", category: "Aislamiento", instructions: "Eleva con el codo, sin impulso.", isCustom: false },
  { id: "ex-squat", name: "Sentadilla trasera", muscleGroups: ["Cuádriceps", "Glúteos"], equipment: "Barra", category: "Compuesto", instructions: "Mantén tensión abdominal y rodillas alineadas.", isCustom: false },
  { id: "ex-legpress", name: "Prensa de piernas", muscleGroups: ["Cuádriceps", "Glúteos"], equipment: "Máquina", category: "Compuesto", instructions: "Controla el descenso y evita despegar la cadera.", isCustom: false },
  { id: "ex-row", name: "Remo con barra", muscleGroups: ["Espalda", "Bíceps"], equipment: "Barra", category: "Compuesto", instructions: "Tira hacia el ombligo sin balancear el torso.", isCustom: false },
  { id: "ex-pulldown", name: "Jalón al pecho", muscleGroups: ["Espalda", "Bíceps"], equipment: "Polea", category: "Compuesto", instructions: "Lleva los codos hacia abajo y atrás.", isCustom: false },
  { id: "ex-curl", name: "Curl inclinado", muscleGroups: ["Bíceps"], equipment: "Mancuernas", category: "Aislamiento", instructions: "Extiende el brazo y evita adelantar el hombro.", isCustom: false },
  { id: "ex-rdl", name: "Peso muerto rumano", muscleGroups: ["Femoral", "Glúteos"], equipment: "Barra", category: "Compuesto", instructions: "Cadera atrás, barra cerca y espalda neutra.", isCustom: false },
  { id: "ex-legcurl", name: "Curl femoral sentado", muscleGroups: ["Femoral"], equipment: "Máquina", category: "Aislamiento", instructions: "Pausa un instante en la contracción.", isCustom: false },
  { id: "ex-calf", name: "Elevación de gemelos", muscleGroups: ["Gemelos"], equipment: "Máquina", category: "Aislamiento", instructions: "Recorre el rango completo con pausa arriba.", isCustom: false },
];

const template = (
  id: string,
  exerciseId: string,
  name: string,
  order: number,
  sets: number,
  min: number,
  max: number,
  weight: number,
  rir: number,
  restSeconds: number,
): ExerciseTemplate => ({
  id,
  exerciseId,
  name,
  order,
  sets,
  repRangeMin: min,
  repRangeMax: max,
  targetWeight: weight,
  targetRir: rir,
  restSeconds,
});

const pushExercises = [
  template("tpl-bench", "ex-bench", "Press banca", 1, 4, 6, 10, 100, 2, 180),
  template("tpl-incline", "ex-incline", "Press inclinado con mancuernas", 2, 3, 8, 12, 32, 2, 120),
  template("tpl-lateral", "ex-lateral", "Elevaciones laterales", 3, 4, 12, 20, 12, 1, 90),
];
const lowerExercises = [
  template("tpl-squat", "ex-squat", "Sentadilla trasera", 1, 4, 5, 8, 120, 2, 180),
  template("tpl-legpress", "ex-legpress", "Prensa de piernas", 2, 3, 10, 15, 180, 2, 120),
  template("tpl-calf-a", "ex-calf", "Elevación de gemelos", 3, 4, 10, 15, 55, 1, 75),
];
const pullExercises = [
  template("tpl-row", "ex-row", "Remo con barra", 1, 4, 6, 10, 80, 2, 150),
  template("tpl-pulldown", "ex-pulldown", "Jalón al pecho", 2, 3, 8, 12, 65, 2, 120),
  template("tpl-curl", "ex-curl", "Curl inclinado", 3, 3, 10, 15, 14, 1, 75),
];
const armsExercises = [
  template("tpl-lateral-b", "ex-lateral", "Elevaciones laterales", 1, 4, 12, 20, 12, 1, 75),
  template("tpl-curl-b", "ex-curl", "Curl inclinado", 2, 4, 8, 12, 16, 1, 90),
  template("tpl-pulldown-b", "ex-pulldown", "Jalón al pecho", 3, 3, 10, 15, 55, 2, 90),
];
const posteriorExercises = [
  template("tpl-rdl", "ex-rdl", "Peso muerto rumano", 1, 4, 6, 10, 110, 2, 180),
  template("tpl-legcurl", "ex-legcurl", "Curl femoral sentado", 2, 3, 10, 15, 50, 1, 90),
  template("tpl-calf-b", "ex-calf", "Elevación de gemelos", 3, 4, 12, 20, 50, 1, 75),
];

export const sampleTrainingDays: TrainingDay[] = [
  { id: "day-push", name: "Pecho + Hombros", weekday: 1, order: 1, exercises: pushExercises },
  { id: "day-lower", name: "Piernas", weekday: 2, order: 2, exercises: lowerExercises },
  { id: "day-pull", name: "Espalda", weekday: 3, order: 3, exercises: pullExercises },
  { id: "day-arms", name: "Brazos + Deltoides", weekday: 4, order: 4, exercises: armsExercises },
  { id: "day-posterior", name: "Femoral + Glúteos", weekday: 5, order: 5, exercises: posteriorExercises },
];

const toTarget = (item: ExerciseTemplate) => ({
  sets: item.sets,
  repRangeMin: item.repRangeMin,
  repRangeMax: item.repRangeMax,
  targetWeight: item.targetWeight,
  targetRir: item.targetRir,
  targetRpe: item.targetRpe,
  restSeconds: item.restSeconds,
  tempo: item.tempo,
  notes: item.notes,
  supersetGroup: item.supersetGroup,
});

const sessionExercise = (item: ExerciseTemplate, reps: number[], weight = item.targetWeight ?? 0): SessionExercise => ({
  id: `sx-${item.id}-${reps.join("-")}`,
  templateId: item.id,
  exerciseId: item.exerciseId,
  name: item.name,
  order: item.order,
  target: toTarget(item),
  sets: reps.map((repsValue, index) => ({
    id: `set-${item.id}-${index}`,
    order: index + 1,
    weight,
    reps: repsValue,
    rir: item.targetRir,
    restSeconds: item.restSeconds,
    completedAt: now,
  })),
});

const completedSession = (id: string, date: string, trainingDay: TrainingDay, exercises: SessionExercise[]): WorkoutSession => ({
  id,
  routineId: "routine-strong",
  routineName: "Fuerza + Hipertrofia",
  trainingDayId: trainingDay.id,
  trainingDayName: trainingDay.name,
  scheduledDate: date,
  startedAt: `${date}T17:30:00.000Z`,
  completedAt: `${date}T18:32:00.000Z`,
  status: "completed",
  block: "Hipertrofia",
  mesocycle: "Hipertrofia 1",
  microcycle: "Semana 3",
  exercises,
  notes: "Sesión sólida. Mantener técnica y buscar una repetición más.",
});

export const createSampleDatabase = (): FitnessDatabase => {
  const push = sampleTrainingDays[0];
  const lower = sampleTrainingDays[1];
  const pull = sampleTrainingDays[2];
  const posterior = sampleTrainingDays[4];

  const sessions = [
    completedSession("session-push-3", dateDaysAgo(24), push, [
      sessionExercise(pushExercises[0], [8, 8, 7, 6], 97.5),
      sessionExercise(pushExercises[1], [10, 10, 9], 30),
      sessionExercise(pushExercises[2], [16, 15, 14, 13], 10),
    ]),
    completedSession("session-lower-2", dateDaysAgo(17), lower, [
      sessionExercise(lowerExercises[0], [7, 7, 6, 6], 115),
      sessionExercise(lowerExercises[1], [14, 13, 12], 170),
      sessionExercise(lowerExercises[2], [14, 13, 12, 12], 50),
    ]),
    completedSession("session-pull-2", dateDaysAgo(15), pull, [
      sessionExercise(pullExercises[0], [9, 8, 8, 7], 77.5),
      sessionExercise(pullExercises[1], [12, 11, 10], 60),
      sessionExercise(pullExercises[2], [13, 12, 11], 12),
    ]),
    completedSession("session-push-2", dateDaysAgo(10), push, [
      sessionExercise(pushExercises[0], [9, 8, 8, 7], 100),
      sessionExercise(pushExercises[1], [11, 10, 10], 32),
      sessionExercise(pushExercises[2], [18, 16, 15, 14], 12),
    ]),
    completedSession("session-posterior-1", dateDaysAgo(7), posterior, [
      sessionExercise(posteriorExercises[0], [10, 9, 8, 8], 105),
      sessionExercise(posteriorExercises[1], [14, 13, 12], 47.5),
      sessionExercise(posteriorExercises[2], [18, 17, 16, 15], 47.5),
    ]),
    completedSession("session-push-1", dateDaysAgo(3), push, [
      sessionExercise(pushExercises[0], [10, 9, 8, 8], 100),
      sessionExercise(pushExercises[1], [12, 11, 10], 32),
      sessionExercise(pushExercises[2], [18, 17, 16, 15], 12),
    ]),
  ];

  return {
    schemaVersion: 1,
    updatedAt: now,
    profile: { id: "athlete-local", name: "Atleta", goal: "Fuerza e hipertrofia", unit: "kg", createdAt: now, updatedAt: now },
    settings: { theme: "dark", showRir: true, showRpe: true, prCelebration: true, firstRunCompleted: true },
    exercises: exerciseLibrary,
    routines: [{
      id: "routine-strong",
      name: "Fuerza + Hipertrofia",
      description: "Bloque principal de 5 días enfocado en progresión sostenible.",
      goal: "Hipertrofia",
      daysPerWeek: 5,
      startDate: dateDaysAgo(28),
      active: true,
      block: "Hipertrofia",
      mesocycle: "Hipertrofia 1",
      trainingDays: sampleTrainingDays,
      createdAt: now,
      updatedAt: now,
    }],
    sessions,
    measurements: [
      { id: "measure-1", date: dateDaysAgo(28), weight: 78.4, bodyFat: 16.8, waist: 80, chest: 101, rightBicep: 36.5 },
      { id: "measure-2", date: dateDaysAgo(14), weight: 78.9, bodyFat: 16.5, waist: 79.5, chest: 101.5, rightBicep: 36.8 },
      { id: "measure-3", date: dateDaysAgo(1), weight: 79.2, bodyFat: 16.2, waist: 79, chest: 102, rightBicep: 37.1 },
    ],
    records: [
      { id: "record-bench", exerciseId: "ex-bench", exerciseName: "Press banca", date: dateDaysAgo(3), weight: 100, reps: 10, type: "estimated_1rm", sourceSessionId: "session-push-1" },
      { id: "record-rdl", exerciseId: "ex-rdl", exerciseName: "Peso muerto rumano", date: dateDaysAgo(7), weight: 105, reps: 10, type: "weight", sourceSessionId: "session-posterior-1" },
    ],
  };
};
