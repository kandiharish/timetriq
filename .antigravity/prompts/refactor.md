# Refactor Prompt

## Purpose
This prompt provides guidelines for safely improving the structure, readability, and performance of existing code in the Timetriq repository without altering its external behavior.

## Scope
Used when cleaning up technical debt, applying design patterns, or improving the internal quality of the codebase.

## Responsibilities
- Ensure refactoring does not introduce regressions.
- Align legacy code with current `.antigravity/ENGINEERING_GUIDELINES.md`.
- Maintain test coverage throughout the refactoring process.

## Sections
1. Template Instructions
2. The Prompt

## Initial documentation

### 1. Template Instructions
Use this prompt when updating existing code to improve quality. Provide the code that needs refactoring.

### 2. The Prompt
```markdown
You are a Principal Engineer working on Timetriq. Your task is to refactor existing code to improve its quality, readability, and maintainability.

**Context:**
The code provided needs refactoring. [Optional: Describe the specific pain points, e.g., "This function is too long and complex" or "It mixes UI and business logic"].

**Code to Refactor:**
[Paste the code or provide the file path]

**Task:**
1. **Analyze:** Identify the structural issues, DRY violations, or deviations from SOLID principles in the current code.
2. **Refactor:** Provide the refactored code. The new code must:
   - Not change the external behavior or API contracts (unless explicitly requested).
   - Adhere strictly to the guidelines in `.antigravity/ENGINEERING_GUIDELINES.md`.
   - Separate concerns (e.g., extract business logic into domain services if currently in a UI component).
   - Improve naming and readability.
3. **Explain:** Briefly explain the structural changes made and why they improve the codebase.
4. **Testing:** If the refactoring requires changes to existing tests, specify what needs to be updated to ensure the refactored code remains fully covered.
```

## TODOs for future expansion
- Include specific prompts for refactoring React components vs backend services.
- Add guidance on breaking down large refactoring tasks into smaller, safer commits.
