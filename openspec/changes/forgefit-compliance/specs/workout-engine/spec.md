# Delta for Workout Engine & Rest Timer

## ADDED Requirements

### Requirement: Rest Timer with Countdown

The system MUST display a visible countdown timer during rest periods between sets.

#### Scenario: Automatic rest timer starts after completing a set

- GIVEN the user completes a working set
- WHEN the rest timer activates
- THEN a full-screen countdown MUST display the configured rest duration
- AND the timer MUST show minutes and seconds

#### Scenario: Rest timer controls

- GIVEN the rest timer is running
- WHEN the user interacts with the timer
- THEN the system MUST support: Pause, Resume, Restart, Skip
- AND the user MUST be able to add 15, 30, or 60 seconds to the rest

#### Scenario: Rest duration is configurable per template

- GIVEN an exercise template has a restSeconds value
- WHEN the rest timer starts for that exercise
- THEN the countdown MUST use the template's restSeconds value

### Requirement: FST-7 Protocol Display

The system MUST show a clear "Serie N/7" progress indicator when a template uses the FST-7 protocol.

#### Scenario: FST-7 workout in progress

- GIVEN an exercise has protocol "FST7" with 7 sets
- WHEN the user starts the FST-7 exercise
- THEN the header MUST display "Serie 1/7" (progressing to 7/7)
- AND each completed set MUST advance the indicator

#### Scenario: FST-7 rest periods

- GIVEN the FST-7 protocol is active
- WHEN transitioning between sets
- THEN the rest timer MUST use the FST-7 rest duration (default 30-45s)

### Requirement: Superset and Biseries Flow

The system MUST support paired exercise sequences with shared rest periods.

#### Scenario: Superset execution

- GIVEN two exercises are in the same superset group
- WHEN the user completes exercise A
- THEN the system MUST show exercise B as the next exercise (not rest yet)
- AND the rest timer MUST start AFTER both exercises A and B are completed

#### Scenario: Biseries execution

- GIVEN exercises A1 and A2 form a biseries
- WHEN the user completes A1 then A2
- THEN the system MUST treat them as a pair with shared rest

### Requirement: Exercise-to-Exercise Navigation

The system MUST allow the user to navigate between exercises during a workout session.

#### Scenario: Moving to next exercise

- GIVEN all sets of the current exercise are completed
- WHEN the user presses "Next"
- THEN the next exercise in the training day order MUST load

#### Scenario: Moving to previous exercise

- GIVEN the user has moved past an exercise
- WHEN the user presses "Previous"
- THEN the previous exercise MUST load with its completed sets preserved

### Requirement: Skip Sets

The system MUST allow users to mark individual sets as skipped/omitted.

#### Scenario: Skipping a set

- GIVEN a set is in progress or pending
- WHEN the user selects "Skip"
- THEN the set MUST be marked as skipped in the session
- AND the next set MUST become active

### Requirement: Technique Rating per Set

The system MUST collect a technique quality rating for each completed set.

#### Scenario: Rating a set

- GIVEN the user completes a set
- WHEN the set completion screen appears
- THEN the user MUST be able to select: Excellent, Acceptable, or Poor
- AND this rating MUST be saved with the set log

## MODIFIED Requirements

### Requirement: Session Exercise Display

During workout mode, each exercise MUST show previous performance data distinctly from current input fields.

(Previously: Previous performance shown but not visually differentiated)

#### Scenario: Visual distinction

- GIVEN the exercise shows previous performance (e.g., "100 kg × 8 — RIR 2")
- WHEN the user enters current set data
- THEN previous data MUST be shown in a muted/secondary style
- AND current inputs MUST be in a prominent/primary style

## REMOVED Requirements

### Requirement: Set data stored as nested arrays only

Sets MUST be stored as individual `setLogs` table entries, NOT nested within session exercises.

(Reason: The schema defines `setLogs` as a separate table for proper indexing and querying)
