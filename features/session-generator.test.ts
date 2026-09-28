import { describe, it, expect } from "vitest";
import { buildSession, findTrainingDayForDate } from "./session-generator";
import type { Routine, TrainingDay, WorkoutSession } from "@/types/fitness";

describe("session-generator", () => {
  const mockTrainingDay: TrainingDay = {
    id: "td-1",
    name: "Push Day",
    weekday: 1, // Monday
    exercises: [
      {
        id: "ex-tpl-1",
        exerciseId: "ex-1",
        name: "Bench Press",
        order: 1,
        sets: 3,
        repRangeMin: 8,
        repRangeMax: 12,
        targetWeight: 60,
        targetRir: 2,
        restSeconds: 90,
      },
    ],
  };

  const mockRoutine: Routine = {
    id: "r-1",
    name: "Hypertrophy Block",
    block: "Block 1",
    mesocycle: "Meso 1",
    trainingDays: [mockTrainingDay],
    daysPerWeek: 4,
    isActive: true,
  };

  describe("buildSession", () => {
    it("should build a new session based on the template", () => {
      const existingSessions: WorkoutSession[] = [];
      const scheduledDate = "2023-10-10";

      const session = buildSession(mockRoutine, mockTrainingDay, existingSessions, scheduledDate);

      expect(session.id).toBeDefined();
      expect(session.routineId).toBe(mockRoutine.id);
      expect(session.trainingDayId).toBe(mockTrainingDay.id);
      expect(session.status).toBe("scheduled");
      expect(session.exercises).toHaveLength(1);

      const sessionEx = session.exercises[0];
      expect(sessionEx.exerciseId).toBe("ex-1");
      expect(sessionEx.sets).toHaveLength(3);
      
      // Default suggested weight/reps should come from template since no history exists
      expect(sessionEx.sets[0].weight).toBe(60);
      expect(sessionEx.sets[0].reps).toBe(8);
      expect(sessionEx.sets[0].rir).toBe(2);
    });

    it("should inherit performance from previous sessions", () => {
      const existingSessions: WorkoutSession[] = [
        {
          id: "s-old",
          routineId: mockRoutine.id,
          routineName: mockRoutine.name,
          trainingDayId: mockTrainingDay.id,
          trainingDayName: mockTrainingDay.name,
          scheduledDate: "2023-10-01",
          status: "completed",
          completedAt: "2023-10-01",
          block: "Block 1",
          mesocycle: "Meso 1",
          exercises: [
            {
              id: "se-old-1",
              templateId: "ex-tpl-1",
              exerciseId: "ex-1",
              name: "Bench Press",
              order: 1,
              target: mockTrainingDay.exercises[0],
              sets: [
                { id: "set-1", order: 1, weight: 65, reps: 10, rir: 1, restSeconds: 90, completedAt: "time" }
              ]
            }
          ]
        }
      ];

      const session = buildSession(mockRoutine, mockTrainingDay, existingSessions, "2023-10-10");
      const sessionEx = session.exercises[0];

      // Weight and reps should inherit from the completed session, not the template
      expect(sessionEx.sets[0].weight).toBe(65);
      expect(sessionEx.sets[0].reps).toBe(10);
      expect(sessionEx.sets[0].rir).toBe(1);
      expect(sessionEx.previousPerformance).toBeDefined();
    });
  });

  describe("findTrainingDayForDate", () => {
    it("should find the correct training day based on weekday", () => {
      const monday = new Date("2023-10-09T12:00:00Z"); // Oct 9 2023 was a Monday
      const day = findTrainingDayForDate(mockRoutine, monday);
      expect(day).toBeDefined();
      expect(day?.name).toBe("Push Day");
    });

    it("should return undefined if no training day is scheduled for that weekday", () => {
      const tuesday = new Date("2023-10-10T12:00:00Z"); // Tuesday
      const day = findTrainingDayForDate(mockRoutine, tuesday);
      expect(day).toBeUndefined();
    });
  });
});