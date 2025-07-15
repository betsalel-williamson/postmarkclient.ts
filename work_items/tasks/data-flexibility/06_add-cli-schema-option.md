---
title: 'Add CLI Option for Schema File Path'
project_name: 'postmark'
epic_name: 'data-flexibility'
task_id: '06_add-cli-schema-option'
labels: 'cli, configuration'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Add a new CLI option to specify the path to the external lead schema file, allowing users to define their lead data structure.

## Acceptance Criteria

- [ ] A new CLI option (e.g., `--lead-schema-path`) is added to the `send` and `send-from-config` commands.
- [ ] The application can read the schema file path from this option.

## Context/Links

- Related user story: ../../user_stories/data-flexibility/00_externalize-lead-schema.md
