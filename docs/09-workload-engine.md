# Workload Engine

Version: 1.0

---

# Purpose

The Workload Engine is the core domain component responsible for workload planning, effort distribution, capacity calculation, and forecasting.

It receives planning inputs and produces deterministic workload outputs used throughout Timetriq.

This engine is independent of the frontend, backend framework, API, and database.

---

# Objectives

The Workload Engine is responsible for:

- Distributing planned work
- Resolving working calendars
- Excluding non-working days
- Calculating daily workload
- Forecasting future utilization
- Detecting overload conditions
- Supporting future AI scheduling

---

# Responsibilities

The Workload Engine shall:

✓ Calculate planned workload

✓ Calculate available capacity

✓ Resolve working calendars

✓ Exclude weekends

✓ Exclude holidays

✓ Exclude leave

✓ Detect scheduling conflicts

✓ Forecast workload

The engine shall NOT:

✗ Store data

✗ Render UI

✗ Handle authentication

✗ Call APIs

✗ Query Firestore directly

---

# Inputs

The engine accepts:

Tasks

Working Calendar

Holiday Calendar

Leave Calendar

User Capacity

Planning Window

Current Date

---

# Outputs

The engine returns:

Daily Planned Hours

Task Distribution

Remaining Capacity

Overload Indicators

Forecast Summary

Planning Metrics

---

# Engine Architecture

```
Task Data
      │
      ▼
Calendar Resolver
      │
      ▼
Working Day Generator
      │
      ▼
Workload Distributor
      │
      ▼
Capacity Calculator
      │
      ▼
Forecast Generator
      │
      ▼
Planning Result
```

---

# Processing Pipeline

The engine executes the following pipeline.

Step 1

Validate Inputs

↓

Step 2

Resolve Calendar

↓

Step 3

Generate Working Days

↓

Step 4

Exclude Holidays

↓

Step 5

Exclude Leave

↓

Step 6

Distribute Hours

↓

Step 7

Calculate Capacity

↓

Step 8

Generate Forecast

↓

Step 9

Return Result

---

# Calendar Resolution

The engine first determines valid planning days.

Default calendar:

Monday

Tuesday

Wednesday

Thursday

Friday

Weekend:

Saturday

Sunday

Future versions may support custom calendars.

---

# Working Day Generator

Input

Start Date

End Date

Output

Ordered collection of valid working days.

Example

Planning Window

July 1 → July 10

Weekend Removed

Saturday

Sunday

Working Days

1

2

3

6

7

8

9

10

---

# Holiday Resolver

Configured holidays are removed from working days.

Example

Working Days

1

2

3

6

7

Holiday

3

Final Working Days

1

2

6

7

---

# Leave Resolver

Approved leave is treated as unavailable capacity.

Affected days are excluded.

The workload is redistributed automatically.

---

# Workload Distribution Algorithm

Input

Estimated Hours

Working Days

Formula

```
Daily Hours

=

Estimated Hours

÷

Working Day Count
```

---

Example

Estimated Hours

40

Working Days

5

Result

8 Hours per Day

---

# Decimal Distribution

Some workloads cannot be divided evenly.

Example

Estimated Hours

10

Working Days

3

Result

3.33

3.33

3.34

The final day's allocation should absorb any rounding difference so that the total equals the estimated hours.

---

# Remaining Capacity

Formula

```
Remaining Capacity

=

Daily Capacity

-

Planned Workload
```

---

Example

Capacity

8

Planned

6

Remaining

2 Hours

---

# Overload Detection

A day is overloaded when:

```
Planned Work

>

Daily Capacity
```

The engine should mark overloaded days.

---

# Forecast Generation

The engine provides:

Daily Forecast

Weekly Forecast

Monthly Forecast

Remaining Capacity

Overloaded Days

Upcoming Deadlines

---

# Recalculation Triggers

The engine recalculates when:

Task Created

Task Updated

Task Deleted

Task Archived

Holiday Added

Holiday Removed

Leave Approved

Leave Cancelled

Working Hours Changed

---

# Engine Rules

Rule 1

Never assign work to weekends.

---

Rule 2

Never assign work to holidays.

---

Rule 3

Never assign work to approved leave.

---

Rule 4

Total distributed hours must equal estimated hours.

---

Rule 5

Distribution must be deterministic.

---

Rule 6

Every recalculation should produce identical results for identical inputs.

---

# Performance Requirements

The engine should:

Complete calculations quickly for normal workloads.

Avoid unnecessary recalculations.

Support incremental recalculation when only one task changes.

Scale efficiently as the number of tasks grows.

---

# Error Conditions

The engine should reject:

Invalid date ranges

Negative hours

Zero estimated hours

Planning windows with no valid working days

Missing task information

Invalid calendar configuration

---

# Edge Cases

## Single Working Day

Assign all estimated hours to that day.

---

## One-Day Holiday Window

If the only planned day is a holiday, return a validation error indicating no available working days.

---

## Long Running Task

Tasks spanning months should distribute work consistently across all valid working days.

---

## Overlapping Tasks

Multiple tasks may exist on the same day.

The engine sums planned hours to calculate total workload.

---

## Capacity Exceeded

Do not redistribute automatically.

Return an overload indicator.

Future AI versions may recommend rescheduling.

---

# Future AI Integration

The engine should expose extension points for:

Smart Work Distribution

Priority-based Scheduling

Deadline Risk Prediction

Automatic Replanning

Suggested Task Order

Capacity Optimization

What-if Planning

No existing business logic should require modification to support these capabilities.

---

# Testing Strategy

Every workload calculation should have unit tests.

Required test categories:

Working day generation

Weekend exclusion

Holiday exclusion

Leave exclusion

Hour distribution

Rounding behavior

Capacity calculation

Forecast generation

Overload detection

Regression scenarios

---

# Guiding Principles

The Workload Engine is the planning intelligence of Timetriq.

It should remain:

Independent

Deterministic

Reusable

Testable

Extensible

Reliable

Every planning-related calculation must pass through this engine.

No other module should duplicate or override its logic.