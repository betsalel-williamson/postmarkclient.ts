---
title: 'Update sendEmails Function Signature'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '02_update-send-emails-signature'
labels: 'backend, refactoring'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Update the `sendEmails` function in `src/emailSender.ts` to directly accept `headerMapping` and `templateData` as parameters, instead of them being nested within the `config` object. Adjust internal usage accordingly.

## Acceptance Criteria

- [ ] The `sendEmails` function signature in `src/emailSender.ts` is updated to include `headerMapping` and `templateData` as direct parameters.
- [ ] All internal references to `options.config.headerMapping` and `options.config.templateData` are updated to use the new direct parameters.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
