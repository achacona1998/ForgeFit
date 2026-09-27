# Delta for Navigation & Routing

## ADDED Requirements

### Requirement: Dedicated Training Tab

The system MUST include a visible "Entrenar" tab as the primary navigation item when a training day is scheduled.

#### Scenario: Training day scheduled

- GIVEN the user has an active routine with a training day matching today
- WHEN the app renders the tab bar
- THEN "Entrenar" MUST be visible and navigate to the workout screen
- AND it MUST be the first or second tab from the left

#### Scenario: No training day scheduled

- GIVEN no training day matches today
- WHEN the app renders the tab bar
- THEN "Entrenar" MUST still be visible but show the routine or rest state

### Requirement: Dedicated Library Tab

The system MUST include a visible "Biblioteca" tab with searchable, filterable exercise browsing.

#### Scenario: Filtering exercises by muscle group

- GIVEN the user opens the Library tab
- WHEN the user selects a muscle group filter
- THEN exercises MUST be filtered to show only those targeting that muscle

#### Scenario: Filtering by category

- GIVEN the user opens the Library tab
- WHEN the user selects a category filter (compound, isolation, machine, etc.)
- THEN exercises MUST be filtered accordingly

### Requirement: Dedicated Measurements Tab

The system MUST include a visible "Medidas" tab for body composition tracking.

#### Scenario: Viewing measurement history

- GIVEN the user opens the Measurements tab
- THEN a chronological list of all measurements MUST be displayed
- AND the latest measurement MUST be shown prominently

### Requirement: Dedicated PRs Tab

The system MUST include a visible "PRs" tab for personal records.

#### Scenario: Viewing PR history

- GIVEN the user opens the PRs tab
- THEN all personal records MUST be listed sorted by date
- AND PRs MUST be grouped by exercise

### Requirement: Exercise Detail Screen

The system MUST provide a dedicated screen per exercise showing its history and progression.

#### Scenario: Viewing exercise history

- GIVEN the user taps an exercise in the library or dashboard
- WHEN the exercise detail screen opens
- THEN all historical sessions for that exercise MUST be displayed
- AND a progression chart (weight over time) MUST be shown

## MODIFIED Requirements

### Requirement: Tab Navigation Layout

The tab bar MUST include: Dashboard, Entrenar, Rutina, Biblioteca, Progreso, Medidas, PRs, Calendario, Ajustes.

(Previously: Only 4 tabs — Inicio, Rutina, Progreso, Más)

#### Scenario: Complete tab bar

- GIVEN the app is on any screen
- WHEN the tab bar renders
- THEN ALL 9 tabs MUST be visible
- AND each tab MUST navigate to its respective screen

## REMOVED Requirements

### Requirement: "Más" tab as catch-all

The "Más" tab MUST be removed — its contents are redistributed to dedicated tabs.

(Reason: Dedicated tabs provide better discoverability and match the specification)
