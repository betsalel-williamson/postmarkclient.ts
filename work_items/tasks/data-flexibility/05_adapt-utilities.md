---
title: 'Adapt templateProcessor and validation Utilities'
project_name: 'postmark'
epic_name: 'data-flexibility'
task_id: '05_adapt-utilities'
labels: 'backend, schema, utilities'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Update `src/utils/templateProcessor.ts` and `src/utils/validation.ts` to work with the dynamic schema, ensuring they can handle varying lead data structures.

## Acceptance Criteria

- [ ] `templateProcessor.ts` can correctly personalize emails using lead data conforming to the external schema.
- [ ] `validation.ts` (or its replacement) performs transformations based on the external schema's definitions.

## Context/Links

- Related user story: ../../user_stories/data-flexibility/00_externalize-lead-schema.md
