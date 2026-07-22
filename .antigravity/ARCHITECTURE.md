# Timetriq Architecture Guidelines

Version: 1.0

---

# Purpose

This document defines the architectural rules for Timetriq.

Every implementation must follow these rules.

Architecture is more important than implementation speed.

If a requested implementation violates these principles, explain the issue before writing code.

---

# Architecture Philosophy

Timetriq is designed as a long-term SaaS product.

Architecture decisions should prioritize:

- Maintainability
- Scalability
- Simplicity
- Testability
- Separation of Concerns
- Domain-Driven Design

Never optimize for short-term convenience.

---

# Core Layers

Timetriq follows a layered architecture.

```
Frontend

↓

API Layer

↓

Application Layer

↓

Business Layer

↓

Repository Layer

↓

Database
```

Each layer has exactly one responsibility.

---

# Layer Responsibilities

## Frontend

Responsible for:

- UI
- User interactions
- Forms
- Navigation
- Display

Never:

- Perform business calculations
- Access the database directly
- Duplicate backend logic

---

## API Layer

Responsible for:

- Authentication
- Authorization
- Request validation
- Response formatting
- Calling application services

Never:

- Implement business rules
- Query Firestore directly
- Perform calculations

API routes should remain thin.

---

## Application Layer

Responsible for coordinating use cases.

Examples:

- Create Task
- Update Task
- Log Time
- Generate Report

Application services orchestrate work.

They do not own business rules.

---

## Business Layer

This is the heart of Timetriq.

Responsible for:

- Workload distribution
- Capacity calculation
- Progress calculation
- Variance calculation
- Remaining work
- Business validation

Business rules must exist only here.

---

## Repository Layer

Responsible for persistence.

Responsibilities:

- Read
- Write
- Update
- Archive

Repositories know the database.

Business services do not.

---

## Database

Stores source data only.

Never store:

- Progress
- Capacity
- Variance
- Remaining Work
- Planned Workload

Always derive calculated values.

---

# Dependency Rules

Dependencies flow in one direction.

```
Frontend

↓

API

↓

Application

↓

Business

↓

Repository

↓

Database
```

Lower layers must never depend on higher layers.

---

# Module Boundaries

Organize code by business capability.

Examples:

- Authentication
- Dashboard
- Tasks
- Time Tracking
- Calendar
- Reports
- Settings

Modules should be cohesive and loosely coupled.

---

# Single Responsibility Principle

Each class, service, hook, and component should have one clear purpose.

Bad:

```
TaskManager

- Updates tasks
- Calculates workload
- Sends emails
- Generates reports
```

Good:

```
TaskService

WorkloadEngine

NotificationService

ReportService
```

---

# Business Logic

Business rules are implemented once.

Never duplicate calculations.

Never calculate workload in:

- React
- API Routes
- Database Queries

Always use the Business Engine.

---

# Source of Truth

Store facts.

Calculate insights.

Facts:

- Tasks
- Time Entries
- Holidays
- Settings

Insights:

- Capacity
- Variance
- Progress
- Remaining Work

---

# Communication Rules

Frontend communicates only with APIs.

APIs communicate with Application Services.

Application Services communicate with Business Services.

Business Services communicate with Repositories.

Repositories communicate with Firestore.

Never bypass layers.

---

# Error Handling

Errors should propagate upward.

Database

↓

Repository

↓

Business

↓

Application

↓

API

↓

Frontend

Every layer adds appropriate context.

---

# Validation Strategy

Validation occurs in stages.

Frontend

Basic UX validation.

↓

API

Schema validation.

↓

Business Layer

Business rule validation.

↓

Repository

Persistence validation.

Each layer validates only what it owns.

---

# State Ownership

Frontend owns:

- UI state
- Form state
- Navigation state

Backend owns:

- Business state
- Calculations
- Persistence
- Security

Never move backend responsibilities into the frontend.

---

# API Design

RESTful.

Versioned.

Consistent.

Predictable.

Plural resource names.

Examples:

```
/api/v1/tasks

/api/v1/time-entries

/api/v1/reports
```

---

# Database Design Principles

Store normalized source data.

Avoid duplication.

Keep documents focused.

Design for query efficiency.

Avoid deeply nested structures.

---

# Extensibility

Design modules so future capabilities can be added without major refactoring.

Future modules include:

- AI
- Teams
- Organizations
- Notifications
- Analytics
- Mobile

Avoid hardcoded assumptions that prevent future growth.

---

# Performance Principles

Optimize only after correctness.

Prefer:

- Efficient queries
- Incremental recalculation
- Lazy loading
- Caching where appropriate

Never compromise correctness.

---

# Testing Strategy

Business logic must have the highest level of automated testing.

Test:

- Services
- Workload Engine
- Capacity calculations
- API endpoints
- UI behavior

Architecture should support testing naturally.

---

# Security Boundaries

Authentication belongs to the backend.

Authorization belongs to the backend.

Secrets belong outside the codebase.

Never trust client input.

---

# AI Development Rules

Before modifying existing code:

Read related files.

Understand the architecture.

Reuse existing abstractions.

Avoid introducing new patterns.

Prefer consistency over novelty.

---

# Architectural Violations

Never:

- Put business logic in React components.
- Access Firestore from the frontend.
- Duplicate calculations.
- Skip validation.
- Create circular dependencies.
- Create "utility" files containing unrelated logic.
- Mix UI and business concerns.
- Couple modules unnecessarily.

If implementation requires one of these, stop and explain why.

---

# Refactoring Guidelines

Refactor only when:

- Readability improves.
- Duplication decreases.
- Maintainability improves.
- Performance improves without sacrificing clarity.

Avoid unnecessary rewrites.

---

# Documentation

Every major architectural change should update:

- System Architecture
- Database Design
- API Specification
- Business Logic
- Architecture Decision Records (ADR)

Code and documentation must remain synchronized.

---

# Definition of Good Architecture

Good architecture enables developers to:

- Add features safely.
- Understand code quickly.
- Test business rules independently.
- Replace infrastructure without rewriting domain logic.
- Scale the application without major redesign.

---

# Final Principle

Architecture is a long-term investment.

Every decision should make Timetriq easier to understand, easier to maintain, and easier to extend.

When faced with multiple implementation options, choose the one that best preserves architectural integrity, even if it requires more initial effort.