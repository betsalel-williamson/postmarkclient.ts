---
title: 'Externalize Lead Data Schema'
project_name: 'postmark'
epic_name: 'data-flexibility'
story_id: '00_data-flexibility/00_externalize-lead-schema'
labels: 'backend, schema, configuration, data-modeling'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Developer or Marketing Operator,
- **I want to** define the lead data schema externally (e.g., via JSON Schema or Pkl),
- **so that** the application can adapt to different lead data structures without requiring code changes and can provide dynamic validation.

## Acceptance Criteria

- The application can load a lead data schema from an external file (e.g., JSON Schema).
- Lead data read from sources (DuckDB, Google Sheets) is validated against this external schema at runtime.
- The application can dynamically map incoming data to the expected lead properties based on the schema.
- The `Lead` interface in `src/services/leadService.types.ts` is replaced or dynamically generated from the external schema.
- The `templateProcessor` and `validation` utilities are updated to work with the dynamic schema.
- The CLI includes an option to specify the path to the external lead schema file.

## Metrics for Success

- **Primary Metric**: 0 instances of application crashes or incorrect email personalization due to unexpected lead data structures.
- **Secondary Metrics**: Reduced development time for supporting new lead data sources or formats; increased flexibility in campaign setup.
