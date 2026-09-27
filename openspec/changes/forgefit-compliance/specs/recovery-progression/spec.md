# Delta for Recovery Context & Progression Configuration

## ADDED Requirements

### Requirement: Recovery Context Per Session

The system MUST collect recovery context data for each session (optional but available).

#### Scenario: Recording recovery data

- GIVEN the user is about to start or has completed a session
- WHEN the recovery context screen appears
- THEN the user MUST be able to enter: Energy (1-10), Fatigue (1-10), Sleep (hours), Sensations (text), Pain (text)
- AND all fields MUST be optional

### Requirement: Technique Rating Per Set

The system MUST collect technique quality for each set during workout mode.

#### Scenario: Rating a set's technique

- GIVEN the user completes a set
- WHEN the set completion UI appears
- THEN the user MUST select from: Excellent, Acceptable, Poor
- AND this rating MUST be stored in the SetLog

### Requirement: Progression Configuration Screen

The system MUST provide a configuration interface for ProgressionConfig per exercise.

#### Scenario: Configuring double progression

- GIVEN the user is editing an exercise template
- WHEN they access progression settings
- THEN they MUST be able to set: type (DOUBLE_PROGRESSION, FIXED_REPS, RIR_BASED, FST7, SUPERSET, BODYWEIGHT, CUSTOM), loadIncrement, customIncrement, minRIR, maxRIR, allSetsRequired, successRule, failureRule, userNotes

#### Scenario: Double progression displayed in workout

- GIVEN a template uses DOUBLE_PROGRESSION type
- WHEN the user views their progress in a workout
- THEN the system MUST show which week they are in (e.g., "Semana 2 de 4")
- AND the target reps for the current week MUST be displayed

### Requirement: Deload Confirmation Flow

The system MUST present a confirmation dialog before applying a deload.

#### Scenario: User requests deload

- GIVEN the user wants to apply a deload
- WHEN they select "Configurar descarga"
- THEN a dialog MUST appear showing options: −30%, −40%, −50%
- AND MUST state "Nunca se aplica automáticamente"
- AND the user MUST explicitly confirm before applying

## MODIFIED Requirements

### Requirement: Routine Deload

Deload MUST be stored as a DeloadPlan entity in the database with reductionPercent and startedAt fields.

(Previously: Deload stored inline in Routine as optional field)

### Requirement: TrainingDay Exercises as ExerciseTemplates

TrainingDay exercises MUST reference ExerciseTemplate objects stored in a separate table.

(Previously: Exercises stored directly in TrainingDay as inline array)

## REMOVED Requirements

### Requirement: Hardcoded progression in workout screen

Progression display MUST be configurable per template, not hardcoded.

(Reason: The specification defines ProgressionConfig as a per-exercise setting)
