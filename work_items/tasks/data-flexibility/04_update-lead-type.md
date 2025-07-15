---
title: 'Update Lead Type Usage'
project_name: 'postmark'
epic_name: 'data-flexibility'
task_id: '04_update-lead-type'
labels: 'backend, schema, typing'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Replace direct usage of the `Lead` interface in `src/services/leadService.types.ts` and other relevant files with a dynamic type derived from the loaded external schema.

## Acceptance Criteria

- [ ] The `Lead` interface is removed or made generic to accept a schema-derived type.
- [ ] Lead data objects are dynamically typed based on the loaded schema.
- [ ] All references to `Lead` are updated to use the new dynamic typing approach.

## Context/Links

- Related user story: ../../user_stories/data-flexibility/00_externalize-lead-schema.md
