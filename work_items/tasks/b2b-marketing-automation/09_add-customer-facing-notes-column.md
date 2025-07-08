---
title: 'Add Customer-Facing Notes Column to Database'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '09'
labels: 'backend, database, migration'
status: 'todo'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

## Task

Create and execute a data migration script to add a new column for customer-facing notes to the `stg_cards_data` table in the `business_cards.duckdb` database.

## Acceptance Criteria

- [ ] A migration script (`scripts/addCustomerFacingNotesColumn.ts`) is created.
- [ ] The script successfully adds a `customer_facing_notes` column (VARCHAR) to the `stg_cards_data` table.
- [ ] The script is executable via `npm run migrate:add-customer-notes` (or similar).
- [ ] The `Lead` interface in `src/services/leadService.ts` is updated to include `customer_facing_notes`.

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/01_lead-data-management.md](./../user_stories/b2b-marketing-automation/01_lead-data-management.md)
- Discussion on customer-facing notes: [Link to relevant discussion/document if available]
