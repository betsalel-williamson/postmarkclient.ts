---
title: 'Update LeadService and Implementations'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '04_update-lead-service'
labels: 'backend, refactoring'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Update `src/services/leadService.types.ts`, `src/services/duckdbLeadService.ts`, and `src/services/googleSheetsLeadService.ts` to reflect that `headerMapping` is no longer part of the `Config` object passed to their constructors.

## Acceptance Criteria

- [ ] `headerMapping` is removed from the `Config` interface within `src/services/leadService.types.ts`.
- [ ] The `LeadService` abstract class constructor is updated to accept `headerMapping` as a direct parameter.
- [ ] `DuckDbLeadService` and `GoogleSheetsLeadService` constructors are updated to accept `headerMapping` directly and pass it to the `super()` call.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
