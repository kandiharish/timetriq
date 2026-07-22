# Debug Prompt

## Purpose
This prompt provides a structured approach for troubleshooting and debugging complex issues within the Timetriq application.

## Scope
Used when encountering unexpected behavior, performance regressions, or test failures that are not immediately obvious.

## Responsibilities
- Encourage a systematic, hypothesis-driven approach to debugging.
- Prevent random "guessing and checking" modifications.
- Ensure the root cause is addressed rather than just treating symptoms.

## Sections
1. Template Instructions
2. The Prompt

## Initial documentation

### 1. Template Instructions
Use this prompt when stuck on a bug. Provide the necessary logs and context to the AI assistant to help analyze the issue.

### 2. The Prompt
```markdown
You are a senior debugging specialist working on Timetriq.

**Context:**
We are experiencing a bug: [Describe the bug, expected behavior vs actual behavior].

**Available Information:**
- [Paste relevant error logs, stack traces, or terminal output]
- [Provide the specific file paths or code snippets involved]

**Task:**
Do not immediately write a code fix. Instead, follow these steps:
1. **Analyze:** Based on the logs and code provided, what are the potential root causes of this issue?
2. **Hypothesize:** State your primary hypothesis for why this bug is occurring.
3. **Verify (Mental Check):** If your hypothesis is true, what other parts of the system might be affected? Does this align with the architecture defined in `.antigravity/ARCHITECTURE.md`?
4. **Propose Fix:** Once the root cause is logically identified, provide the specific code changes to fix it. Explain *why* this fix addresses the root cause.
5. **Prevent Regression:** Suggest a test case (unit or integration) that would have caught this bug and will prevent it from happening again.
```

## TODOs for future expansion
- Include specific instructions for debugging frontend state issues vs backend logic issues.
- Add guidance on how to use specific debugging tools (e.g., Chrome DevTools, backend debuggers).
