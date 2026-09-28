import { db } from "../../drizzle/client";
import { sessions, sessionExercises, setLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { WorkoutSession, WorkoutSet } from "../../types/fitness";

export const sessionRepository = {
  async getAll(): Promise<WorkoutSession[]> {
    const allSessions = await db.query.sessions.findMany({
      with: {
        sessionExercises: {
          with: {
            setLogs: true,
          },
        },
      },
    });

    return allSessions.map((s) => {
      return {
        id: s.id,
        routineId: s.routineId ?? "",
        routineName: "Rutina Local",
        trainingDayId: s.trainingDayId ?? "",
        trainingDayName: "Día Local",
        scheduledDate: s.date,
        startedAt: s.startedAt ?? undefined,
        completedAt: s.completedAt ?? undefined,
        status:
          (s.status as "scheduled" | "in_progress" | "completed" | "skipped") ||
          "scheduled",
        notes: s.sessionNotes ?? undefined,
        exercises: s.sessionExercises.map((e) => {
          return {
            id: e.id,
            exerciseId: e.exerciseId,
            name: "Unknown", // Will be resolved
            target: { sets: 0, repRangeMin: 1, repRangeMax: 1, restSeconds: 0 },
            templateId: "", // Optional, ignored for now
            order: e.order,
            sets: e.setLogs.map((set) => ({
              id: set.id,
              order: set.setNumber,
              type:
                (set.type as "warmup" | "working" | "dropset" | "failure") ||
                "working",
              weight: set.actualWeight ?? 0,
              reps: set.actualReps ?? 0,
              rir: set.actualRIR ?? undefined,
              rpe: set.actualRPE ?? undefined,
              completedAt: set.completedAt ?? undefined,
              restSeconds: set.restActualSeconds ?? 0,
            })),
          };
        }),
      };
    });
  },

  async insert(session: WorkoutSession): Promise<void> {
    await db
      .insert(sessions)
      .values({
        id: session.id,
        routineId: session.routineId,
        trainingDayId: session.trainingDayId,
        date: session.scheduledDate,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        sessionNotes: session.notes,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: sessions.id,
        set: {
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          sessionNotes: session.notes,
        },
      });

    // Replace exercises and sets (simplified sync logic)
    await db
      .delete(sessionExercises)
      .where(eq(sessionExercises.sessionId, session.id));

    for (const ex of session.exercises) {
      await db.insert(sessionExercises).values({
        id: ex.id,
        sessionId: session.id,
        exerciseId: ex.exerciseId,
        order: ex.order,
        createdAt: new Date(),
      });

      if (ex.sets.length > 0) {
        await db.insert(setLogs).values(
          ex.sets.map((s) => ({
            id: s.id,
            sessionExerciseId: ex.id,
            setNumber: s.order,
            type: s.type || "working",
            actualWeight: s.weight,
            actualReps: s.reps,
            actualRIR: s.rir,
            actualRPE: s.rpe,
            restActualSeconds: s.restSeconds,
            completedAt: s.completedAt ?? null,
            skipped: false,
          })),
        );
      }
    }
  },
};
