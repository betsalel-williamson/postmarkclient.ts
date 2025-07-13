---
title: 'Create config.json.example'
project_name: postmark
epic_name: b2b-marketing-automation
task_id: 05_create-config-json-example
labels: configuration
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

## Task

Create a new file `config.json.example` at the project root to serve as a template for URL configuration.

## Acceptance Criteria

- [ ] A file named `config.json.example` exists at the project root.
- [ ] The `config.json.example` file contains a `urlConfig` object with `baseUrl`, `staticParams`, and `dbParamMapping` properties.
- [ ] The `staticParams` object includes example UTM parameters.
- [ ] The `dbParamMapping` array includes example mappings for lead/database fields to URL parameters.

## Context/Links

- Related user story: ../../user_stories/b2b-marketing-automation/05_flexible-campaign-url-customization.md
- Additional context: This file will provide a clear structure for configuring URL generation without hardcoding values.
