import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { detectNewRecords, getWorkoutStats } from "@/features/analytics";
import {
  createSampleDatabase,
  exerciseLibrary,
  isoDate,
  makeId,
} from "@/features/sample-data";
import {
  buildSession,
  findTrainingDayForDate,
} from "@/features/session-generator";
import { openDb } from "../db";
import { exerciseRepository } from "../db/repositories/exercises";
import { routineRepository } from "../db/repositories/routines";
import { sessionRepository } from "../db/repositories/sessions";

import type {
  AppSettings,
  Exercise,
  ExerciseTemplate,
  FitnessDatabase,
  Measurement,
  PersonalRecord,
  Routine,
  TrainingDay,
  WorkoutSession,
  WorkoutSet,
} from "@/types/fitness";

interface FitnessContextValue {
  database: FitnessDatabase;
  hydrated: boolean;
  activeRoutine?: Routine;
  todayTrainingDay?: TrainingDay;
  todaySession?: WorkoutSession;
  stats: ReturnType<typeof getWorkoutStats>;
  loadExample: () => Promise<void>;
  startFromScratch: () => Promise<void>;
  createRoutine: (name?: string) => Promise<Routine>;
  updateRoutine: (routine: Routine) => Promise<void>;
  activateRoutine: (id: string) => Promise<void>;
  applyDeload: (routineId: string, reductionPercent: number) => Promise<void>;
  cancelDeload: (routineId: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<void>;
  addTrainingDay: (
    routineId: string,
    weekday: number,
    name: string,
  ) => Promise<void>;
  updateTemplate: (
    routineId: string,
    dayId: string,
    template: ExerciseTemplate,
  ) => Promise<void>;
  addExerciseToDay: (
    routineId: string,
    dayId: string,
    exercise: Exercise,
  ) => Promise<void>;
  createCustomExercise: (
    input: Pick<Exercise, "name" | "muscleGroups" | "equipment" | "category">,
  ) => Promise<Exercise>;
  removeCustomExercise: (id: string) => Promise<void>;
  startWorkout: (trainingDayId?: string) => Promise<string | undefined>;
  updateWorkoutSet: (
    sessionId: string,
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutSet>,
  ) => Promise<void>;
  finishWorkout: (
    sessionId: string,
    notes?: string,
  ) => Promise<PersonalRecord[]>;
  addMeasurement: (measurement: Omit<Measurement, "id">) => Promise<void>;
  addManualRecord: (record: Omit<PersonalRecord, "id">) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  completeOnboarding: (
    profile: Partial<FitnessDatabase["profile"]>,
    useExample: boolean,
  ) => Promise<void>;
  replaceDatabase: (database: FitnessDatabase) => Promise<void>;
  mergeDatabase: (database: FitnessDatabase) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const FitnessContext = createContext<FitnessContextValue | null>(null);

const createEmptyDatabase = (): FitnessDatabase => {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    updatedAt: now,
    profile: {
      id: "athlete-local",
      name: "Atleta",
      unit: "kg",
      createdAt: now,
      updatedAt: now,
    },
    settings: {
      theme: "dark",
      showRir: true,
      showRpe: true,
      prCelebration: true,
      firstRunCompleted: false,
      equipmentProfile: {
        barWeight: 20,
        availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25],
      },
    },
    exercises: [],
    routines: [],
    sessions: [],
    measurements: [],
    records: [],
  };
};

async function loadSettingsFromDb(): Promise<{ settings: AppSettings; profile: FitnessDatabase["profile"] }> {
  const db = await openDb();
  const record = await db.getFirstAsync(
    `SELECT value FROM settings WHERE key = 'app_state' LIMIT 1;`
  );
  
  const defaultDb = createEmptyDatabase();
  
  if (!record) {
    return { settings: defaultDb.settings, profile: defaultDb.profile };
  }
  
  try {
    const parsed = JSON.parse(record.value as string) as Partial<FitnessDatabase>;
    return {
      settings: parsed.settings ?? defaultDb.settings,
      profile: parsed.profile ?? defaultDb.profile,
    };
  } catch {
    return { settings: defaultDb.settings, profile: defaultDb.profile };
  }
}

async function saveSettingsToDb(settings: AppSettings, profile: FitnessDatabase["profile"]) {
  const db = await openDb();
  const now = Date.now();
  
  await db.runAsync(
    `INSERT INTO settings (key, value, updatedAt)
     VALUES ('app_state', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt;`,
    [JSON.stringify({ settings, profile }), now]
  );
}

export function FitnessProvider({ children }: PropsWithChildren) {
  const [database, setDatabase] =
    useState<FitnessDatabase>(createEmptyDatabase);
  const [hydrated, setHydrated] = useState(false);

  // Carga inicial desde SQLite relacional
  useEffect(() => {
    let mounted = true;

    const loadFromSQLite = async () => {
      try {
        const { settings: currentSettings, profile: currentProfile } = await loadSettingsFromDb();

        // Leer de las tablas reales relacionales
        const dbExercises = await exerciseRepository.getAll();
        const dbRoutines = await routineRepository.getAll();
        const dbSessions = await sessionRepository.getAll();

        const dbState: FitnessDatabase = {
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
          profile: currentProfile,
          settings: currentSettings,
          exercises: dbExercises,
          routines: dbRoutines,
          sessions: dbSessions,
          measurements: [],
          records: [],
        };

        // Si la base de datos está completamente vacía (ni siquiera la librería básica), la inicializamos
        if (dbExercises.length === 0) {
          await exerciseRepository.insertMany(exerciseLibrary);
          dbState.exercises = exerciseLibrary;
        }

        if (mounted) setDatabase(dbState);
      } catch (error) {
        console.warn("No se pudo recuperar la base local SQLite", error);
        if (mounted) setDatabase(createEmptyDatabase());
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    void loadFromSQLite();

    return () => { mounted = false; };
  }, []);

  const commit = useCallback(async (next: FitnessDatabase) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setDatabase(updated);

    // Guardar solo el perfil y config (las rutinas y sesiones van por repositorios)
    try {
      await saveSettingsToDb(updated.settings, updated.profile);
    } catch (e) {
      console.error("Error guardando estado en SQLite", e);
    }
  }, []);

  const activeRoutine = useMemo(
    () => database.routines.find((routine) => routine.active),
    [database.routines],
  );
  const todayTrainingDay = useMemo(
    () => findTrainingDayForDate(activeRoutine),
    [activeRoutine],
  );
  const todaySession = useMemo(
    () =>
      database.sessions.find(
        (session) =>
          session.scheduledDate === isoDate() &&
          session.trainingDayId === todayTrainingDay?.id &&
          session.status !== "completed",
      ),
    [database.sessions, todayTrainingDay?.id],
  );
  const stats = useMemo(
    () => getWorkoutStats(database.sessions, database.records),
    [database.sessions, database.records],
  );

  const loadExample = useCallback(async () => {
    const exampleDb = createSampleDatabase();
    await commit(exampleDb);
    // Sincronizar hacia SQLite relacional
    for (const r of exampleDb.routines) await routineRepository.insert(r);
    for (const s of exampleDb.sessions) await sessionRepository.insert(s);
  }, [commit]);

  const startFromScratch = useCallback(async () => {
    const empty = createEmptyDatabase();
    empty.settings.firstRunCompleted = true;
    empty.exercises = await exerciseRepository.getAll(); // Mantener librería base
    await commit(empty);
  }, [commit]);

  const createRoutine = useCallback(
    async (name = "Nueva rutina") => {
      const timestamp = new Date().toISOString();
      const routine: Routine = {
        id: makeId("routine"),
        name,
        goal: "Hipertrofia",
        daysPerWeek: 1,
        startDate: isoDate(),
        active: true,
        trainingDays: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const newRoutines = [
        ...database.routines.map((item) => ({ ...item, active: false })),
        routine,
      ];

      await commit({
        ...database,
        routines: newRoutines,
      });

      for (const r of newRoutines) {
        await routineRepository.insert(r);
      }

      return routine;
    },
    [commit, database],
  );

  const updateRoutine = useCallback(
    async (routine: Routine) => {
      const updatedRoutine = {
        ...routine,
        updatedAt: new Date().toISOString(),
        daysPerWeek: routine.trainingDays.length,
      };
      await commit({
        ...database,
        routines: database.routines.map((item) =>
          item.id === routine.id ? updatedRoutine : item,
        ),
      });
      await routineRepository.insert(updatedRoutine);
    },
    [commit, database],
  );

  const activateRoutine = useCallback(
    async (id: string) => {
      const newRoutines = database.routines.map((routine) => ({
        ...routine,
        active: routine.id === id,
        updatedAt: new Date().toISOString(),
      }));
      await commit({
        ...database,
        routines: newRoutines,
      });
      for (const r of newRoutines) {
        await routineRepository.insert(r);
      }
    },
    [commit, database],
  );

  const applyDeload = useCallback(
    async (routineId: string, reductionPercent: number) => {
      const routine = database.routines.find((item) => item.id === routineId);
      if (!routine || routine.deload) return;
      const originalSets: Record<string, number> = {};
      const trainingDays = routine.trainingDays.map((day) => ({
        ...day,
        exercises: day.exercises.map((template) => {
          originalSets[template.id] = template.sets;
          return {
            ...template,
            sets: Math.max(
              1,
              Math.ceil(template.sets * (1 - reductionPercent / 100)),
            ),
          };
        }),
      }));
      const updated = {
        ...routine,
        deload: {
          reductionPercent,
          startedAt: new Date().toISOString(),
          originalSets,
        },
        trainingDays,
        updatedAt: new Date().toISOString(),
      };
      await commit({
        ...database,
        routines: database.routines.map((item) =>
          item.id === routineId ? updated : item,
        ),
      });
      await routineRepository.insert(updated);
    },
    [commit, database],
  );

  const cancelDeload = useCallback(
    async (routineId: string) => {
      const routine = database.routines.find((item) => item.id === routineId);
      if (!routine?.deload) return;
      const trainingDays = routine.trainingDays.map((day) => ({
        ...day,
        exercises: day.exercises.map((template) => ({
          ...template,
          sets: routine.deload?.originalSets[template.id] ?? template.sets,
        })),
      }));
      const updated = {
        ...routine,
        deload: undefined,
        trainingDays,
        updatedAt: new Date().toISOString(),
      };
      await commit({
        ...database,
        routines: database.routines.map((item) =>
          item.id === routineId ? updated : item,
        ),
      });
      await routineRepository.insert(updated);
    },
    [commit, database],
  );

  const duplicateRoutine = useCallback(
    async (id: string) => {
      const original = database.routines.find((routine) => routine.id === id);
      if (!original) return;
      const timestamp = new Date().toISOString();
      const duplicate: Routine = {
        ...original,
        id: makeId("routine"),
        name: `${original.name} V2`,
        active: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        trainingDays: original.trainingDays.map((day) => ({
          ...day,
          id: makeId("day"),
          exercises: day.exercises.map((template) => ({
            ...template,
            id: makeId("template"),
          })),
        })),
      };
      await commit({
        ...database,
        routines: [...database.routines, duplicate],
      });
      await routineRepository.insert(duplicate);
    },
    [commit, database],
  );

  const addTrainingDay = useCallback(
    async (routineId: string, weekday: number, name: string) => {
      const routine = database.routines.find((item) => item.id === routineId);
      if (!routine) return;
      const day: TrainingDay = {
        id: makeId("day"),
        weekday,
        name,
        order: routine.trainingDays.length + 1,
        exercises: [],
      };
      await updateRoutine({
        ...routine,
        trainingDays: [...routine.trainingDays, day],
      });
    },
    [database.routines, updateRoutine],
  );

  const updateTemplate = useCallback(
    async (routineId: string, dayId: string, template: ExerciseTemplate) => {
      const routine = database.routines.find((item) => item.id === routineId);
      if (!routine) return;
      await updateRoutine({
        ...routine,
        trainingDays: routine.trainingDays.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: day.exercises.map((item) =>
                  item.id === template.id ? template : item,
                ),
              }
            : day,
        ),
      });
    },
    [database.routines, updateRoutine],
  );

  const addExerciseToDay = useCallback(
    async (routineId: string, dayId: string, exercise: Exercise) => {
      const routine = database.routines.find((item) => item.id === routineId);
      if (!routine) return;
      await updateRoutine({
        ...routine,
        trainingDays: routine.trainingDays.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  {
                    id: makeId("template"),
                    exerciseId: exercise.id,
                    name: exercise.name,
                    order: day.exercises.length + 1,
                    sets: 3,
                    repRangeMin: 8,
                    repRangeMax: 12,
                    targetWeight: 0,
                    targetRir: 2,
                    restSeconds: 120,
                  },
                ],
              }
            : day,
        ),
      });
    },
    [database.routines, updateRoutine],
  );

  const createCustomExercise = useCallback(
    async (
      input: Pick<Exercise, "name" | "muscleGroups" | "equipment" | "category">,
    ) => {
      const exercise: Exercise = {
        id: makeId("exercise"),
        ...input,
        isCustom: true,
      };
      await commit({
        ...database,
        exercises: [...database.exercises, exercise],
      });
      await exerciseRepository.insert(exercise);
      return exercise;
    },
    [commit, database],
  );

  const removeCustomExercise = useCallback(
    async (id: string) => {
      const exercise = database.exercises.find((item) => item.id === id);
      if (!exercise?.isCustom) return;
      await commit({
        ...database,
        exercises: database.exercises.filter((item) => item.id !== id),
      });
      await exerciseRepository.removeCustom(id);
    },
    [commit, database],
  );

  const startWorkout = useCallback(
    async (trainingDayId?: string) => {
      const routine = activeRoutine;
      const day =
        routine?.trainingDays.find((item) => item.id === trainingDayId) ??
        (trainingDayId ? undefined : todayTrainingDay);
      if (!routine || !day) return undefined;
      const existing = database.sessions.find(
        (session) =>
          session.scheduledDate === isoDate() &&
          session.trainingDayId === day.id &&
          session.status !== "completed",
      );
      const session = existing ?? buildSession(routine, day, database.sessions);
      const running = {
        ...session,
        status: "in_progress" as const,
        startedAt: session.startedAt ?? new Date().toISOString(),
      };
      await commit({
        ...database,
        sessions: existing
          ? database.sessions.map((item) =>
              item.id === running.id ? running : item,
            )
          : [...database.sessions, running],
      });
      await sessionRepository.insert(running);
      return running.id;
    },
    [activeRoutine, commit, database, todayTrainingDay],
  );

  const updateWorkoutSet = useCallback(
    async (
      sessionId: string,
      exerciseId: string,
      setId: string,
      patch: Partial<WorkoutSet>,
    ) => {
      const updatedSessions = database.sessions.map((session) =>
        session.id !== sessionId
          ? session
          : {
              ...session,
              exercises: session.exercises.map((exercise) =>
                exercise.id !== exerciseId
                  ? exercise
                  : {
                      ...exercise,
                      sets: exercise.sets.map((set) =>
                        set.id === setId ? { ...set, ...patch } : set,
                      ),
                    },
              ),
            },
      );
      await commit({
        ...database,
        sessions: updatedSessions,
      });

      const session = updatedSessions.find((s) => s.id === sessionId);
      if (session) await sessionRepository.insert(session);
    },
    [commit, database],
  );

  const finishWorkout = useCallback(
    async (sessionId: string, notes?: string) => {
      const current = database.sessions.find(
        (session) => session.id === sessionId,
      );
      if (!current) return [];
      const completed: WorkoutSession = {
        ...current,
        status: "completed",
        completedAt: new Date().toISOString(),
        notes: notes ?? current.notes,
      };
      const newRecords = detectNewRecords(
        completed,
        database.sessions.filter((session) => session.id !== sessionId),
        database.records,
      );
      await commit({
        ...database,
        sessions: database.sessions.map((session) =>
          session.id === sessionId ? completed : session,
        ),
        records: [...database.records, ...newRecords],
      });
      await sessionRepository.insert(completed);
      return newRecords;
    },
    [commit, database],
  );

  const addMeasurement = useCallback(
    async (measurement: Omit<Measurement, "id">) => {
      await commit({
        ...database,
        measurements: [
          { id: makeId("measurement"), ...measurement },
          ...database.measurements,
        ],
      });
    },
    [commit, database],
  );

  const addManualRecord = useCallback(
    async (record: Omit<PersonalRecord, "id">) => {
      await commit({
        ...database,
        records: [{ id: makeId("record"), ...record }, ...database.records],
      });
    },
    [commit, database],
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      await commit({
        ...database,
        settings: { ...database.settings, ...patch },
      });
    },
    [commit, database],
  );

  const updateProfile = useCallback(
    async (name: string) => {
      await commit({
        ...database,
        profile: {
          ...database.profile,
          name,
          updatedAt: new Date().toISOString(),
        },
      });
    },
    [commit, database],
  );

  const completeOnboarding = useCallback(
    async (
      profilePatch: Partial<FitnessDatabase["profile"]>,
      useExample: boolean,
    ) => {
      const base = useExample ? createSampleDatabase() : createEmptyDatabase();
      base.profile = {
        ...base.profile,
        ...profilePatch,
        updatedAt: new Date().toISOString(),
      };
      base.settings.firstRunCompleted = true;

      if (profilePatch.weight) {
        base.measurements.push({
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          weight: profilePatch.weight,
        });
      }

      if (useExample) {
        for (const r of base.routines) await routineRepository.insert(r);
        for (const s of base.sessions) await sessionRepository.insert(s);
      }

      await commit(base);
    },
    [commit],
  );

  const replaceDatabase = useCallback(
    async (incoming: FitnessDatabase) => {
      await commit({ ...incoming, schemaVersion: 1 });
    },
    [commit],
  );

  const mergeDatabase = useCallback(
    async (incoming: FitnessDatabase) => {
      const mergeCollection = <T extends { id: string }>(
        current: T[],
        imported: T[],
      ) => {
        const map = new Map(current.map((item) => [item.id, item]));
        imported.forEach((item) => map.set(item.id, item));
        return [...map.values()];
      };
      await commit({
        ...database,
        exercises: mergeCollection(database.exercises, incoming.exercises),
        routines: mergeCollection(database.routines, incoming.routines),
        sessions: mergeCollection(database.sessions, incoming.sessions),
        measurements: mergeCollection(
          database.measurements,
          incoming.measurements,
        ),
        records: mergeCollection(database.records, incoming.records),
      });
    },
    [commit, database],
  );

  const resetDatabase = useCallback(async () => {
    await commit(createEmptyDatabase());
  }, [commit]);

  const value = useMemo<FitnessContextValue>(
    () => ({
      database,
      hydrated,
      activeRoutine,
      todayTrainingDay,
      todaySession,
      stats,
      loadExample,
      startFromScratch,
      createRoutine,
      updateRoutine,
      activateRoutine,
      applyDeload,
      cancelDeload,
      duplicateRoutine,
      addTrainingDay,
      updateTemplate,
      addExerciseToDay,
      createCustomExercise,
      removeCustomExercise,
      startWorkout,
      updateWorkoutSet,
      finishWorkout,
      addMeasurement,
      addManualRecord,
      updateSettings,
      updateProfile,
      completeOnboarding,
      replaceDatabase,
      mergeDatabase,
      resetDatabase,
    }),
    [
      database,
      hydrated,
      activeRoutine,
      todayTrainingDay,
      todaySession,
      stats,
      loadExample,
      startFromScratch,
      createRoutine,
      updateRoutine,
      activateRoutine,
      applyDeload,
      cancelDeload,
      duplicateRoutine,
      addTrainingDay,
      updateTemplate,
      addExerciseToDay,
      createCustomExercise,
      removeCustomExercise,
      startWorkout,
      updateWorkoutSet,
      finishWorkout,
      addMeasurement,
      addManualRecord,
      updateSettings,
      updateProfile,
      completeOnboarding,
      replaceDatabase,
      mergeDatabase,
      resetDatabase,
    ],
  );

  return (
    <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
  );
}

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context)
    throw new Error("useFitness debe utilizarse dentro de FitnessProvider");
  return context;
};