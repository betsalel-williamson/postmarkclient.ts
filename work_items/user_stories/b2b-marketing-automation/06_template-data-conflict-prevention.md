---
title: 'Prevent Accidental Template Data Overwrites'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
story_id: '06_template-data-conflict-prevention'
labels: 'backend, cli, data-integrity'
status: 'todo'
date_created: '2025-07-13T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Operator,
- **I want to** be explicitly informed when my provided template data conflicts with automatically generated email personalization fields,
- **so that** I can avoid accidental overwrites and ensure my email campaigns are personalized as intended.

## Acceptance Criteria

- The system must detect conflicts between user-provided `templateData` keys and automatically generated keys (`first_name`, `campaign`, `action_url`).
- The system must throw a clear error message when such conflicts are detected.
- The error message must list the specific keys that are causing the conflict.

## Metrics for Success

- **Primary Metric**: 0 instances of unintended template data overwrites in production emails.
- **Secondary Metrics**: Reduced debugging time for personalization issues; increased confidence in campaign data accuracy.
