# Database Design

Version: 1.0

---

# Purpose

This document defines the logical database architecture for Timetriq.

It serves as the single source of truth for how application data is structured, stored, queried, and maintained.

This document focuses on logical data design and intentionally avoids implementation-specific code.

---

# Database Goals

The database architecture is designed to provide:

- Scalability
- Data Integrity
- High Performance
- Simplicity
- Maintainability
- Security
- Extensibility

---

# Database Technology

Primary Database

- Firebase Firestore

Reason for Selection

- Fully managed
- Scalable
- Serverless
- Real-time support
- Flexible document model
- Easy integration with Firebase Authentication

---

# Design Principles

The database follows these principles.

## Single Source of Truth

Store only source data.

Never store derived values unless absolutely necessary.

Examples

Store:

- Tasks
- Time Entries
- Holidays
- User Settings

Calculate:

- Planned Hours
- Actual Hours
- Variance
- Remaining Work
- Capacity
- Reports

---

## Normalization

Avoid unnecessary duplication.

Each entity owns its own data.

---

## Auditability

Every important document should record:

- Created By
- Created At
- Updated At
- Last Modified By

---

## Soft Deletes

Records should be archived instead of permanently deleted whenever possible.

---

# Core Entities

Timetriq contains the following primary entities.

- Users
- Tasks
- Time Entries
- Holidays
- User Preferences

Future entities

- Teams
- Organizations
- Notifications
- AI Recommendations

---

# Entity Relationships

```
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Tasks       User Settings
 │
 │
 ▼
Time Entries
```

One User

↓

Many Tasks

One Task

↓

Many Time Entries

---

# Entity Overview

## Users

Represents an authenticated user.

Responsibilities

- Identity
- Preferences
- Ownership of work

---

## Tasks

Represents planned work.

Responsibilities

- Planning
- Scheduling
- Estimation
- Status

---

## Time Entries

Represents actual work performed.

Responsibilities

- Daily hours
- Historical tracking
- Progress measurement

---

## Holidays

Represents non-working days.

Responsibilities

- Capacity calculation
- Workload calculation

---

## User Settings

Stores user preferences.

Responsibilities

- Working hours
- Timezone
- Calendar settings
- Preferences

---

# Collection Design

Firestore collections.

```
users

tasks

timeEntries

holidays

settings
```

Future collections

```
organizations

teams

notifications

analytics

reports
```

---

# Data Ownership

Every document has exactly one owner.

Users own

- Tasks
- Time Entries
- Settings

Tasks own

- Time Entries

Ownership should always be explicit.

---

# Naming Conventions

Collections

camelCase

Example

timeEntries

Field Names

camelCase

Example

estimatedHours

startDate

createdAt

updatedAt

Document IDs

Firestore generated IDs unless business identifiers are required.

---

# Required Audit Fields

Every document should contain:

createdAt

updatedAt

createdBy

updatedBy

isArchived

---

# Data Lifecycle

Task Lifecycle

Created

↓

Updated

↓

In Progress

↓

Completed

↓

Archived

Time Entry Lifecycle

Created

↓

Updated

↓

Locked (Future)

---

# Query Patterns

The database should efficiently support queries such as:

- Active Tasks
- Completed Tasks
- Tasks by Date
- Tasks by Status
- Today's Workload
- This Week's Workload
- Time Entries by Task
- Time Entries by Date
- Capacity by Day
- Historical Reports

---

# Indexing Strategy

Indexes should prioritize:

User ID

Task Status

Start Date

End Date

Created Date

Time Entry Date

Composite indexes should be added only when required.

---

# Data Integrity Rules

A Task cannot exist without an owner.

A Time Entry cannot exist without a Task.

Estimated Hours must be positive.

Time Entries cannot contain negative hours.

Dates must remain valid.

---

# Soft Delete Strategy

Records should not be permanently removed.

Instead

```
isArchived = true
```

Archived records should be excluded from normal queries while remaining available for historical reporting.

---

# Security Model

Users may only access their own data.

Every query should be scoped to the authenticated user.

Direct database access from the frontend is prohibited for protected operations.

Authorization must always be enforced.

---

# Performance Strategy

Avoid large documents.

Avoid unnecessary nesting.

Avoid duplicate information.

Query only required fields.

Paginate large result sets.

Design for growth from the beginning.

---

# Future Expansion

The database should support future additions including:

- Organizations
- Teams
- Shared Projects
- Role-Based Access Control
- AI Recommendations
- Notifications
- Audit Logs
- Attachments
- Comments

No major redesign should be required.

---

# Database Constraints

The database stores facts.

Business calculations belong to the Business Layer.

Presentation belongs to the Frontend.

Validation belongs to the Backend.

The database should remain a reliable source of truth.

---

# Guiding Principle

The database should remain simple, predictable, and scalable.

Data should be modeled to represent real business entities, not UI screens or spreadsheet layouts.

Every schema decision should prioritize long-term maintainability, consistency, and query efficiency.