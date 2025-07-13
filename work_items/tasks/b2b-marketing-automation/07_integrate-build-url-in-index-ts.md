---
title: 'Integrate buildUrl in src/index.ts'
project_name: postmark
epic_name: b2b-marketing-automation
task_id: 07_integrate-build-url-in-index-ts
labels: integration, url-generation
status: done
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 2025-07-13T00:00:00-07:00
touched: *
---

## Task

Update `src/index.ts` to load the URL configuration from `config.json` and use the new `buildUrl` function.

## Acceptance Criteria

- [x] `src/index.ts` includes logic to load configuration from `config.json` (or `config.json.example` for development).
- [x] The `urlConfig` section is correctly extracted from the loaded configuration.
- [x] The `buildUrl` function is called with the extracted `urlConfig` and the `Lead` object.
- [x] The `buildOptInUrl` import and usage are removed from `src/index.ts`.

## Context/Links

- Related user story: ../../user_stories/b2b-marketing-automation/05_flexible-campaign-url-customization.md
- Additional context: This task connects the configurable URL generation to the main application flow.
