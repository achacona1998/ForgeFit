import { openDb } from "@/db";
import type { Routine, TrainingDay, ExerciseTemplate } from "@/types/fitness";
import type { Db } from "@/db";

function mapRoutineRow(r: any): Routine {
  return {
    id: r.id,
    name: r.name,
    goal: r.goal ?? "",
    active: Boolean(r.active),
    daysPerWeek: r.daysPerWeek ?? 0,
    startDate: r.startDate ?? "",
    trainingDays: [],
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  };
}

export const routineRepository = {
  async getAll(): Promise<Routine[]> {
    const db = await openDb();

    const routines = await db.getAllAsync(`
      SELECT * FROM routines ORDER BY updatedAt DESC;
    `);

    const result: Routine[] = [];

    for (const r of routines) {
      const routine = mapRoutineRow(r);

      // Get current version
      const version = await db.getFirstAsync(
        `SELECT * FROM routineVersions WHERE routineId = ? ORDER BY versionNumber DESC LIMIT 1;`,
        [routine.id]
      );

      if (!version) {
        result.push(routine);
        continue;
      }

      // Get training days for this version
      const days = await db.getAllAsync(
        `SELECT * FROM trainingDays WHERE routineVersionId = ? ORDER BY "order";`,
        [version.id]
      );

      routine.trainingDays = [];

      for (const day of days) {
        const templates = await db.getAllAsync(
          `SELECT * FROM exerciseTemplates WHERE trainingDayId = ? ORDER BY "order";`,
          [day.id]
        );

        const mappedDay: TrainingDay = {
          id: day.id,
          weekday: day.dayOfWeek ?? 1,
          name: day.name,
          order: day.order,
          exercises: templates.map((t) => ({
            id: t.id,
            exerciseId: t.exerciseId,
            name: "Unknown",
            order: t.order,
            sets: t.sets,
            repRangeMin: t.repRangeMin ?? 1,
            repRangeMax: t.repRangeMax ?? 1,
            targetWeight: t.targetWeight ?? undefined,
            targetRir: t.targetRIRMin ?? undefined,
            targetRpe: t.targetRPE ?? undefined,
            restSeconds: t.restMinSeconds ?? 60,
            notes: t.notes ?? undefined,
            progressionConfig: t.progressionConfig ? JSON.parse(t.progressionConfig) : undefined,
          })),
        };

        routine.trainingDays.push(mappedDay);
      }

      result.push(routine);
    }

    return result;
  },

  async insert(routine: Routine): Promise<void> {
    const db = await openDb();
    const now = Date.now();
    const versionId = routine.id + "-v1";

    await db.execAsync("BEGIN;");
    try {
      // 1. Insert/Update Routine
      await db.runAsync(
        `INSERT INTO routines (id, name, goal, active, daysPerWeek, startDate, currentVersionId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           goal = excluded.goal,
           active = excluded.active,
           daysPerWeek = excluded.daysPerWeek,
           updatedAt = excluded.updatedAt;`,
        [
          routine.id,
          routine.name,
          routine.goal ?? null,
          routine.active ? 1 : 0,
          routine.daysPerWeek ?? null,
          routine.startDate ?? null,
          versionId,
          now,
          now,
        ]
      );

      // 2. Insert Version
      await db.runAsync(
        `INSERT INTO routineVersions (id, routineId, versionNumber, createdAt)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING;`,
        [versionId, routine.id, 1, now]
      );

      // 3. Delete existing days/templates for this version
      await db.runAsync(
        `DELETE FROM trainingDays WHERE routineVersionId = ?;`,
        [versionId]
      );

      // 4. Insert Days & Templates
      for (const day of routine.trainingDays) {
        await db.runAsync(
          `INSERT INTO trainingDays (id, routineVersionId, name, dayOfWeek, "order")
           VALUES (?, ?, ?, ?, ?);`,
          [day.id, versionId, day.name, day.weekday ?? null, day.order ?? 1]
        );

        if (day.exercises.length > 0) {
          for (const [idx, t] of day.exercises.entries()) {
            await db.runAsync(
              `INSERT INTO exerciseTemplates (id, trainingDayId, exerciseId, "order", sets, repRangeMin, repRangeMax, targetWeight, targetRIRMin, targetRPE, restMinSeconds, notes, progressionConfig, enabled)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [
                t.id,
                day.id,
                t.exerciseId,
                t.order ?? idx + 1,
                t.sets,
                t.repRangeMin ?? 1,
                t.repRangeMax ?? 1,
                t.targetWeight ?? null,
                t.targetRir ?? null,
                t.targetRpe ?? null,
                t.restSeconds ?? 60,
                t.notes ?? null,
                t.progressionConfig ? JSON.stringify(t.progressionConfig) : null,
                1,
              ]
            );
          }
        }
      }

      await db.execAsync("COMMIT;");
    } catch (e) {
      await db.execAsync("ROLLBACK;");
      throw e;
    }
  },
};