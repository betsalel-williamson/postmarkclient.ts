---
title: 'Extract Console Output to View Layer'
project_name: 'postmark'
epic_name: 'architecture-refactoring'
task_id: '01_extract-console-output'
labels: 'backend, refactoring, view'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Create `src/view/consoleOutput.ts` and move all direct `console.log`, `console.warn`, and `console.error` statements from `src/cli.ts` and `src/emailSender.ts` into new, appropriately named functions within this file. Modify the original files to call these new view functions.

## Acceptance Criteria

- [ ] A new file `src/view/consoleOutput.ts` is created.
- [ ] Functions like `logInfo`, `logWarning`, `logError`, `logValidationSummary` are defined in `src/view/consoleOutput.ts`.
- [ ] All direct `console.log`, `console.warn`, `console.error` calls in `src/cli.ts` are replaced with calls to the new view functions.
- [ ] All direct `console.log`, `console.warn`, `console.error` calls in `src/emailSender.ts` are replaced with calls to the new view functions.
- [ ] All existing tests pass (`npm test`).
- [ ] Code coverage remains at or above current levels.

## Context/Links

- Related user story: [../../user_stories/architecture-refactoring/00_refactor-cli-to-mvc.md](../../user_stories/architecture-refactoring/00_refactor-cli-to-mvc.md)
