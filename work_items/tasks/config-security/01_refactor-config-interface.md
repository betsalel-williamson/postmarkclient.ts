---
title: 'Refactor Config Interface and getConfig Function'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '01_refactor-config-interface'
labels: 'backend, configuration'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify `src/services/configService.ts` to remove `headerMapping` and `templateData` from the `Config` interface. Ensure the `getConfig` function only returns environment-derived configuration.

## Acceptance Criteria

- [ ] `headerMapping` and `templateData` are removed from the `Config` interface in `src/services/configService.ts`.
- [ ] The `getConfig` function in `src/services/configService.ts` no longer attempts to retrieve or return `headerMapping` or `templateData`.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
