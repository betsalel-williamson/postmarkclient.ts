---
title: 'Migrate Postmark CLI to Dagster-dbt Pipeline'
project_name: 'postmark-cli'
epic_name: 'dagster_migration'
story_id: '00'
labels: 'backend, dagster, dbt, migration'
status: 'todo'
date_created: '2025-07-09T10:00:00+0000'
date_verified_completed: ''
touched: '*'
---

- **As a** Data Engineer,
- **I want to** migrate the existing Postmark CLI functionality to a Dagster-dbt pipeline,
- **so that** the process is more robust, scalable, and maintainable.

## Acceptance Criteria

- All data transformation logic is moved to dbt models.
- The email sending process is orchestrated by a Dagster pipeline.
- All existing functionality and unit tests are replicated in the new architecture.
- The new pipeline is documented.

## Metrics for Success

- **Primary Metric**: The new pipeline can process 1000 leads and send emails successfully.
- **Secondary Metrics**:
  - The pipeline is easily testable.
  - The pipeline can be run on a schedule.
