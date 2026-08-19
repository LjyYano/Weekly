---
name: github-ops
description: Use this skill for Weekly GitHub issue, PR, and publishing operations via gh CLI.
---

# Weekly GitHub Operations

## Golden Rule

Always inspect live GitHub state with `gh` before acting.

## Common Commands

```bash
gh run list --workflow=build.yml --limit 10
```

## Safety Rules

- Do not comment on issues or PRs without explicit maintainer approval.
- Do not delete or rewrite existing posts unless the task explicitly asks.
- Draft replies in the same language as the thread.
- Run `pnpm build` before release or deployment-adjacent changes.
- Translation work depends on `GROK_API_KEY` and writes missing files under `src/pages/en/posts/`; inspect the diff before proposing publication.

## Output

Summarize the GitHub state, the proposed action, and any verification command that should run before publishing.
