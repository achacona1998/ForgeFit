export type Unit = "kg" | "lb";
export type SessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "skipped";
export type RecordType = "weight" | "estimated_1rm" | "volume";
export type ProgressionType =
  | "DOUBLE_PROGRESSION"
  | "FIXED_REPS"
  | "RIR_BASED"
  | "FST7"
  | "SUPERSET"
  | "BODYWEIGHT"
  | "CUSTOM";
export type SetQuality = "excellent" | "acceptable" | "poor";

export interface AthleteProfile {
  id: string;
  name: string;
  birthDate?: string;
  height?: number;
  goal?: string;
  unit: Unit;
  createdAt: string;
  updatedAt: string;
}
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string;
  category: string;
  instructions?: string;
  notes?: string;
  isCustom: boolean;
}

export interface ExerciseTemplate {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  sets: number;
  repRangeMin: number;
  repRangeMax: number;
  targetWeight?: number;
  targetRir?: number;
  targetRpe?: number;
  restSeconds: number;
  tempo?: string;
  notes?: string;
  supersetGroup?: string;
  protocol?: ProgressionType;
  directMuscles?: string[];
  secondaryMuscles?: string[];
  priority?: number;
  increment?: number;
  fst7RestSeconds?: number;
}
export interface TrainingDay {
  id: string;
  name: string;
  weekday: number;
  order: number;
  exercises: ExerciseTemplate[];
}
export interface DeloadPlan {
  reductionPercent: number;
  startedAt: string;
  originalSets: Record<string, number>;
}
export interface Routine {
  id: string;
  name: string;
  description?: string;
  goal: string;
  daysPerWeek: number;
  startDate: string;
  active: boolean;
  block?: string;
  mesocycle?: string;
  deload?: DeloadPlan;
  trainingDays: TrainingDay[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  order: number;
  weight: number;
  reps: number;
  rir?: number;
  rpe?: number;
  restSeconds: number;
  completedAt?: string;
  notes?: string;
  type?: "warmup" | "working" | "dropset" | "failure";
  quality?: SetQuality;
  actualRestSeconds?: number;
}
export interface PreviousPerformance {
  weight: number;
  reps: number;
  rir?: number;
  rpe?: number;
}
export interface SessionExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  name: string;
  order: number;
  target: Omit<ExerciseTemplate, "id" | "exerciseId" | "name" | "order">;
  previousPerformance?: PreviousPerformance;
  sets: WorkoutSet[];
  notes?: string;
}
export interface RecoveryContext {
  energy?: number;
  fatigue?: number;
  sleep?: number;
  sensations?: string;
  pain?: string;
}
export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  trainingDayId: string;
  trainingDayName: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  status: SessionStatus;
  block?: string;
  mesocycle?: string;
  microcycle?: string;
  exercises: SessionExercise[];
  notes?: string;
  recovery?: RecoveryContext;
}

export interface Measurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  shoulders?: number;
  waist?: number;
  hips?: number;
  rightBicep?: number;
  leftBicep?: number;
  rightThigh?: number;
  leftThigh?: number;
  rightCalf?: number;
  leftCalf?: number;
  notes?: string;
  customMetrics?: Record<string, number>;
}
export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  weight: number;
  reps: number;
  type: RecordType;
  sourceSessionId?: string;
}
export interface EquipmentProfile {
  barWeight: number;
  availablePlates: number[];
}
export interface AppSettings {
  theme: "system" | "light" | "dark";
  showRir: boolean;
  showRpe: boolean;
  prCelebration: boolean;
  firstRunCompleted: boolean;
  defaultIncrement?: number;
  defaultFst7RestSeconds?: number;
  equipmentProfile?: EquipmentProfile;
}
export interface FitnessDatabase {
  schemaVersion: number;
  updatedAt: string;
  profile: AthleteProfile;
  settings: AppSettings;
  exercises: Exercise[];
  routines: Routine[];
  sessions: WorkoutSession[];
  measurements: Measurement[];
  records: PersonalRecord[];
}
export interface WorkoutStats {
  weeklySessions: number;
  monthlySessions: number;
  weeklyVolume: number;
  monthlyVolume: number;
  totalMinutes: number;
  recentRecords: PersonalRecord[];
}
export const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
