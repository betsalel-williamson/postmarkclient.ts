---
title: 'Refactor buildOptInUrl to buildUrl'
project_name: postmark
epic_name: b2b-marketing-automation
task_id: 06_refactor-build-opt-in-url-to-build-url
labels: refactoring, url-generation
status: done
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 2025-07-13T00:00:00-07:00
touched: *
---

## Task

Rename and modify the `buildOptInUrl` function in `src/utils/url.ts` to `buildUrl` to make it more general and configurable based on a `urlConfig` object.

## Acceptance Criteria

- [x] The `buildOptInUrl` function in `src/utils/url.ts` is renamed to `buildUrl`.
- [x] The `buildUrl` function accepts a `urlConfig` object (containing `baseUrl`, `staticParams`, and `dbParamMapping`) and a `Lead` object as parameters.
- [x] The `buildUrl` function correctly constructs the URL by applying `staticParams` from `urlConfig`.
- [x] The `buildUrl` function correctly constructs the URL by mapping `dbParamMapping` from `urlConfig` to `Lead` object properties.
- [x] All hardcoded URL parameters within the function are replaced by values from `urlConfig`.

## Context/Links

- Related user story: ../../user_stories/b2b-marketing-automation/05_flexible-campaign-url-customization.md
- Additional context: This task generalizes the URL building logic to support dynamic configuration.
