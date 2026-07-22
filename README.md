# Timetriq

**Work Intelligence Platform**

Timetriq is a modern web application designed to replace fragile spreadsheet-based workload planning. It provides a robust environment for managing tasks, estimating effort, logging daily hours seamlessly, and generating accurate capacity forecasts.

---

## Documentation

Timetriq follows a strict **Documentation-First** engineering philosophy. Before writing any code or making architectural changes, please review the relevant documentation.

### ⚙️ System & Engineering (.antigravity)
This directory contains the immutable rules governing how we build software.
- [System Configuration](.antigravity/SYSTEM.md)
- [Architecture](.antigravity/ARCHITECTURE.md)
- [Engineering Guidelines](.antigravity/ENGINEERING_GUIDELINES.md)
- [Product Rules](.antigravity/PRODUCT_RULES.md)
- [UI Guidelines](.antigravity/UI_GUIDELINES.md)
- [Development Workflow](.antigravity/DEVELOPMENT_WORKFLOW.md)
- **Prompts**: Standardized AI prompts for [Building](.antigravity/prompts/build-feature.md), [Reviewing](.antigravity/prompts/review-feature.md), [Debugging](.antigravity/prompts/debug.md), [Planning](.antigravity/prompts/planning.md), and [Refactoring](.antigravity/prompts/refactor.md).

### 📚 Product & Design (docs)
This directory contains the business requirements, domain logic, and technical specifications.
- **Product**: [Vision](docs/01-product-vision.md) | [Business Requirements](docs/02-business-requirements.md) | [User Stories](docs/04-user-stories.md) | [Roadmap](docs/13-roadmap.md)
- **Technical Specs**: [System Architecture](docs/05-system-architecture.md) | [Database Design](docs/06-database-design.md) | [API Spec](docs/07-api-specification.md)
- **Domain Logic**: [Functional Requirements](docs/03-functional-requirements.md) | [Business Logic](docs/08-business-logic.md) | [Workload Engine](docs/09-workload-engine.md)
- **Standards**: [UI/UX](docs/10-ui-ux.md) | [Testing](docs/11-testing.md) | [Security](docs/12-security.md)
- **Reference**: [Glossary](docs/glossary.md) | [Decisions (ADRs)](docs/decisions.md)

---

## Project Structure

```text
timetriq/
├── .antigravity/      # Engineering standards, architecture, and AI prompts
├── backend/           # (Pending Implementation) Core API and Workload Engine
├── docs/              # Product requirements and technical specifications
├── frontend/          # (Pending Implementation) Single Page Application
└── README.md          # Project overview
```

---

## Getting Started (Coming Soon)

*Instructions for local environment setup, running tests, and deployment will be added here once Phase 1 development begins.*
