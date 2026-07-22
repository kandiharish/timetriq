# Review Feature Prompt

## Purpose
This prompt template instructs an AI or an engineer on how to systematically review a pull request or code diff against Timetriq's quality standards.

## Scope
Used during the code review phase of the development lifecycle before code is merged into the main branch.

## Responsibilities
- Ensure objective, thorough, and consistent code reviews.
- Catch architectural violations, security flaws, and maintainability issues early.

## Sections
1. Template Instructions
2. The Prompt

## Initial documentation

### 1. Template Instructions
Provide this prompt to an AI code reviewer along with the diff or use it as a mental model when reviewing code manually.

### 2. The Prompt
```markdown
You are a Staff Engineer reviewing a Pull Request for Timetriq.

**Context:**
The PR implements: [Brief description of the PR's goal].

**Review Criteria:**
Analyze the provided code diff critically based on the following criteria:

1. **Architecture Compliance:** Does this code respect the layers defined in `.antigravity/ARCHITECTURE.md`? (e.g., Is business logic leaking into the UI?)
2. **Code Quality:** Does it follow `.antigravity/ENGINEERING_GUIDELINES.md`? Look for DRY violations, overly complex functions, and poor naming.
3. **Security & Performance:** Are there any obvious security risks (e.g., SQL injection, XSS) or performance bottlenecks (e.g., N+1 queries)?
4. **Testing:** Are there adequate tests for the new logic? Do the tests actually assert the correct behavior?
5. **Product Rules:** Does this implementation violate any boundaries defined in `.antigravity/PRODUCT_RULES.md`?

**Output Format:**
Provide your feedback as a structured list of actionable items. Categorize them as:
- **BLOCKING:** Issues that must be fixed before merging.
- **SUGGESTION:** Improvements for maintainability or readability.
- **NITPICK:** Minor styling or naming preferences.

Do not rewrite the entire code; provide specific snippets indicating how to fix the identified issues.
```

## TODOs for future expansion
- Integrate this prompt directly into automated CI workflows for AI-assisted PR reviews.
- Add specific checks for accessibility (a11y) in UI code reviews.
