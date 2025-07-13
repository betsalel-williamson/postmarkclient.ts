---
title: 'Update url.test.ts for buildUrl'
project_name: postmark
epic_name: b2b-marketing-automation
task_id: 08_update-url-test-ts-for-build-url
labels: testing, url-generation
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

## Task

Modify `src/utils/url.test.ts` to update existing tests and add new tests that cover the configurable behavior of the `buildUrl` function.

## Acceptance Criteria

- [ ] Existing tests in `src/utils/url.test.ts` are updated to use the new `buildUrl` function signature and `urlConfig`.
- [ ] New test cases are added to verify URL generation with different `staticParams` configurations.
- [ ] New test cases are added to verify URL generation with different `dbParamMapping` configurations, including cases where lead fields are missing.
- [ ] All tests pass successfully after the changes.

## Context/Links

- Related user story: ../../user_stories/b2b-marketing-automation/05_flexible-campaign-url-customization.md
- Additional context: This task ensures the correctness and robustness of the new configurable URL generation logic.
