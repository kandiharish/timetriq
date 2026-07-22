# Business Logic

Version: 1.0

---

# Purpose

This document defines the business logic that powers Timetriq.

Business logic represents the rules, calculations, workflows, and validations that govern how the application behaves.

It is the authoritative source for all calculations performed within the system.

Business logic must remain independent of the frontend, backend framework, and database implementation.

---

# Business Logic Principles

The Business Engine must follow these principles.

- Deterministic
- Predictable
- Testable
- Reusable
- Framework Independent
- Side-effect Free where possible

Every calculation should produce the same output when given the same input.

---

# Core Business Concepts

Timetriq revolves around five concepts:

1. Task Planning
2. Time Tracking
3. Workload Planning
4. Capacity Planning
5. Effort Analysis

---

# Task Lifecycle

A task progresses through the following lifecycle:

```
Draft
    │
    ▼
Planned
    │
    ▼
In Progress
    │
    ▼
Completed
    │
    ▼
Archived
```

---

# Task Creation Rules

A task must contain:

- Task Name
- Estimated Hours
- Planned Start Date
- Planned End Date

Optional fields:

- Description
- Notes
- Tags

Validation Rules:

- Estimated Hours > 0
- Start Date ≤ End Date
- Task Name cannot be empty

---

# Working Day Rules

A working day is defined as a day on which planned work can be scheduled.

Default working days:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday

Default non-working days:

- Saturday
- Sunday

Future versions may support configurable work weeks.

---

# Holiday Rules

Configured holidays are treated as non-working days.

No planned workload shall be assigned to holidays.

If a holiday falls within a task duration, the workload shall be redistributed across the remaining working days.

---

# Leave Rules

Approved leave days reduce a user's available working capacity.

Leave days:

- Receive no planned work.
- Are excluded from workload distribution.
- Affect future capacity calculations.

---

# Workload Distribution

## Purpose

Distribute the estimated effort evenly across valid working days.

---

## Inputs

- Estimated Hours
- Start Date
- End Date
- Working Calendar
- Holidays
- Approved Leave

---

## Algorithm

1. Determine all calendar days within the planning window.
2. Remove weekends.
3. Remove holidays.
4. Remove leave days.
5. Count remaining working days.
6. Divide Estimated Hours equally across those days.

---

## Example

Estimated Hours: 40

Duration:

Monday → Friday

Working Days: 5

Daily Planned Hours:

40 ÷ 5 = 8 Hours

---

Example with Weekend

Estimated Hours: 40

Duration:

Thursday → Wednesday

Calendar Days:

7

Weekend:

Saturday

Sunday

Working Days:

5

Daily Planned Hours:

40 ÷ 5 = 8 Hours

---

# Workload Recalculation

Workload must automatically recalculate whenever:

- Estimated Hours change
- Start Date changes
- End Date changes
- Holiday Calendar changes
- Leave Calendar changes

No manual recalculation is required.

---

# Time Tracking

Time tracking records actual work performed.

Each entry contains:

- Task
- Date
- Hours Worked

---

# Time Entry Validation

Hours Worked must:

- Be greater than zero
- Not exceed configured daily limits
- Belong to an existing task
- Belong to the authenticated user

---

# Actual Hours

Actual Hours are calculated as:

```
Actual Hours

=

Sum(All Time Entries)
```

Actual Hours are never stored manually.

---

# Remaining Work

Remaining Work is defined as:

```
Remaining Work

=

Estimated Hours

-

Actual Hours
```

If Actual Hours exceed Estimated Hours, Remaining Work becomes negative, indicating that the estimate has been exceeded.

---

# Variance Calculation

Variance measures estimation accuracy.

Formula:

```
Variance

=

Actual Hours

-

Estimated Hours
```

Interpretation:

Variance = 0

Perfect estimate.

Variance > 0

Task required more effort than estimated.

Variance < 0

Task completed using less effort than estimated.

---

# Progress Calculation

Progress is calculated using actual effort.

Formula:

```
Progress %

=

Actual Hours

/

Estimated Hours

×

100
```

Progress may exceed 100% if additional effort was required.

---

# Daily Capacity

Daily Capacity is configurable.

Default:

8 Hours

Future versions may support different capacities per weekday.

---

# Capacity Calculation

Daily Planned Workload:

```
Sum(
Planned Hours
for all tasks
)
```

Available Capacity:

```
Daily Capacity

-

Planned Workload
```

---

# Capacity Status

Available Capacity > 0

Available

Available Capacity = 0

Fully Allocated

Available Capacity < 0

Overloaded

---

# Dashboard Calculations

Dashboard values are derived.

Examples:

Active Tasks

Count of active tasks.

Completed Tasks

Count of completed tasks.

Planned Hours

Sum of estimated effort.

Actual Hours

Sum of time entries.

Remaining Work

Calculated dynamically.

Capacity

Calculated dynamically.

---

# Report Calculations

Reports aggregate:

Tasks

Time Entries

Planned Hours

Actual Hours

Variance

Capacity

No report stores duplicated calculations.

---

# Business Events

The Business Engine should respond to:

Task Created

Task Updated

Task Archived

Time Logged

Time Updated

Holiday Added

Holiday Removed

Leave Approved

Settings Changed

Each event may trigger workload recalculation.

---

# Validation Rules

The Business Engine must reject:

Negative estimated hours

Negative logged hours

Invalid date ranges

Unknown task IDs

Unauthorized access

Duplicate invalid operations

---

# Calculation Order

To ensure consistency, calculations follow this order:

1. Validate Input
2. Resolve Working Calendar
3. Exclude Weekends
4. Exclude Holidays
5. Exclude Leave
6. Calculate Planned Workload
7. Aggregate Actual Hours
8. Calculate Remaining Work
9. Calculate Variance
10. Calculate Capacity
11. Generate Dashboard Metrics
12. Generate Reports

The order must remain consistent across the application.

---

# Edge Cases

## Single-Day Task

Entire estimated effort is assigned to the single working day.

---

## Zero Working Days

If the planning window contains no valid working days, task creation or update should fail with a clear validation error.

---

## Logged Hours Greater Than Estimate

Allowed.

Variance becomes positive.

Progress exceeds 100%.

---

## Task Without Time Entries

Actual Hours = 0

Progress = 0%

Remaining Work = Estimated Hours

---

## Holiday Added After Task Creation

Workload must automatically redistribute across the remaining valid working days.

---

## Leave Approved After Planning

Affected workload must be recalculated automatically.

---

# Business Logic Ownership

Business rules belong exclusively to the Business Engine.

They must never be implemented in:

- React Components
- API Routes
- Firestore Queries
- UI Helpers

All consumers must invoke the Business Engine rather than duplicating calculations.

---

# Testing Requirements

Every business rule should have automated unit tests.

Test categories include:

- Validation
- Workload Distribution
- Capacity Calculation
- Variance Calculation
- Progress Calculation
- Holiday Handling
- Leave Handling
- Edge Cases

Business logic changes must not be released without corresponding test updates.

---

# Guiding Principle

Timetriq's Business Engine is the heart of the platform.

All calculations must be centralized, deterministic, and reusable.

The application should never depend on spreadsheet formulas or client-side calculations.

Every business decision should be implemented once, thoroughly tested, and consistently reused throughout the system.