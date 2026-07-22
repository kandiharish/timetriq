# Timetriq Product Rules

Version: 1.0

---

# Purpose

This document defines the business domain knowledge and product rules for Timetriq.

It is the primary source of truth for understanding how the product should behave.

Whenever implementing features, validating requests, designing APIs, writing tests, or making architectural decisions, follow these rules.

If implementation conflicts with these rules, stop and explain the conflict before proceeding.

---

# Product Identity

Timetriq is a Work Intelligence Platform.

Its goal is to help users:

- Plan work
- Track actual effort
- Forecast workload
- Measure estimation accuracy
- Understand capacity
- Make better planning decisions

The application is designed around workload planning, not generic task management.

---

# What Timetriq Is NOT

Do not design Timetriq like:

- Jira
- Trello
- ClickUp
- Asana
- Monday.com
- Google Sheets

Although some concepts overlap, Timetriq focuses on workload intelligence rather than project collaboration.

---

# Core Domains

Timetriq has five core business domains.

1. Task Planning
2. Time Tracking
3. Workload Planning
4. Capacity Planning
5. Reporting

Every feature must belong to one or more of these domains.

---

# Core Business Entities

The application consists of the following entities.

User

Task

Time Entry

Holiday

Leave

Settings

Future entities:

Organization

Team

Notification

AI Recommendation

---

# Task Rules

A Task represents planned work.

Every task must contain:

- Name
- Estimated Hours
- Start Date
- End Date

Optional:

- Description
- Notes
- Tags

Tasks are the foundation of all workload calculations.

---

# Estimated Hours

Estimated Hours represent planned effort.

Rules:

Must be greater than zero.

May be updated.

Changing Estimated Hours requires workload recalculation.

Estimated Hours are planning data.

They are never automatically modified by the system.

---

# Actual Hours

Actual Hours represent completed work.

Rules:

Calculated from Time Entries.

Never manually entered.

Always derived.

Formula

Actual Hours

=

Sum(Time Entries)

---

# Time Entries

A Time Entry records work performed on one day.

Each entry belongs to:

One User

One Task

One Date

Rules:

Negative hours are prohibited.

Time Entries represent historical facts.

Do not modify history automatically.

---

# Remaining Work

Formula

Remaining Work

=

Estimated Hours

-

Actual Hours

Remaining Work may become negative.

This indicates the estimate has been exceeded.

---

# Variance

Formula

Variance

=

Actual Hours

-

Estimated Hours

Interpretation

Positive

More effort than expected.

Negative

Less effort than expected.

Zero

Estimate matched actual effort.

---

# Progress

Formula

Progress

=

Actual Hours

/

Estimated Hours

×

100

Progress may exceed 100%.

Do not artificially limit it.

---

# Working Days

Default working days:

Monday

Tuesday

Wednesday

Thursday

Friday

Weekend:

Saturday

Sunday

Future versions may allow customization.

---

# Holiday Rules

Holidays are non-working days.

Rules:

Do not assign planned workload.

Exclude from workload distribution.

Recalculate planning automatically.

---

# Leave Rules

Approved leave reduces available capacity.

Rules:

No workload on leave days.

Leave affects planning.

Leave affects forecasting.

Leave never changes historical time entries.

---

# Workload Distribution

Purpose:

Evenly distribute estimated work across valid working days.

Algorithm:

Determine planning window.

↓

Remove weekends.

↓

Remove holidays.

↓

Remove leave.

↓

Count working days.

↓

Divide estimated hours equally.

Every distribution must be deterministic.

---

# Capacity

Capacity represents available work hours.

Default:

8 hours/day

Formula

Remaining Capacity

=

Daily Capacity

-

Planned Workload

Capacity may become negative.

This represents overload.

---

# Dashboard Rules

Dashboard metrics are always calculated.

Never store:

- Progress
- Capacity
- Remaining Work
- Variance

Store only source data.

---

# Reporting Rules

Reports aggregate source data.

Never duplicate business calculations.

Reports must always reflect current business rules.

---

# Business Engine Ownership

The Business Engine owns:

Progress

Variance

Capacity

Remaining Work

Forecast

Workload Distribution

No other module may implement these calculations independently.

---

# Validation Rules

Reject:

Negative estimated hours.

Negative logged hours.

Invalid date ranges.

Unknown task references.

Unauthorized operations.

Missing required fields.

---

# Automatic Recalculation

Recalculate workload whenever:

Estimated Hours change.

Start Date changes.

End Date changes.

Holiday changes.

Leave changes.

Working hours change.

Never require manual recalculation.

---

# Source of Truth

Always store:

Tasks

Time Entries

Holidays

Leave

Settings

Always calculate:

Progress

Variance

Capacity

Remaining Work

Reports

Forecasts

---

# Product Constraints

Do not introduce features that:

Complicate planning unnecessarily.

Duplicate existing functionality.

Conflict with documented business rules.

Reduce calculation accuracy.

---

# Product Evolution

Current focus:

Individual productivity.

Future focus:

Teams.

Organizations.

AI-assisted planning.

Enterprise features.

Build today's features so they support tomorrow's requirements.

---

# AI Implementation Rules

When implementing functionality:

Understand the business rule first.

Do not invent formulas.

Reuse existing business calculations.

Never duplicate business logic.

Follow the documented calculation order.

Respect domain ownership.

Prefer extending existing modules over creating new ones.

---

# Testing Expectations

Every business rule should have corresponding tests.

Critical areas include:

- Workload Distribution
- Capacity Calculation
- Variance
- Progress
- Remaining Work
- Holiday Handling
- Leave Handling

No business rule should exist without validation.

---

# Final Principle

Timetriq is a planning platform, not a task list.

Every implementation should improve planning accuracy, workload visibility, and decision-making.

When uncertain, choose the solution that preserves business correctness over implementation convenience.