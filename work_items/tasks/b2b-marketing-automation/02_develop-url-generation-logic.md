---
title: 'Develop URL Generation Logic'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '02'
labels: 'backend, url, personalization'
status: 'todo'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

## Task

Create a function to build a pre-filled form URL from a lead's data.

## Acceptance Criteria

- [ ] A function `buildOptInUrl(baseUrl, leadData)` is created in `src/utils/url.ts`.
- [ ] The function correctly encodes all lead data as query parameters.
- [ ] The function includes the required UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`).

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md](./../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md)
