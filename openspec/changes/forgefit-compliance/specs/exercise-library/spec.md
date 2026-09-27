# Delta for Exercise Library & Data Schema

## ADDED Requirements

### Requirement: Exercise Aliases

Each exercise MUST support an `aliases[]` field for alternative names.

#### Scenario: Searching by alias

- GIVEN an exercise "Press banca" has alias "Bench Press"
- WHEN the user searches "Bench Press"
- THEN the exercise MUST appear in results

### Requirement: Exercise Detail Fields

Each exercise MUST have `directMuscles[]`, `secondaryMuscles[]`, `videoUrl`, `instructions`, and `notes` fields.

#### Scenario: Viewing exercise details

- GIVEN the user opens an exercise detail screen
- THEN the exercise MUST display direct muscles, secondary muscles, instructions, and notes
- AND videoUrl MUST be shown as an optional link

### Requirement: Exercise Filtering by Muscle

The system MUST filter exercises by direct and secondary muscle groups.

#### Scenario: Filter by direct muscle

- GIVEN the user selects "Pecho" as filter
- THEN all exercises with "Pecho" in directMuscles MUST be shown

### Requirement: Exercise Filtering by Category

The system MUST filter exercises by category (compound, isolation, machine, core, bodyweight, cable, free_weight, custom).

#### Scenario: Filter by category

- GIVEN the user selects "Compuesto"
- THEN only exercises with category "compound" MUST be displayed

### Requirement: Complete Data Schema

The database schema MUST include all entities defined in the specification.

#### Scenario: RoutineVersion as separate table

- GIVEN a routine is versioned
- THEN `routineVersions` MUST exist as a separate table with columns: id, routineId, versionNumber, effectiveFrom, effectiveTo, notes, mesocycleId, microcycleId

#### Scenario: TrainingDay as separate table

- GIVEN a routine has training days
- THEN `trainingDays` MUST exist as a separate table with columns: id, routineVersionId, name, dayOfWeek, order

#### Scenario: ExerciseTemplate as separate table

- GIVEN a training day has exercises
- THEN `exerciseTemplates` MUST exist as a separate table with columns: id, trainingDayId, exerciseId, order, sets, repRangeMin, repRangeMax, targetWeight, targetRIRMin, targetRIRMax, targetRPE, restMinSeconds, restMaxSeconds, tempo, progressionType, progressionConfig, protocol, supersetGroup, priority, notes, enabled

#### Scenario: SetLog as separate table

- GIVEN a session exercise is completed
- THEN `setLogs` MUST exist as a separate table with columns: id, sessionExerciseId, setNumber, type, plannedWeight, plannedRepsMin, plannedRepsMax, plannedRIR, actualWeight, actualReps, actualRIR, actualRPE, techniqueRating, restPlannedSeconds, restActualSeconds, completedAt, notes, skipped

#### Scenario: Missing entities added to FitnessDatabase type

- GIVEN the FitnessDatabase type is defined
- THEN it MUST include: trainingBlocks, mesocycles, microcycles, workoutRules, backupsMetadata

### Requirement: SetLog Type Fields

Each SetLog MUST include: type (warmup/working/dropset/failure), techniqueRating (excellent/acceptable/poor), restPlannedSeconds, restActualSeconds, skipped.

#### Scenario: Logging a working set

- GIVEN the user completes a working set
- WHEN the set is saved
- THEN type MUST be "working"
- AND techniqueRating MUST be recorded if provided
- AND restActualSeconds MUST be recorded

#### Scenario: Marking a set as skipped

- GIVEN the user skips a set
- WHEN the set is recorded
- THEN skipped MUST be true
- AND type MAY be "warmup" or "working" depending on context

## MODIFIED Requirements

### Requirement: Exercise Interface

The Exercise interface MUST include aliases, directMuscles, secondaryMuscles, videoUrl, instructions, notes fields.

(Previously: Only id, name, muscleGroups, equipment, category, instructions, isCustom)

### Requirement: SessionExercise Template Snapshot

Each SessionExercise MUST store a complete templateSnapshot including protocol, progression config, and all template fields.

(Previously: Target object stores most fields but lacks protocol-specific configuration)

## REMOVED Requirements

### Requirement: Sets stored as nested arrays in SessionExercise

The sets array within SessionExercise MUST be replaced by proper SetLog table references.

(Reason: Proper normalization and queryability per the schema specification)
