---
title: 'B2B Lead Data Management'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
story_id: '01'
labels: 'backend, database'
status: 'in-progress'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Operator,
- **I want** the application to manage a database of B2B leads,
- **so that** I can track customer information, avoid duplicates, and maintain a history of interactions.

## Acceptance Criteria

- The system must provide a mechanism to "upsert" lead data, updating existing leads based on email and creating new ones if they don't exist.
- The system must store all lead data points as specified in the requirements.
- The system must log every upsert operation to a submission history table.
- The system must validate incoming data against defined constraints (character limits, enums).
- The system must accurately extract product interest from various lead fields (e.g., title, email, company, products, notes).
- The system should have a mechanism to handle and transform notes for potential customer-facing use, ensuring appropriate language and formatting. (Further definition required)

## Metrics for Success

- **Primary Metric**: 0 duplicate lead records created.
- **Secondary Metrics**:
  - Measure the time taken to process a batch of 1000 lead upserts.
  - Ensure 100% of data validation rules are enforced.
