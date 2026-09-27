# Delta for Analytics & Charts

## ADDED Requirements

### Requirement: Period Selector for Charts

The system MUST allow users to select chart periods: 7 días, 30 días, 3 meses, 6 meses, 1 año, todo.

#### Scenario: Changing chart period

- GIVEN the user is viewing a chart
- WHEN the user selects "3 meses"
- THEN the chart MUST display data from the last 3 months only

### Requirement: Exercise Performance Chart

The system MUST display performance charts per exercise showing weight, reps, volume, and RIR over time.

#### Scenario: Weight over time chart

- GIVEN the user selects an exercise and period
- WHEN the chart renders
- THEN a line chart showing weight lifted per session MUST be displayed
- AND the chart MUST support switching between weight, reps, volume, and RIR views

### Requirement: Body Composition Charts

The system MUST display charts for body weight, body fat percentage, and body measurements over time.

#### Scenario: Weight progression chart

- GIVEN the user has recorded measurements
- WHEN the "Cuerpo" view is selected
- THEN a line chart of body weight over time MUST be displayed
- AND body fat percentage chart MUST also be shown

### Requirement: Training Volume Charts

The system MUST display weekly and monthly volume charts with session counts and adherence rates.

#### Scenario: Weekly volume chart

- GIVEN the user is in the dashboard or progress view
- WHEN the weekly view is selected
- THEN a bar chart showing volume per day of the week MUST be displayed
- AND session count MUST be overlaid or shown alongside

### Requirement: Adherence Chart

The system MUST display an adherence rate chart (completed / scheduled sessions).

#### Scenario: Monthly adherence

- GIVEN the user has scheduled and completed sessions
- WHEN adherence is displayed
- THEN the percentage MUST be calculated and shown per month

### Requirement: Muscle Group Volume Chart

The system MUST show volume distributed by muscle group.

#### Scenario: Volume by muscle

- GIVEN the user views volume analytics
- THEN a chart showing volume per muscle group (chest, back, legs, shoulders, arms) MUST be displayed
- AND the user MUST be able to toggle secondary muscle contribution (0%, 25%, 50%, 100%)

## MODIFIED Requirements

### Requirement: Progress Dashboard Charts

The progress dashboard MUST include multiple chart types, not just a single weight bar chart.

(Previously: Only one BarChart showing body weight)

#### Scenario: Complete progress view

- GIVEN the user opens the Progress tab
- THEN the view MUST include: volume chart, body composition chart, adherence chart, exercise progression chart

## REMOVED Requirements

### Requirement: Single BarChart as the only chart type

The system MUST NOT rely on a single BarChart for all analytics.

(Reason: The specification requires multiple chart types for different metrics)
