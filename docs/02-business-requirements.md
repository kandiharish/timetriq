# Business Requirements

Version: 1.0

---

# Purpose

This document defines the business requirements for Timetriq.

It describes **what** the system must accomplish from a business perspective.

This document intentionally avoids implementation details, database design, APIs, and UI decisions.

It serves as the single source of truth for understanding the business workflow that Timetriq is designed to support.

---

# Business Objective

Timetriq aims to replace manual spreadsheet-based workload planning with a centralized application that simplifies task planning, time tracking, workload forecasting, and effort analysis.

The application should automate repetitive calculations while preserving the planning process users already follow.

---

# Existing Workflow

The current workflow is managed using multiple Google Sheets.

Users manually:

- Create tasks.
- Estimate effort.
- Define start and end dates.
- Log daily work hours.
- Compare estimated effort against actual effort.
- Review workload distribution.
- Monitor future capacity.

Although functional, this workflow requires significant manual effort and becomes difficult to maintain as the number of tasks increases.

---

# Core Business Domains

Timetriq consists of five primary business domains.

## Task Management

Manage planned work.

## Time Tracking

Record actual work performed each day.

## Workload Planning

Distribute estimated work across available working days.

## Capacity Planning

Determine whether sufficient time is available for future work.

## Reporting

Provide meaningful summaries and business insights.

---

# Business Requirements

## BR-001 Create Tasks

The system shall allow users to create work items representing planned tasks.

Each task represents a single unit of planned work.

---

## BR-002 Edit Tasks

Users shall be able to modify task information whenever business requirements change.

---

## BR-003 Archive Tasks

Completed or obsolete tasks should be archived without affecting historical reporting.

Historical information must remain available.

---

## BR-004 Estimate Effort

Every task shall contain an estimated effort measured in hours.

Estimated effort represents the expected amount of work required to complete the task.

---

## BR-005 Schedule Tasks

Each task shall have:

- Planned Start Date
- Planned End Date

These dates define the planning window.

---

## BR-006 Daily Time Tracking

Users shall record the number of hours worked on a task for each working day.

Time entries represent actual work performed.

---

## BR-007 Actual Hours

The application shall automatically calculate total actual effort based on all recorded daily time entries.

Users should never manually calculate total hours.

---

## BR-008 Planned Workload

The application shall automatically distribute estimated work across all valid working days within the task schedule.

The purpose is to provide an expected daily workload.

---

## BR-009 Working Days

Only business working days should receive planned workload.

Weekends shall not receive planned work unless explicitly supported in future versions.

---

## BR-010 Holidays

Business holidays should be excluded from workload calculations.

Holiday management should remain configurable.

---

## BR-011 Leave Management

User leave should reduce available working capacity.

Future workload calculations must consider approved leave.

---

## BR-012 Variance Analysis

The system shall compare:

Estimated Effort

vs

Actual Effort

The resulting variance helps users evaluate estimation accuracy.

---

## BR-013 Capacity Planning

The application shall determine whether users have sufficient available working hours for additional tasks.

Capacity should be calculated using existing planned work.

---

## BR-014 Dashboard

Users shall have immediate visibility into:

- Current workload
- Remaining work
- Completed work
- Planned effort
- Actual effort
- Upcoming commitments

---

## BR-015 Historical Records

Historical task and time tracking data shall remain permanently available for reporting purposes.

---

## BR-016 Reporting

Users shall be able to generate reports that summarize work across different periods.

Reports should support future export functionality.

---

# Business Rules

The following business rules govern the system.

---

## Rule 1

Every task must have an estimated effort.

---

## Rule 2

Actual work is recorded using daily time entries.

---

## Rule 3

Total actual effort is derived from recorded time entries.

It must never be manually entered.

---

## Rule 4

Planned workload is calculated automatically.

Users should not manually distribute workload.

---

## Rule 5

Weekend days are excluded from workload planning.

---

## Rule 6

Future versions may exclude holidays and approved leave.

---

## Rule 7

Variance is calculated by comparing estimated effort against actual effort.

---

## Rule 8

Historical records must never be modified by system calculations.

---

## Rule 9

Business calculations should always be deterministic and reproducible.

The same input should always produce the same output.

---

# Business Constraints

The first release of Timetriq will support:

- Individual users
- Personal workload planning
- Daily time tracking
- Capacity forecasting

Future releases may introduce team-level planning.

---

# Assumptions

The following assumptions are currently valid.

- Estimated effort is measured in hours.
- Users manually log daily work.
- One task may span multiple working days.
- Multiple tasks may exist on the same day.
- Historical information should remain available indefinitely.

---

# Out of Scope

The following capabilities are intentionally excluded from the initial release.

- Payroll
- Billing
- Invoice generation
- Project accounting
- Chat
- File storage
- Team messaging
- Project budgeting
- HR management

---

# Business Success Criteria

Timetriq succeeds when users can:

- Plan work confidently.
- Record daily effort efficiently.
- Understand workload instantly.
- Compare planned effort against actual effort.
- Forecast future capacity.
- Reduce manual spreadsheet maintenance.
- Make better workload planning decisions.

---

# Guiding Principle

Every feature implemented in Timetriq should improve work planning, increase planning accuracy, reduce manual effort, and provide better visibility into how work is progressing.

If a feature does not contribute toward these objectives, it should be reconsidered before implementation.