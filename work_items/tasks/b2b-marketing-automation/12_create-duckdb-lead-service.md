---
task_id: 'b2b-marketing-automation/12_create-duckdb-lead-service'
story_id: 'b2b-marketing-automation/03_abstract-lead-data-source'
title: 'Create a duckdbLeadService.ts'
description: 'Move the current DuckDB implementation from `leadService.ts` into its own file, `src/services/duckdbLeadService.ts`. This service will implement the `LeadService` interface.'
acceptance_criteria:
  - A new file `src/services/duckdbLeadService.ts` is created.
  - The file contains a `DuckDbLeadService` class that implements the `LeadService` interface.
  - The `getLeads` method from the old `leadService.ts` is moved to this new class.
---
