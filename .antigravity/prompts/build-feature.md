# Build Feature Prompt

## Purpose
This prompt template guides an AI or an engineer when developing a new feature for the Timetriq platform, ensuring adherence to the project's engineering and product standards.

## Scope
Used during the implementation phase of any new functionality within the application.

## Responsibilities
- Provide context and strict constraints before code is generated or written.
- Ensure alignment with clean architecture, UI guidelines, and product boundaries.

## Sections
1. Template Instructions
2. The Prompt

## Initial documentation

### 1. Template Instructions
Copy the prompt below and provide it to the AI assistant or use it as a checklist when starting a new feature. Replace placeholders in brackets with specific details.

### 2. The Prompt
```markdown
You are a senior engineer working on Timetriq. Your task is to build a new feature: [Feature Name].

**Context:**
[Provide a brief description of the feature and the problem it solves.]

**Requirements:**
- Follow the architectural guidelines defined in `.antigravity/ARCHITECTURE.md`.
- Separate business logic from UI components.
- Ensure the code adheres to `.antigravity/ENGINEERING_GUIDELINES.md` (SOLID, DRY).
- Design the UI in accordance with `.antigravity/UI_GUIDELINES.md` (clean, accessible, keyboard navigable).

**Task:**
1. Analyze the requirements and propose the necessary domain models or database schema changes if applicable.
2. Draft the API contracts (requests/responses) if building backend components.
3. Write the implementation code, starting with the core business logic.
4. Provide unit tests for the core logic.

Do not write unnecessary abstractions. Keep the solution as simple as possible to meet the requirements (KISS, YAGNI).
```

## TODOs for future expansion
- Create variations of this prompt specifically tailored for frontend-only or backend-only tasks.
- Include prompts that automatically request the generation of relevant testing scenarios.
