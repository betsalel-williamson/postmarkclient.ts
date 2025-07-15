---
title: 'Integrate Schema Validation into Lead Services'
project_name: 'postmark'
epic_name: 'data-flexibility'
task_id: '03_integrate-schema-validation'
labels: 'backend, schema, validation'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify `DuckDbLeadService` and `GoogleSheetsLeadService` to validate incoming lead data against the loaded external schema.

## Acceptance Criteria

- [ ] Lead services load the external schema during initialization.
- [ ] Raw lead data fetched from the source is validated against the schema before transformation.
- [ ] Validation errors are caught and reported appropriately (e.g., logging, skipping invalid leads).

## Context/Links

- Related user story: ../../user_stories/data-flexibility/00_externalize-lead-schema.md
