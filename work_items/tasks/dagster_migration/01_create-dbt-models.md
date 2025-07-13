---
title: 'Create dbt Models for Lead Data Transformation'
project_name: 'postmark-cli'
epic_name: 'dagster_migration'
task_id: '01'
labels: 'backend, dbt, data-transformation'
status: 'blocked'
date_created: '2025-07-09T10:05:00+0000'
date_verified_completed: ''
touched: '**'
---

## Task

Create dbt models to replicate the data transformation and validation logic currently found in `src/utils/validation.ts`.

## Acceptance Criteria

- [ ] A dbt model is created to represent the raw `stg_cards_data`.
- [ ] A subsequent dbt model is created that replicates all validation and transformation logic.
- [ ] The dbt models are tested to ensure they produce the same output as the existing TypeScript logic.

### Captured Test Behaviors

The dbt tests must cover the following behaviors, which are extracted from the existing unit tests:

#### from `validation.test.ts`

- **Character Limiting:**
  - `company` field is truncated to 128 characters.
  - `title` field is truncated to 128 characters.
  - `notes` field is truncated to 5000 characters.
- **Product Interest Derivation:**
  - `product_interest` is correctly identified as `'cat'`, `'dog'`, or `'cat+dog'` based on keywords in `products`, `title`, `email`, `company`, and `notes` fields.
  - Handles various combinations and cases (e.g., "feline and canine", "DOG and CAT").
  - Correctly assigns `null` when no relevant keywords are found.
  - Accurately combines interests (e.g., if `products` is 'cat' and `notes` contains 'dog', the result is 'cat+dog').

#### from `url.test.ts`

- **URL Generation:**
  - A dbt model should prepare the data for the URL generation step.
  - All required fields for the URL are present and correctly formatted (`first_name`, `last_name`, `email`, `phone_number`, `company`, `title`, `product_interest`, `notes`).

#### from `leadService.test.ts`

- **Data Source:**
  - The dbt models must source data from the `stg_cards_data` table.
  - The tests should validate behavior when the source table exists but is empty, and when it contains data.
- **Error Handling:**
  - The dbt run should handle cases where the source table might not exist, although this is less of a concern in a dbt-managed environment.

#### from `index.test.ts`

- **End-to-End Data Flow:**
  - The final transformed data from the dbt model must contain all the necessary fields for the Postmark `TemplateModel`.
  - The `action_url` components must be correctly populated.

## Context/Links

- Related user story: [../user_stories/dagster_migration/00_migrate-to-dagster.md](./../user_stories/dagster_migration/00_migrate-to-dagster.md)
