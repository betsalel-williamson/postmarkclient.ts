---
title: 'Update Test Files'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '05_update-test-files'
labels: 'testing, refactoring'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Adjust `src/cli.test.ts`, `src/emailSender.test.ts`, `src/services/configService.test.ts`, `src/services/duckdbLeadService.test.ts`, and `src/services/googleSheetsLeadService.test.ts` to align with the updated function signatures and configuration structure.

## Acceptance Criteria

- [ ] `src/cli.test.ts` is updated to reflect the new `sendEmails` function signature.
- [ ] `src/emailSender.test.ts` is updated to reflect the new `sendEmails` function signature.
- [ ] `src/services/configService.test.ts` is updated to remove tests related to `headerMapping` and `templateData` in the `Config` object.
- [ ] `src/services/duckdbLeadService.test.ts` and `src/services/googleSheetsLeadService.test.ts` are updated to pass `headerMapping` directly to the `LeadService` constructor.
- [ ] All tests pass after the changes.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
