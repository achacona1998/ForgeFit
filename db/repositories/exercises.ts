import { db } from "../../drizzle/client";
import { exercises } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { Exercise } from "../../types/fitness";

export const exerciseRepository = {
  async getAll(): Promise<Exercise[]> {
    const records = await db.select().from(exercises);
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category ?? "",
      muscleGroups: (r.muscleGroups as string[] | null) ?? [],
      equipment: r.equipment ?? "",
      instructions: r.instructions || undefined,
      isCustom: r.isCustom,
    }));
  },

  async insert(exercise: Exercise): Promise<void> {
    await db
      .insert(exercises)
      .values({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        isCustom: exercise.isCustom ?? false,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: exercises.id,
        set: {
          name: exercise.name,
          category: exercise.category,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          isCustom: exercise.isCustom ?? false,
        },
      });
  },

  async insertMany(exerciseList: Exercise[]): Promise<void> {
    if (exerciseList.length === 0) return;

    // SQLite has a limit on variables per insert, batching might be needed for huge arrays
    // but for standard libraries < 1000 items this is fine
    await db
      .insert(exercises)
      .values(
        exerciseList.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          muscleGroups: e.muscleGroups,
          equipment: e.equipment,
          instructions: e.instructions,
          isCustom: e.isCustom ?? false,
          createdAt: new Date(),
        })),
      )
      .onConflictDoNothing(); // If it exists (e.g. sample data), skip it
  },

  async removeCustom(id: string): Promise<void> {
    await db.delete(exercises).where(eq(exercises.id, id));
  },
};
