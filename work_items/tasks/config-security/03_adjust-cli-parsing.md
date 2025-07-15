---
title: 'Adjust CLI Argument Parsing and sendEmails Calls'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '03_adjust-cli-parsing'
labels: 'cli, refactoring'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Modify `src/cli.ts` to ensure `templateData` and `headerMapping` are always parsed from CLI arguments or the config file and passed directly to `sendEmails`.

## Acceptance Criteria

- [ ] In `src/cli.ts`, the `send` command passes `templateData` and `headerMapping` as direct arguments to `sendEmails`.
- [ ] In `src/cli.ts`, the `send-from-config` command parses `templateData` and `headerMapping` from the loaded config file and passes them as direct arguments to `sendEmails`.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
