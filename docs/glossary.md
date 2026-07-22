# Glossary

Version: 1.0

---

# Purpose

This glossary defines the business, technical, and domain-specific terminology used throughout Timetriq.

It serves as the authoritative reference for developers, designers, QA engineers, product managers, stakeholders, and AI coding assistants.

Unless otherwise specified, all project documentation should use the definitions provided in this document.

---

# A

## API

Application Programming Interface.

The communication layer between the frontend and backend.

---

## Authentication

The process of verifying a user's identity.

Timetriq uses Firebase Authentication.

---

## Authorization

The process of determining what an authenticated user is allowed to access or modify.

---

## Archive

The process of marking data as inactive while preserving it for historical reference.

Archived records remain available for reporting but are excluded from normal workflows.

---

# B

## Business Engine

The core domain layer responsible for implementing business rules and calculations.

It includes workload planning, capacity calculation, progress tracking, and variance analysis.

---

## Business Logic

The collection of rules and calculations that define how Timetriq behaves.

Business logic is independent of the frontend, API, and database.

---

# C

## Calendar

A visual representation of planned work, workload, and capacity across days, weeks, or months.

---

## Capacity

The maximum amount of work that can be performed during a working day.

Default capacity is measured in hours.

---

## Capacity Planning

The process of determining whether additional work can be scheduled without exceeding available capacity.

---

## CRUD

Create, Read, Update, and Delete.

The four basic operations supported by most business applications.

---

# D

## Dashboard

The primary landing page providing an overview of workload, tasks, progress, and capacity.

---

## Domain

A specific business area within the application.

Examples:

- Task Management
- Time Tracking
- Workload Planning

---

## Draft

An initial task state before active planning begins.

---

# E

## Estimated Hours

The amount of effort expected to complete a task.

Used as the basis for workload planning.

---

## Entity

A core business object represented in the system.

Examples:

- User
- Task
- Time Entry
- Holiday

---

# F

## Firestore

Google Cloud Firestore.

The primary database used by Timetriq.

---

## Functional Requirement

A system capability that defines what the application must do.

---

# G

## Guiding Principle

A high-level rule that influences architecture, design, and implementation decisions.

---

# H

## Holiday

A configured non-working day.

The Workload Engine excludes holidays when distributing planned work.

---

# I

## Integration Test

A test verifying that multiple components work together correctly.

---

# L

## Leave

An approved period during which a user is unavailable for work.

Leave is excluded from workload calculations.

---

# M

## Milestone

A significant point in the project roadmap representing the completion of a major phase.

---

## MVP (Minimum Viable Product)

The first production-ready version of Timetriq containing only essential functionality.

---

# P

## Planned Hours

The daily workload allocated by the Workload Engine based on estimated effort and available working days.

---

## Progress

The percentage of estimated work completed based on recorded actual hours.

---

## Product Roadmap

A strategic plan outlining future development phases and feature priorities.

---

# R

## Remaining Work

Estimated Hours minus Actual Hours.

Represents the effort still required to complete a task.

---

## Report

A summarized view of business data over a specified period.

Examples include workload reports, capacity reports, and variance reports.

---

# S

## Sprint

A fixed period of development during which a defined set of work is completed.

---

## Stakeholder

Any individual or group with an interest in the success of Timetriq.

Examples:

- Product Owner
- Developer
- End User
- Project Manager

---

## Status

The current lifecycle state of a task.

Examples:

- Draft
- Planned
- In Progress
- Completed
- Archived

---

# T

## Task

A unit of planned work.

Tasks include estimated effort, scheduling information, and progress tracking.

---

## Time Entry

A record of actual work performed on a specific date.

Multiple time entries may exist for the same task.

---

## Time Tracking

The process of recording actual work performed.

---

# U

## User Story

A concise description of a feature from the user's perspective.

Format:

"As a <user>, I want <goal>, so that <benefit>."

---

# V

## Variance

The difference between Actual Hours and Estimated Hours.

Formula:

```
Variance = Actual Hours - Estimated Hours
```

Positive variance indicates more effort than estimated.

Negative variance indicates less effort than estimated.

---

# W

## Workload

The total amount of planned work assigned to a user over a given period.

---

## Workload Distribution

The process of allocating estimated effort across valid working days.

Performed automatically by the Workload Engine.

---

## Workload Engine

The domain component responsible for:

- Working day calculation
- Workload distribution
- Capacity calculation
- Forecast generation

It is the planning intelligence of Timetriq.

---

## Working Day

A day eligible for planned work.

By default:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday

Weekends, holidays, and approved leave are excluded.

---

# X

No project-specific terms currently defined.

---

# Y

No project-specific terms currently defined.

---

# Z

## Zero Trust

A security principle stating that no request, user, or system should be trusted automatically.

Every request must be authenticated and authorized.

---

# Acronyms

| Acronym | Meaning |
|----------|---------|
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| E2E | End-to-End Testing |
| FR | Functional Requirement |
| MVP | Minimum Viable Product |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| UI | User Interface |
| UX | User Experience |

---

# Naming Conventions

To maintain consistency:

- Use **Task**, not "Job" or "Activity".
- Use **Time Entry**, not "Timesheet Row".
- Use **Estimated Hours**, not "Budget Hours".
- Use **Actual Hours**, not "Tracked Hours".
- Use **Workload**, not "Allocation" unless referring to future resource allocation features.
- Use **Capacity**, not "Availability" when referring to daily work limits.
- Use **Workload Engine** for the planning module.
- Use **Business Engine** for shared domain calculations.

---

# Maintaining the Glossary

When introducing new business concepts or technical terminology:

1. Check whether the term already exists.
2. Use existing definitions whenever possible.
3. Add new terms alphabetically.
4. Keep definitions concise and unambiguous.
5. Update related documentation if terminology changes.

---

# Guiding Principle

A shared vocabulary leads to shared understanding.

Every document, feature, API, test case, and discussion should use the terminology defined in this glossary to ensure consistency across the Timetriq project.