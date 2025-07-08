---
title: 'Marketing Campaign Execution'
project_name: 'postmark-cli'
epic_name: 'b2b-marketing-automation'
story_id: '00'
labels: 'cli, backend, email'
status: 'todo'
date_created: '2025-07-08T15:12:33+0000'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Operator,
- **I want to** run a command-line application that sends personalized email blasts to a list of B2B leads,
- **so that** I can efficiently generate new business opportunities.

## Acceptance Criteria

- The system must send an email to every lead provided in an input file.
- The system must use a Postmark template for the email body.
- The system must populate the Postmark template with the lead's personalized data, including a pre-filled form URL.
- The system must correctly apply UTM parameters to the generated URL for tracking.

## Metrics for Success

- **Primary Metric**: Achieve a 100% send rate for all valid leads in a given batch.
- **Secondary Metrics**:
  - Track the click-through rate on the personalized `action_url`.
  - Monitor the form submission rate from the pre-filled links.
