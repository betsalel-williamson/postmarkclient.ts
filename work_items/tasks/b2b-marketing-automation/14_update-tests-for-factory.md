---
task_id: "b2b-marketing-automation/14_update-tests-for-factory"
story_id: "b2b-marketing-automation/03_abstract-lead-data-source"
title: "Update tests for the factory and DuckDB service"
description: "Create separate test files for `duckdbLeadService.ts` and `googleSheetsLeadService.ts`. Update the existing tests to reflect the new factory pattern."
acceptance_criteria:
  - A new test file `src/services/duckdbLeadService.test.ts` is created.
  - The existing tests from `src/services/leadService.test.ts` are moved to the new file.
  - `src/services/leadService.test.ts` is updated to test the factory.
---
