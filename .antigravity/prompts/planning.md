# Planning Prompt

## Purpose
This prompt ensures that any significant architectural change, new feature, or complex refactor is thoroughly planned and documented before implementation begins.

## Scope
Used during the planning phase of the development lifecycle, typically when addressing epics or complex user stories.

## Responsibilities
- Force a "documentation first" approach.
- Align technical solutions with business requirements and product rules.
- Identify potential risks and dependencies early.

## Sections
1. Template Instructions
2. The Prompt

## Initial documentation

### 1. Template Instructions
Use this prompt to generate technical design documents or implementation plans before writing application code.

### 2. The Prompt
```markdown
You are the Lead Architect for Timetriq.

**Context:**
We need to plan the implementation of: [Describe the major feature, epic, or architectural change].

**Task:**
Create a detailed implementation plan. Do not write the final application code yet. The plan must adhere to our clean architecture and engineering guidelines.

**Deliverable Format (Markdown Document):**
1. **Summary:** A brief overview of what we are building and why.
2. **System Impact:** How does this change interact with existing components (Frontend, Backend, Database)? Reference specific files if known.
3. **Proposed Architecture:** Detail the domain models, API endpoints, and UI components required.
4. **Data Design:** Specify any changes to the database schema or data flow.
5. **Implementation Steps:** Break the work down into small, logical, testable PRs.
6. **Risks & Mitigation:** What could go wrong? How will we handle edge cases?

Ensure the plan strictly follows the constraints in `.antigravity/PRODUCT_RULES.md` and `.antigravity/ARCHITECTURE.md`.
```

## TODOs for future expansion
- Integrate this prompt with standard RFC (Request for Comments) templates.
- Add specific planning checks for security and performance implications.
