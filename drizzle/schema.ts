import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/**
 * ForgeFit - Offline First SQLite Schema
 */

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  goal: text("goal"),
  active: integer("active", { mode: "boolean" }).default(false).notNull(),
  daysPerWeek: integer("daysPerWeek"),
  startDate: text("startDate"),
  endDate: text("endDate"),
  currentVersionId: text("currentVersionId"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const routineVersions = sqliteTable("routineVersions", {
  id: text("id").primaryKey(),
  routineId: text("routineId")
    .references(() => routines.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("versionNumber").notNull(),
  effectiveFrom: text("effectiveFrom"),
  effectiveTo: text("effectiveTo"),
  notes: text("notes"),
  mesocycleId: text("mesocycleId"),
  microcycleId: text("microcycleId"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const trainingDays = sqliteTable("trainingDays", {
  id: text("id").primaryKey(),
  routineVersionId: text("routineVersionId")
    .references(() => routineVersions.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  dayOfWeek: integer("dayOfWeek"), // 0-6 or null for rolling schedules
  order: integer("order").notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  aliases: text("aliases", { mode: "json" }), // array of strings
  category: text("category"), // compound, isolation, machine, etc.
  muscleGroups: text("muscleGroups", { mode: "json" }), // array of strings (legacy)
  directMuscles: text("directMuscles", { mode: "json" }), // array of strings
  secondaryMuscles: text("secondaryMuscles", { mode: "json" }), // array of strings
  equipment: text("equipment"),
  videoUrl: text("videoUrl"),
  instructions: text("instructions"),
  notes: text("notes"),
  isCustom: integer("isCustom", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const exerciseTemplates = sqliteTable("exerciseTemplates", {
  id: text("id").primaryKey(),
  trainingDayId: text("trainingDayId")
    .references(() => trainingDays.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: text("exerciseId")
    .references(() => exercises.id)
    .notNull(),
  order: integer("order").notNull(),
  sets: integer("sets").notNull(),
  repRangeMin: integer("repRangeMin"),
  repRangeMax: integer("repRangeMax"),
  targetWeight: real("targetWeight"),
  targetRIRMin: integer("targetRIRMin"),
  targetRIRMax: integer("targetRIRMax"),
  targetRPE: real("targetRPE"),
  restMinSeconds: integer("restMinSeconds"),
  restMaxSeconds: integer("restMaxSeconds"),
  tempo: text("tempo"),
  progressionType: text("progressionType"),
  progressionConfig: text("progressionConfig", { mode: "json" }),
  supersetGroup: text("supersetGroup"), // ID linking exercises in a superset
  priority: text("priority"),
  notes: text("notes"),
  enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  routineId: text("routineId"),
  routineVersionId: text("routineVersionId"),
  trainingDayId: text("trainingDayId"),
  date: text("date").notNull(), // ISO string YYYY-MM-DD
  status: text("status").notNull(), // scheduled, in_progress, completed, skipped
  startedAt: text("startedAt"),
  completedAt: text("completedAt"),
  durationSeconds: integer("durationSeconds"),
  sessionNotes: text("sessionNotes"),
  recoveryContext: text("recoveryContext", { mode: "json" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const sessionExercises = sqliteTable("sessionExercises", {
  id: text("id").primaryKey(),
  sessionId: text("sessionId")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: text("exerciseId")
    .references(() => exercises.id)
    .notNull(),
  templateSnapshot: text("templateSnapshot", { mode: "json" }),
  order: integer("order").notNull(),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const setLogs = sqliteTable("setLogs", {
  id: text("id").primaryKey(),
  sessionExerciseId: text("sessionExerciseId")
    .references(() => sessionExercises.id, { onDelete: "cascade" })
    .notNull(),
  setNumber: integer("setNumber").notNull(),
  type: text("type").default("working").notNull(), // warmup, working, dropset, failure
  plannedWeight: real("plannedWeight"),
  plannedRepsMin: integer("plannedRepsMin"),
  plannedRepsMax: integer("plannedRepsMax"),
  plannedRIR: integer("plannedRIR"),
  actualWeight: real("actualWeight"),
  actualReps: integer("actualReps"),
  actualRIR: integer("actualRIR"),
  actualRPE: real("actualRPE"),
  techniqueRating: text("techniqueRating"), // Excellent, Acceptable, Poor
  restPlannedSeconds: integer("restPlannedSeconds"),
  restActualSeconds: integer("restActualSeconds"),
  completedAt: text("completedAt"),
  skipped: integer("skipped", { mode: "boolean" }).default(false).notNull(),
});

export const measurements = sqliteTable("measurements", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  weight: real("weight"),
  bodyFatPercentage: real("bodyFatPercentage"),
  values: text("values", { mode: "json" }), // extra measurements
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const personalRecords = sqliteTable("personalRecords", {
  id: text("id").primaryKey(),
  exerciseId: text("exerciseId")
    .references(() => exercises.id, { onDelete: "cascade" })
    .notNull(),
  sessionId: text("sessionId"),
  recordType: text("recordType").notNull(), // weight, reps, volume, estimated1RM
  weight: real("weight"),
  reps: integer("reps"),
  volume: real("volume"),
  estimatedPerformance: real("estimatedPerformance"),
  achievedAt: text("achievedAt").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

import { relations } from "drizzle-orm";

export const routinesRelations = relations(routines, ({ many }) => ({
  versions: many(routineVersions),
}));

export const routineVersionsRelations = relations(
  routineVersions,
  ({ one, many }) => ({
    routine: one(routines, {
      fields: [routineVersions.routineId],
      references: [routines.id],
    }),
    trainingDays: many(trainingDays),
  }),
);

export const trainingDaysRelations = relations(
  trainingDays,
  ({ one, many }) => ({
    version: one(routineVersions, {
      fields: [trainingDays.routineVersionId],
      references: [routineVersions.id],
    }),
    exerciseTemplates: many(exerciseTemplates),
  }),
);

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ one }) => ({
    trainingDay: one(trainingDays, {
      fields: [exerciseTemplates.trainingDayId],
      references: [trainingDays.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseTemplates.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const exercisesRelations = relations(exercises, ({ many }) => ({
  templates: many(exerciseTemplates),
  sessionExercises: many(sessionExercises),
  personalRecords: many(personalRecords),
}));

export const sessionsRelations = relations(sessions, ({ many }) => ({
  sessionExercises: many(sessionExercises),
}));

export const sessionExercisesRelations = relations(
  sessionExercises,
  ({ one, many }) => ({
    session: one(sessions, {
      fields: [sessionExercises.sessionId],
      references: [sessions.id],
    }),
    exercise: one(exercises, {
      fields: [sessionExercises.exerciseId],
      references: [exercises.id],
    }),
    setLogs: many(setLogs),
  }),
);

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [setLogs.sessionExerciseId],
    references: [sessionExercises.id],
  }),
}));
