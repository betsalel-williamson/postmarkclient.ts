---
title: 'Config File Validation and Example Generation'
project_name: 'postmark'
epic_name: 'configuration-management'
story_id: '00_configuration-management/00_config-validation-generation'
labels: 'cli, configuration, usability'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Operator or Developer,
- **I want to** validate my `config.json` file against a defined schema or generate a new `config.json.example` from a template,
- **so that** I can ensure my campaign configurations are correct and easily create new, valid configuration files.

## Acceptance Criteria

- The CLI provides a command to validate an existing `config.json` file against a predefined schema.
- The validation command provides clear, actionable feedback on any errors or discrepancies.
- The CLI provides a command to generate a new `config.json.example` file based on a canonical template.
- The generated `config.json.example` file includes all required fields with placeholder values and comments.

## Metrics for Success

- **Primary Metric**: 50% reduction in configuration-related errors reported by users.
- **Secondary Metrics**: Increased user confidence in creating and modifying `config.json` files; reduced time spent debugging configuration issues.
