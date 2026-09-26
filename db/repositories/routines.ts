import { db } from "../../drizzle/client";
import {
  routines,
  routineVersions,
  trainingDays,
  exerciseTemplates,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type {
  Routine,
  TrainingDay,
  ExerciseTemplate,
} from "../../types/fitness";

export const routineRepository = {
  async getAll(): Promise<Routine[]> {
    // Note: Due to SQLite not having deep nested JSON natively easily queryable in Drizzle
    // without raw SQL, we do a multi-query fetch. This is fast locally.
    const allRoutines = await db.select().from(routines);
    const allVersions = await db.select().from(routineVersions);
    const allDays = await db.select().from(trainingDays);
    const allTemplates = await db.select().from(exerciseTemplates);

    return allRoutines.map((r: any) => {
      // Find the active/current version (we'll just take the latest one for simplicity or match by ID)
      const version = allVersions.find((v: any) => v.routineId === r.id);

      const days = version
        ? allDays.filter((d: any) => d.routineVersionId === version.id)
        : [];

      const mappedDays: TrainingDay[] = days.map((d: any) => {
        const templates = allTemplates.filter(
          (t: any) => t.trainingDayId === d.id,
        );

        return {
          id: d.id,
          weekday: d.dayOfWeek ?? 1,
          name: d.name,
          order: d.order,
          exercises: templates.map((t: any) => ({
            id: t.id,
            exerciseId: t.exerciseId,
            name: "Unknown", // Will be resolved by UI
            order: t.order,
            sets: t.sets,
            repRangeMin: t.repRangeMin ?? 1,
            repRangeMax: t.repRangeMax ?? 1,
            targetWeight: t.targetWeight ?? undefined,
            targetRir: t.targetRIRMin ?? undefined,
            targetRpe: t.targetRPE ?? undefined,
            restSeconds: t.restMinSeconds ?? 60,
            notes: t.notes ?? undefined,
          })),
        };
      });

      return {
        id: r.id,
        name: r.name,
        goal: r.goal ?? "",
        active: r.active,
        daysPerWeek: r.daysPerWeek ?? 0,
        startDate: r.startDate ?? "",
        trainingDays: mappedDays,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });
  },

  async insert(routine: Routine): Promise<void> {
    // 1. Insert Routine
    await db
      .insert(routines)
      .values({
        id: routine.id,
        name: routine.name,
        goal: routine.goal,
        active: routine.active ?? false,
        daysPerWeek: routine.daysPerWeek,
        startDate: routine.startDate,
        currentVersionId: routine.id + "-v1", // Simplified versioning
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: routines.id,
        set: {
          name: routine.name,
          goal: routine.goal,
          active: routine.active ?? false,
          daysPerWeek: routine.daysPerWeek,
          updatedAt: new Date(),
        },
      });

    // 2. Insert Version
    const versionId = routine.id + "-v1";
    await db
      .insert(routineVersions)
      .values({
        id: versionId,
        routineId: routine.id,
        versionNumber: 1,
        createdAt: new Date(),
      })
      .onConflictDoNothing();

    // 3. Delete existing days/templates for this version to replace them cleanly
    await db
      .delete(trainingDays)
      .where(eq(trainingDays.routineVersionId, versionId));

    // 4. Insert Days & Templates
    for (const day of routine.trainingDays) {
      await db.insert(trainingDays).values({
        id: day.id,
        routineVersionId: versionId,
        name: day.name,
        dayOfWeek: day.weekday,
        order: day.order ?? 1,
      });

      if (day.exercises.length > 0) {
        await db.insert(exerciseTemplates).values(
          day.exercises.map((t, idx) => ({
            id: t.id,
            trainingDayId: day.id,
            exerciseId: t.exerciseId,
            order: t.order ?? idx + 1,
            sets: t.sets,
            repRangeMin: t.repRangeMin,
            repRangeMax: t.repRangeMax,
            targetWeight: t.targetWeight,
            targetRIRMin: t.targetRir,
            targetRPE: t.targetRpe,
            restMinSeconds: t.restSeconds,
            notes: t.notes,
            enabled: true,
          })),
        );
      }
    }
  },
};
