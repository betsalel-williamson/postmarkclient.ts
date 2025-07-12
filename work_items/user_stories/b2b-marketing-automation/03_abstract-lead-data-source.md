---
story_id: 'b2b-marketing-automation/03_abstract-lead-data-source'
title: 'Abstract lead data source to support multiple implementations'
description: 'As a developer, I want to refactor the data access layer to use a factory pattern, so that I can easily switch between different data sources like DuckDB and Google Sheets.'
acceptance_criteria:
  - A `LeadService` interface is defined.
  - A factory function is implemented to create `LeadService` instances.
  - The existing DuckDB implementation is refactored into a `duckdbLeadService`.
  - The main application logic is updated to use the factory.
  - The CLI accepts a `--source` option to specify the data source.
  - Tests are updated to reflect the new architecture.
  - Documentation is updated to explain the new `--source` option.
---
