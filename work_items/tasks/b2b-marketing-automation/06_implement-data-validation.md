---
title: "Implement Data Validation"
project_name: "postmark-cli"
epic_name: "b2b-marketing-automation"
task_id: "06"
labels: "backend, database, validation"
status: "todo"
date_created: "2025-07-08T15:12:33+0000"
date_verified_completed: ""
touched: "*"
---

## Task

Implement data validation and transformation logic for the data read from the database.

## Acceptance Criteria

- [ ] A validation function is created in `src/utils/validation.ts`.
- [ ] The function checks for character limits on `company`, and `title`.
- [ ] The function transforms the `products` column into the `product_interest` enum.
- [ ] The `getLeads` function calls this validation and transformation function for each lead.

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/01_lead-data-management.md](./../user_stories/b2b-marketing-automation/01_lead-data-management.md)
