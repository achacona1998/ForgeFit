/**
 * ForgeFit Database Schema
 * SQLite schema matching the original Drizzle schema
 */

export const SCHEMA_SQL = `
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  active INTEGER DEFAULT 0 NOT NULL,
  daysPerWeek INTEGER,
  startDate TEXT,
  endDate TEXT,
  currentVersionId TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Routine versions table
CREATE TABLE IF NOT EXISTS routineVersions (
  id TEXT PRIMARY KEY NOT NULL,
  routineId TEXT NOT NULL,
  versionNumber INTEGER NOT NULL,
  effectiveFrom TEXT,
  effectiveTo TEXT,
  notes TEXT,
  mesocycleId TEXT,
  microcycleId TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
);

-- Training days table
CREATE TABLE IF NOT EXISTS trainingDays (
  id TEXT PRIMARY KEY NOT NULL,
  routineVersionId TEXT NOT NULL,
  name TEXT NOT NULL,
  dayOfWeek INTEGER,
  order INTEGER NOT NULL,
  FOREIGN KEY (routineVersionId) REFERENCES routineVersions(id) ON DELETE CASCADE
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT, -- JSON array
  category TEXT,
  muscleGroups TEXT, -- JSON array (legacy)
  directMuscles TEXT, -- JSON array
  secondaryMuscles TEXT, -- JSON array
  equipment TEXT,
  videoUrl TEXT,
  instructions TEXT,
  notes TEXT,
  isCustom INTEGER DEFAULT 0 NOT NULL,
  createdAt INTEGER NOT NULL
);

-- Exercise templates table
CREATE TABLE IF NOT EXISTS exerciseTemplates (
  id TEXT PRIMARY KEY NOT NULL,
  trainingDayId TEXT NOT NULL,
  exerciseId TEXT NOT NULL,
  order INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  repRangeMin INTEGER,
  repRangeMax INTEGER,
  targetWeight REAL,
  targetRIRMin INTEGER,
  targetRIRMax INTEGER,
  targetRPE REAL,
  restMinSeconds INTEGER,
  restMaxSeconds INTEGER,
  tempo TEXT,
  progressionType TEXT,
  progressionConfig TEXT, -- JSON
  supersetGroup TEXT,
  priority TEXT,
  notes TEXT,
  enabled INTEGER DEFAULT 1 NOT NULL,
  FOREIGN KEY (trainingDayId) REFERENCES trainingDays(id) ON DELETE CASCADE,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE NO ACTION
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  routineId TEXT,
  routineVersionId TEXT,
  trainingDayId TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  startedAt TEXT,
  completedAt TEXT,
  durationSeconds INTEGER,
  sessionNotes TEXT,
  recoveryContext TEXT, -- JSON
  createdAt INTEGER NOT NULL
);

-- Session exercises table
CREATE TABLE IF NOT EXISTS sessionExercises (
  id TEXT PRIMARY KEY NOT NULL,
  sessionId TEXT NOT NULL,
  exerciseId TEXT NOT NULL,
  templateSnapshot TEXT, -- JSON
  order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE NO ACTION
);

-- Set logs table
CREATE TABLE IF NOT EXISTS setLogs (
  id TEXT PRIMARY KEY NOT NULL,
  sessionExerciseId TEXT NOT NULL,
  setNumber INTEGER NOT NULL,
  type TEXT DEFAULT 'working' NOT NULL,
  plannedWeight REAL,
  plannedRepsMin INTEGER,
  plannedRepsMax INTEGER,
  plannedRIR INTEGER,
  actualWeight REAL,
  actualReps INTEGER,
  actualRIR INTEGER,
  actualRPE REAL,
  techniqueRating TEXT,
  restPlannedSeconds INTEGER,
  restActualSeconds INTEGER,
  completedAt TEXT,
  skipped INTEGER DEFAULT 0 NOT NULL,
  FOREIGN KEY (sessionExerciseId) REFERENCES sessionExercises(id) ON DELETE CASCADE
);

-- Measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  weight REAL,
  bodyFatPercentage REAL,
  values TEXT, -- JSON
  notes TEXT,
  createdAt INTEGER NOT NULL
);

-- Personal records table
CREATE TABLE IF NOT EXISTS personalRecords (
  id TEXT PRIMARY KEY NOT NULL,
  exerciseId TEXT NOT NULL,
  sessionId TEXT,
  recordType TEXT NOT NULL,
  weight REAL,
  reps INTEGER,
  volume REAL,
  estimatedPerformance REAL,
  achievedAt TEXT NOT NULL,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL, -- JSON
  updatedAt INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routineVersions_routineId ON routineVersions(routineId);
CREATE INDEX IF NOT EXISTS idx_trainingDays_routineVersionId ON trainingDays(routineVersionId);
CREATE INDEX IF NOT EXISTS idx_exerciseTemplates_trainingDayId ON exerciseTemplates(trainingDayId);
CREATE INDEX IF NOT EXISTS idx_exerciseTemplates_exerciseId ON exerciseTemplates(exerciseId);
CREATE INDEX IF NOT EXISTS idx_sessions_routineId ON sessions(routineId);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessionExercises_sessionId ON sessionExercises(sessionId);
CREATE INDEX IF NOT EXISTS idx_setLogs_sessionExerciseId ON setLogs(sessionExerciseId);
CREATE INDEX IF NOT EXISTS idx_personalRecords_exerciseId ON personalRecords(exerciseId);
`;

export const DROP_ALL_SQL = `
DROP TABLE IF EXISTS setLogs;
DROP TABLE IF EXISTS sessionExercises;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS exerciseTemplates;
DROP TABLE IF EXISTS trainingDays;
DROP TABLE IF EXISTS routineVersions;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS measurements;
DROP TABLE IF EXISTS personalRecords;
DROP TABLE IF EXISTS settings;
`;