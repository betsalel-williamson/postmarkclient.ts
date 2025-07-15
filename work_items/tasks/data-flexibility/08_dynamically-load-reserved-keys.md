---
title: 'Dynamically Load Reserved Template Keys from Schema'
project_name: 'postmark'
epic_name: 'data-flexibility'
task_id: '08_dynamically-load-reserved-keys'
labels: 'backend, schema, data-handling'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify the `getReservedTemplateKeys` method in `src/services/leadService.types.ts` and its implementations to dynamically extract reserved keys from the loaded lead schema.

## Acceptance Criteria

- [ ] The `getReservedTemplateKeys` method in `LeadService` (and its concrete implementations) no longer hardcodes the list of reserved keys.
- [ ] The method extracts property names from the `leadSchema` (specifically from `components.schemas.Lead.properties` in the OpenAPI schema) to form the set of reserved keys.
- [ ] All existing tests that rely on `getReservedTemplateKeys` continue to pass.

## Context/Links

- Related user story: ../../user_stories/data-flexibility/00_externalize-lead-schema.md
