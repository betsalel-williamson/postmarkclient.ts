---
title: 'Implement Send-Once-Only Logic'
project_name: 'postmark-cli'
epic_name: 'dagster_migration'
task_id: '02'
labels: 'backend, dbt, dagster, data-integrity'
status: 'todo'
date_created: '2025-07-09T10:10:00+0000'
date_verified_completed: ''
touched: '*'
---

## Task

Implement a mechanism to ensure that a one-time marketing email is sent to each lead only once. This is a critical business requirement to maintain a professional relationship with potential customers.

## Acceptance Criteria

- [ ] A persistent storage layer (e.g., a new dbt model or a separate table) is created to track sent emails. This table should at a minimum store the lead's email address and a timestamp of when the email was sent.
- [ ] The dbt transformation logic is updated to flag leads that have already been contacted.
- [ ] The Dagster asset/op that sends emails is updated to filter out leads that have already been flagged as contacted.
- [ ] The system is tested to ensure that if the pipeline is run multiple times, it does not send duplicate emails to the same lead.

## Context/Links

- Related user story: [../user_stories/dagster_migration/00_migrate-to-dagster.md](./../user_stories/dagster_migration/00_migrate-to-dagster.md)
