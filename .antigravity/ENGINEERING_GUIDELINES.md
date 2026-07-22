# Timetriq Engineering Guidelines

Version: 1.0

---

# Purpose

This document defines the engineering standards and coding conventions for Timetriq.

Every contributor—human or AI—must follow these guidelines to ensure consistency, maintainability, and long-term scalability.

These guidelines apply to both the frontend and backend unless otherwise specified.

---

# Engineering Principles

Every implementation should be:

- Simple
- Readable
- Maintainable
- Testable
- Reusable
- Secure
- Consistent

Readable code is preferred over clever code.

---

# General Coding Rules

Always:

- Write self-explanatory code.
- Follow existing project conventions.
- Keep implementations simple.
- Minimize duplication.
- Prefer composition over inheritance.
- Keep responsibilities well defined.

Never:

- Introduce unnecessary complexity.
- Create shortcuts that increase technical debt.
- Ignore architecture rules.
- Leave unfinished placeholder implementations without explanation.

---

# Naming Conventions

Names should clearly communicate intent.

Good examples:

```
TaskRepository

CreateTaskRequest

WorkloadEngine

CapacityCalculator

calculateRemainingWork()

isTaskCompleted
```

Avoid:

```
temp

manager

helper

data

obj

x

utils2

abc
```

Use full words instead of abbreviations unless they are industry standard.

---

# File Naming

Use consistent naming.

Frontend

```
task-card.tsx

task-form.tsx

use-tasks.ts

task-service.ts
```

Backend

```
task_service.py

task_repository.py

capacity_service.py
```

Avoid inconsistent naming styles.

---

# Function Design

Functions should:

- Perform one responsibility.
- Be easy to understand.
- Have descriptive names.
- Return predictable results.

Avoid long functions.

If a function becomes difficult to read, extract smaller functions.

---

# Function Parameters

Keep parameter lists small.

Prefer passing structured objects over long parameter lists when appropriate.

Example:

Good

```
createTask(taskData)
```

Avoid

```
createTask(
    title,
    description,
    estimatedHours,
    startDate,
    endDate,
    priority,
    ...
)
```

---

# Class Design

Classes should follow the Single Responsibility Principle.

One class should solve one problem.

Avoid large "manager" or "utility" classes.

---

# Components (Frontend)

Components should:

- Be small
- Be reusable
- Be focused
- Receive clear props

Avoid components responsible for:

- Fetching data
- Business calculations
- Rendering everything

Split responsibilities when necessary.

---

# Hooks

Custom hooks should encapsulate reusable behavior.

Examples:

```
useTasks()

useCalendar()

useReports()

useCapacity()
```

Hooks should not become mini applications.

---

# State Management

Keep state as close as possible to where it is used.

Use:

- Local state for UI
- Zustand for global UI state
- TanStack Query for server state

Avoid unnecessary global state.

---

# Business Logic

Business rules belong only in the Business Engine.

Never calculate:

- Capacity
- Progress
- Variance
- Remaining Work

inside:

- React Components
- API Routes
- Database Queries

Always reuse existing business services.

---

# Error Handling

Every expected failure should be handled.

Provide meaningful messages.

Example:

Good

```
Estimated hours must be greater than zero.
```

Avoid

```
Something went wrong.
```

Never swallow exceptions silently.

---

# Logging

Log meaningful events.

Include:

- Request ID
- User ID
- Action
- Error Context

Never log:

- Passwords
- Tokens
- Secrets
- Sensitive personal information

---

# Comments

Code should explain itself.

Use comments only when explaining:

- Business reasoning
- Non-obvious decisions
- Complex algorithms

Avoid comments that simply restate code.

Bad

```python
# Increment i
i += 1
```

Good

```python
# Redistribute rounding difference to the final working day
```

---

# Code Duplication

Before writing new code:

Search the codebase.

If similar functionality exists:

- Reuse it
- Extend it
- Refactor if necessary

Do not duplicate business logic.

---

# Dependency Management

Before adding a dependency ask:

- Is it required?
- Is it actively maintained?
- Can the standard library solve this?
- Can an existing dependency solve this?

Keep dependencies minimal.

---

# Configuration

Configuration belongs in configuration files.

Never hardcode:

- URLs
- Secrets
- Environment values
- Credentials

---

# Security

Always:

- Validate input
- Verify permissions
- Handle errors safely
- Sanitize responses

Never trust frontend validation.

---

# Performance

Optimize after correctness.

Prefer:

- Efficient algorithms
- Efficient queries
- Lazy loading
- Pagination

Avoid premature optimization.

---

# Testing Expectations

Every new feature should include appropriate tests.

Priority:

1. Business logic
2. API behavior
3. UI interactions

Critical calculations require comprehensive unit tests.

---

# Refactoring

Refactor only when it provides measurable improvements.

Acceptable reasons:

- Better readability
- Reduced duplication
- Improved maintainability
- Better architecture

Avoid cosmetic refactoring.

---

# Git Practices

Commits should be:

- Small
- Focused
- Atomic

Good commit messages:

```
feat(tasks): add task creation endpoint

fix(workload): correct holiday exclusion logic

refactor(calendar): simplify workload rendering
```

Avoid:

```
update

changes

fix

final

misc
```

---

# Pull Request Checklist

Before completing work verify:

- Code follows architecture.
- Tests pass.
- No duplicated logic exists.
- Documentation is updated.
- Naming follows conventions.
- Security considerations reviewed.

---

# AI Code Generation Rules

When generating code:

Read existing code first.

Follow existing patterns.

Avoid unnecessary rewrites.

Do not invent architecture.

Do not introduce undocumented behavior.

Prefer modifying existing modules over creating new abstractions.

Explain significant architectural decisions.

---

# Definition of Done

Implementation is complete only when:

- Requirements are satisfied.
- Code follows architecture.
- Tests pass.
- Documentation is updated.
- Error handling is complete.
- Validation is implemented.
- No known critical issues remain.

---

# Continuous Improvement

Whenever reviewing code, identify opportunities to improve:

- Readability
- Reusability
- Maintainability
- Testability
- Performance

Recommendations should be practical and supported by clear reasoning.

---

# Final Principle

Engineering excellence is achieved through consistency, discipline, and thoughtful decision-making.

Every line of code added to Timetriq should make the project easier to maintain, easier to understand, and more reliable for future contributors.