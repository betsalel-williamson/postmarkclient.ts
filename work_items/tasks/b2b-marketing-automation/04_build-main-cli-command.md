---
title: 'Build Main CLI Command'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '04'
labels: 'cli, backend'
status: 'done'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: '2025-07-13T00:00:00-07:00'
touched: '*'
---

## Task

Build the main command-line interface for the application.

## Acceptance Criteria

- [x] The CLI connects to the `business_cards.duckdb` database.
- [x] The CLI retrieves all leads using the `getLeads()` function.
- [x] For each lead, the CLI orchestrates the URL generation and email sending process.
- [x] The CLI provides progress feedback to the user (e.g., "Sent email to lead X of Y").

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md](./../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md)
