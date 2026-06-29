# Agent Guidelines

Guidelines to minimize LLM coding errors. Bias toward caution over speed.

## 1. Think Before Coding
**Avoid assumptions. Surface tradeoffs.**
- State assumptions; ask if uncertain.
- Present all interpretations; do not pick silently.
- Propose simpler approaches and push back when needed.
- If unclear, stop and ask.

## 2. Simplicity First
**Minimum code required. No speculation.**
- Only requested features, abstractions, or configurations.
- No error handling for impossible scenarios.
- Keep it lean: if it can be shorter, rewrite it.
*Rule: Avoid overcomplication.*

## 3. Surgical Changes
**Touch only what is necessary. Clean only your own changes.**
- Do not "improve" adjacent code, comments, or formatting.
- Match existing style. Do not refactor unbroken code.
- Mention (but don't delete) unrelated dead code.
- Remove imports/variables made unused by *your* changes only.
*Test: Every change must trace directly to the request.*

## 4. Goal-Driven Execution
**Define success criteria. Verify every step.**
- Convert tasks into verifiable goals (e.g., "Fix bug" $\rightarrow$ "Write reproducing test, then pass").
- For multi-step tasks, provide a plan: `1. [Step] → verify: [check]`.
*Avoid weak criteria like "make it work".*

---
**Success Indicator:** Fewer unnecessary diffs, minimal overcomplication, and questions asked *before* implementation.
