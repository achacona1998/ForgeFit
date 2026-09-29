import { openDb } from "@/db";
import type { Exercise } from "@/types/fitness";
import type { Db } from "@/db";

function mapRow(r: any): Exercise {
  return {
    id: r.id,
    name: r.name,
    aliases: r.aliases ? JSON.parse(r.aliases) : undefined,
    category: r.category ?? "",
    muscleGroups: r.muscleGroups ? JSON.parse(r.muscleGroups) : [],
    directMuscles: r.directMuscles ? JSON.parse(r.directMuscles) : undefined,
    secondaryMuscles: r.secondaryMuscles ? JSON.parse(r.secondaryMuscles) : undefined,
    equipment: r.equipment ?? "",
    videoUrl: r.videoUrl || undefined,
    instructions: r.instructions || undefined,
    notes: r.notes || undefined,
    isCustom: Boolean(r.isCustom),
  };
}

function toJson(arr: string[] | undefined): string | null {
  return arr && arr.length > 0 ? JSON.stringify(arr) : null;
}

export const exerciseRepository = {
  async getAll(): Promise<Exercise[]> {
    const db = await openDb();
    const records = await db.getAllAsync("SELECT * FROM exercises ORDER BY name;");
    return records.map(mapRow);
  },

  async insert(exercise: Exercise, db?: Db): Promise<void> {
    const database = db ?? await openDb();
    const now = Date.now();

    await database.runAsync(
      `INSERT INTO exercises (id, name, aliases, category, muscleGroups, directMuscles, secondaryMuscles, equipment, videoUrl, instructions, notes, isCustom, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         aliases = excluded.aliases,
         category = excluded.category,
         muscleGroups = excluded.muscleGroups,
         directMuscles = excluded.directMuscles,
         secondaryMuscles = excluded.secondaryMuscles,
         equipment = excluded.equipment,
         videoUrl = excluded.videoUrl,
         instructions = excluded.instructions,
         notes = excluded.notes,
         isCustom = excluded.isCustom;`,
      [
        exercise.id,
        exercise.name,
        toJson(exercise.aliases),
        exercise.category,
        toJson(exercise.muscleGroups),
        toJson(exercise.directMuscles),
        toJson(exercise.secondaryMuscles),
        exercise.equipment,
        exercise.videoUrl ?? null,
        exercise.instructions ?? null,
        exercise.notes ?? null,
        exercise.isCustom ? 1 : 0,
        now,
      ]
    );
  },

  async insertMany(exerciseList: Exercise[]): Promise<void> {
    if (exerciseList.length === 0) return;

    const db = await openDb();
    await db.execAsync("BEGIN;");
    try {
      for (const e of exerciseList) {
        await this.insert(e, db);
      }
      await db.execAsync("COMMIT;");
    } catch (e) {
      await db.execAsync("ROLLBACK;");
      throw e;
    }
  },

  async removeCustom(id: string): Promise<void> {
    const db = await openDb();
    await db.runAsync("DELETE FROM exercises WHERE id = ? AND isCustom = 1;", [id]);
  },
};