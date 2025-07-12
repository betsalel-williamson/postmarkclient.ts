---
task_id: 'b2b-marketing-automation/17_add-tests-for-google-sheets-service'
story_id: 'b2b-marketing-automation/04_implement-google-sheets-data-source'
title: 'Add tests for the googleSheetsLeadService.ts'
description: 'Add tests for the `googleSheetsLeadService.ts` to ensure it correctly fetches and parses data from Google Sheets. Mocks should be used for the Google Sheets API.'
acceptance_criteria:
  - A new test file `src/services/googleSheetsLeadService.test.ts` is created.
  - The tests mock the Google Sheets API.
  - The tests verify that the `getLeads` method returns the expected lead data.
---
