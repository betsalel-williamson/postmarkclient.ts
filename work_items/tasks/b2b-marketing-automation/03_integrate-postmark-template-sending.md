---
title: 'Integrate Postmark Email Sending'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '03'
labels: 'backend, email, postmark'
status: 'done'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: '2025-07-13T00:00:00-07:00'
touched: '*'
---

## Task

Integrate the Postmark email sending functionality into the main application flow.

## Acceptance Criteria

- [x] The CLI uses the Postmark `sendEmail` method.
- [x] The `HtmlBody` is correctly personalized with a lead's data.
- [x] The `action_url` in the `HtmlBody` is the personalized URL from the URL generation logic.

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md](./../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md)
