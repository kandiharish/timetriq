# Timetriq AI Master Instructions

Version: 1.0

---

# Purpose

This is the entry point for all AI-assisted development in Timetriq.

Before responding to any request, use this document to determine:

- What type of task is being requested
- Which project documentation is relevant
- Which AI instruction files should be consulted
- Which implementation workflow should be followed

This file acts as the orchestrator for all AI behavior.

Do not begin implementation until the appropriate documents have been identified and understood.

---

# Primary Responsibilities

For every request:

1. Understand the request.
2. Classify the task.
3. Load the required instruction files.
4. Review relevant project documentation.
5. Analyze the existing implementation.
6. Create an implementation plan.
7. Implement incrementally.
8. Validate the implementation.
9. Update documentation if necessary.
10. Present the final response.

Never skip these steps unless explicitly instructed.

---

# Project Context

Project Name

Timetriq

Product Type

Work Intelligence Platform

Primary Goal

Replace spreadsheet-based workload planning with a scalable web application.

Core Domains

- Task Planning
- Time Tracking
- Workload Planning
- Capacity Planning
- Reporting

---

# Mandatory Loading Order

Always begin with:

1. SYSTEM.md

Then determine which additional instruction files are required.

Never ignore SYSTEM.md.

---

# Task Classification

Identify the request category before proceeding.

Possible categories include:

- Feature Development
- Bug Fix
- Refactoring
- UI Development
- API Development
- Database Design
- Business Logic
- Architecture
- Testing
- Documentation
- Code Review
- Performance Optimization
- Security
- Deployment

If a request belongs to multiple categories, load all relevant instruction files.

---

# Instruction File Routing

## General Questions

Load:

- SYSTEM.md

---

## Feature Development

Load:

- SYSTEM.md
- PRODUCT_RULES.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md
- DEVELOPMENT_WORKFLOW.md

---

## Business Logic

Load:

- SYSTEM.md
- PRODUCT_RULES.md
- ARCHITECTURE.md
- DEVELOPMENT_WORKFLOW.md

---

## UI Development

Load:

- SYSTEM.md
- UI_GUIDELINES.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md

---

## API Development

Load:

- SYSTEM.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md
- DEVELOPMENT_WORKFLOW.md

---

## Database Design

Load:

- SYSTEM.md
- PRODUCT_RULES.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md

---

## Bug Fix

Load:

- SYSTEM.md
- DEVELOPMENT_WORKFLOW.md
- ENGINEERING_GUIDELINES.md

---

## Refactoring

Load:

- SYSTEM.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md
- DEVELOPMENT_WORKFLOW.md

---

## Testing

Load:

- SYSTEM.md
- ENGINEERING_GUIDELINES.md
- DEVELOPMENT_WORKFLOW.md

---

## Documentation

Load:

- SYSTEM.md

and the relevant document being updated.

---

## Architecture

Load:

- SYSTEM.md
- ARCHITECTURE.md
- ENGINEERING_GUIDELINES.md

---

## Security

Load:

- SYSTEM.md
- ENGINEERING_GUIDELINES.md
- ARCHITECTURE.md

---

# Documentation Routing

When implementation affects documentation, consult the appropriate file(s):

Product Vision

docs/01-product-vision.md

Business Rules

docs/02-business-requirements.md

Functional Requirements

docs/03-functional-requirements.md

User Stories

docs/04-user-stories.md

Architecture

docs/05-system-architecture.md

Database

docs/06-database-design.md

API

docs/07-api-specification.md

Business Logic

docs/08-business-logic.md

Workload Engine

docs/09-workload-engine.md

UI/UX

docs/10-ui-ux.md

Testing

docs/11-testing.md

Security

docs/12-security.md

Roadmap

docs/13-roadmap.md

Architecture Decisions

docs/decisions.md

Glossary

docs/glossary.md

---

# Standard Development Workflow

Every task follows this process.

```
Understand Request
        ↓
Classify Request
        ↓
Load AI Instruction Files
        ↓
Read Relevant Documentation
        ↓
Inspect Existing Code
        ↓
Create Implementation Plan
        ↓
Validate Against Architecture
        ↓
Implement Incrementally
        ↓
Review Changes
        ↓
Run Tests
        ↓
Update Documentation
        ↓
Deliver Response
```

Do not jump directly from the request to implementation.

---

# Before Writing Code

Always ask yourself:

- Do I understand the business problem?
- Which documentation applies?
- Which architectural rules apply?
- Which existing modules should be reused?
- Does similar functionality already exist?
- Can this be implemented without introducing technical debt?

If any answer is unknown:

Stop and investigate.

---

# Existing Code Policy

Always:

- Read before modifying.
- Preserve existing patterns.
- Minimize unnecessary changes.
- Prefer extending existing modules.

Never:

- Rewrite working code without justification.
- Duplicate business logic.
- Introduce inconsistent architecture.
- Ignore project conventions.

---

# Validation Gates

Before considering work complete, verify:

Business Rules ✓

Architecture ✓

Naming ✓

Validation ✓

Error Handling ✓

Security ✓

Performance ✓

Testing ✓

Documentation ✓

If any gate fails, continue improving before completing the task.

---

# Documentation Update Rules

Update documentation whenever changes affect:

- Business behavior
- APIs
- Database schema
- Architecture
- Security
- UI patterns
- Development workflow

Code and documentation must remain synchronized.

---

# AI Communication Style

When responding:

1. Briefly summarize the understanding of the request.
2. Mention the implementation approach.
3. Explain important architectural decisions.
4. Highlight assumptions.
5. Mention risks if any.
6. Present implementation.

Avoid unnecessary verbosity.

Do not invent undocumented behavior.

---

# Escalation Rules

If requirements conflict:

Do not guess.

Explain:

- What conflicts exist.
- Which documentation conflicts.
- Recommended resolution.

If architecture would be violated:

Do not proceed until an alternative is proposed.

---

# Guiding Principles

Always prioritize:

1. Business correctness
2. Architectural integrity
3. Maintainability
4. Simplicity
5. Testability
6. Security
7. Performance

Never sacrifice long-term quality for short-term speed.

---

# Final Principle

Every task should leave Timetriq in a better state than before.

The objective is not simply to generate code.

The objective is to build a production-quality Work Intelligence Platform that remains clean, scalable, maintainable, and understandable as it evolves.