---
title: 'Implement Template Data Conflict Detection'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '19_implement-template-data-conflict-detection'
labels: 'backend, cli, data-integrity'
status: 'todo'
date_created: '2025-07-13T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Implement logic to detect and prevent accidental overwrites of automatically generated template data fields by user-provided `templateData`.

## Acceptance Criteria

- [ ] The `run` function in `src/index.ts` identifies conflicts between keys in `argv.templateData` and the automatically generated keys (`first_name`, `campaign`, `action_url`).
- [ ] If conflicts are found, an `Error` is thrown with a message clearly listing the conflicting keys.
- [ ] A new test case is added to `src/index.test.ts` that verifies this error-throwing behavior when conflicts occur.
- [ ] Existing tests continue to pass after this change.

## Context/Links

- Related user story: ../../user_stories/b2b-marketing-automation/06_template-data-conflict-prevention.md
