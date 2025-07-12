---
task_id: 'b2b-marketing-automation/10_create-lead-service-interface'
story_id: 'b2b-marketing-automation/03_abstract-lead-data-source'
title: 'Create a generic LeadService interface'
description: 'Define a standard `LeadService` interface in a new file, `src/services/leadService.types.ts`, that all data source implementations will adhere to. This interface will define a `getLeads` method.'
acceptance_criteria:
  - A new file `src/services/leadService.types.ts` is created.
  - The file contains a `LeadService` interface.
  - The interface defines a `getLeads` method that returns a `Promise<Lead[]>`
---
