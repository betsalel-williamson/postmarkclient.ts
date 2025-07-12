---
task_id: "b2b-marketing-automation/13_update-main-app-for-factory"
story_id: "b2b-marketing-automation/03_abstract-lead-data-source"
title: "Update the main application logic to use the factory"
description: "Modify `src/index.ts` to use the new `leadService` factory. Add a `--source` option to the CLI to allow specifying the data source (e.g., `duckdb` or `google-sheets`)."
acceptance_criteria:
  - `src/index.ts` is updated to import and use the `leadService` factory.
  - A `--source` option is added to the yargs command in `src/index.ts`.
  - The `--dbPath` option is preserved for the `duckdb` source.
---
