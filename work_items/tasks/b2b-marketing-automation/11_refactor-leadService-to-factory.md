---
task_id: "b2b-marketing-automation/11_refactor-leadService-to-factory"
story_id: "b2b-marketing-automation/03_abstract-lead-data-source"
title: "Refactor leadService.ts into a factory"
description: "The `leadService.ts` file will be transformed into a factory that creates and returns a specific `LeadService` implementation based on a provided source type (e.g., `'duckdb'` or `'google-sheets'`)."
acceptance_criteria:
  - `src/services/leadService.ts` is refactored to be a factory.
  - The factory has a function that accepts a source type string.
  - The factory returns a `LeadService` implementation.
---
