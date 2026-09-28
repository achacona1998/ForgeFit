import { describe, it, expect } from "vitest";
import { 
  suggestNextProgression, 
  calculateSessionTSS, 
  calculateACWR 
} from "./progression-engine";
import type { SessionExercise, WorkoutSession } from "@/types/fitness";

describe("progression-engine", () => {
  describe("suggestNextProgression", () => {
    const template = {
      repRangeMin: 8,
      repRangeMax: 12,
      targetWeight: 50,
      targetRir: 2,
      sets: 3,
    };

    it("should suggest to increase weight if all top reps are hit with good RIR", () => {
      const latest: SessionExercise = {
        id: "se-1",
        templateId: "tpl-1",
        exerciseId: "ex-1",
        name: "Squat",
        order: 1,
        target: template,
        sets: [
          { id: "set-1", order: 1, weight: 50, reps: 12, rir: 2, restSeconds: 60, completedAt: "time" },
          { id: "set-2", order: 2, weight: 50, reps: 12, rir: 2, restSeconds: 60, completedAt: "time" },
          { id: "set-3", order: 3, weight: 50, reps: 12, rir: 3, restSeconds: 60, completedAt: "time" },
        ]
      };

      const suggestion = suggestNextProgression(template, latest, 2.5);
      
      expect(suggestion.kind).toBe("increase_weight");
      expect(suggestion.nextWeight).toBe(52.5);
    });

    it("should suggest adding reps if max reps not hit but RIR is good", () => {
      const latest: SessionExercise = {
        id: "se-1",
        templateId: "tpl-1",
        exerciseId: "ex-1",
        name: "Squat",
        order: 1,
        target: template,
        sets: [
          { id: "set-1", order: 1, weight: 50, reps: 12, rir: 2, restSeconds: 60, completedAt: "time" },
          { id: "set-2", order: 2, weight: 50, reps: 10, rir: 2, restSeconds: 60, completedAt: "time" },
          { id: "set-3", order: 3, weight: 50, reps: 9, rir: 2, restSeconds: 60, completedAt: "time" },
        ]
      };

      const suggestion = suggestNextProgression(template, latest, 2.5);
      
      expect(suggestion.kind).toBe("add_reps");
      expect(suggestion.nextWeight).toBe(50);
      expect(suggestion.nextRepMin).toBe(9); // 8 + 1
    });

    it("should suggest reducing weight if RIR is too low (failure)", () => {
      const latest: SessionExercise = {
        id: "se-1",
        templateId: "tpl-1",
        exerciseId: "ex-1",
        name: "Squat",
        order: 1,
        target: template,
        sets: [
          { id: "set-1", order: 1, weight: 50, reps: 8, rir: 0, restSeconds: 60, completedAt: "time" },
          { id: "set-2", order: 2, weight: 50, reps: 6, rir: 0, restSeconds: 60, completedAt: "time" },
        ]
      };

      const suggestion = suggestNextProgression(template, latest, 2.5);
      
      expect(suggestion.kind).toBe("reduce_weight");
      expect(suggestion.nextWeight).toBe(47.5);
    });
  });

  describe("calculateSessionTSS", () => {
    it("should calculate correct TSS based on volume and intensity", () => {
      const session = {
        id: "s-1",
        status: "completed",
        exercises: [
          {
            sets: [
              { weight: 100, reps: 10, rir: 2, skipped: false }, // Volume: 1000, Intensity: 1 + 3*0.05 = 1.15 => 11.5 TSS
              { weight: 100, reps: 8, rir: 0, skipped: false },  // Volume: 800, Intensity: 1 + 5*0.05 = 1.25 => 10.0 TSS
              { weight: 100, reps: 10, rir: 2, skipped: true },  // Skipped, 0 TSS
            ]
          }
        ]
      } as unknown as WorkoutSession;

      const tss = calculateSessionTSS(session);
      // 11.5 + 10.0 = 21.5 => round to 22
      expect(tss).toBe(22);
    });
  });

  describe("calculateACWR", () => {
    it("should calculate safe ACWR for optimal loading", () => {
      const now = new Date().getTime();
      const ONE_DAY = 1000 * 60 * 60 * 24;

      const sessions = [
        // Acute (last 7 days) - Total TSS: ~300
        { status: "completed", completedAt: new Date(now - 2 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
        { status: "completed", completedAt: new Date(now - 5 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
        
        // Chronic remaining (8-28 days) - Total TSS: ~900 (making 28-day total ~1200)
        { status: "completed", completedAt: new Date(now - 10 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
        { status: "completed", completedAt: new Date(now - 14 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
        { status: "completed", completedAt: new Date(now - 20 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
        { status: "completed", completedAt: new Date(now - 25 * ONE_DAY).toISOString(), exercises: [{ sets: [{ weight: 100, reps: 100, rir: 0 }] }] },
      ] as unknown as WorkoutSession[];

      // Each session is 100*100 = 10,000 volume. RIR 0 -> 1.25 multiplier. TSS = 125 per session.
      // Acute = 2 * 125 = 250
      // Chronic = (6 * 125) / 4 = 750 / 4 = 187.5
      // Ratio = 250 / 187.5 = 1.33

      const result = calculateACWR(sessions);
      expect(result.acute).toBe(250);
      expect(result.chronic).toBe(188); // rounded
      expect(result.ratio).toBe(1.33);
      expect(result.status).toContain("Precaución");
    });
  });
});