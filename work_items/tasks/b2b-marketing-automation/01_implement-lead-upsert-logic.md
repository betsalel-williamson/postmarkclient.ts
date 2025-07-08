---
title: 'Implement Lead Data Upsert Logic'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '01'
labels: 'backend, database'
status: 'todo'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

## Task

Create a data access function to read lead data from the `stg_cards_data` table in the `business_cards.duckdb` database.

## Acceptance Criteria

- [ ] A function `getLeads()` is created in `src/services/leadService.ts`.
- [ ] The function connects to `business_cards.duckdb`.
- [ ] The function queries the `stg_cards_data` table and returns all rows.
- [ ] The function maps the database columns to the required campaign fields.

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/01_lead-data-management.md](./../user_stories/b2b-marketing-automation/01_lead-data-management.md)
