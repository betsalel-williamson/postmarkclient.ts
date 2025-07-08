---
title: 'Integrate Postmark Template Sending'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
task_id: '03'
labels: 'backend, email, postmark'
status: 'todo'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

## Task

Integrate the Postmark `sendEmailWithTemplate` method into the main application flow.

## Acceptance Criteria

- [ ] The CLI uses `sendEmailWithTemplate` instead of `sendEmail`.
- [ ] The `TemplateModel` is correctly populated with a lead's data.
- [ ] The `action_url` in the `TemplateModel` is the personalized URL from the URL generation logic.

## Context/Links

- Related user story: [../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md](./../user_stories/b2b-marketing-automation/00_marketing-campaign-execution.md)
