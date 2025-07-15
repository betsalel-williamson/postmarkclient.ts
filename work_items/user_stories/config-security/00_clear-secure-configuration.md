---
title: 'Clear and Secure Configuration Management'
project_name: 'postmark'
epic_name: 'config-security'
story_id: '00_config-security/00_clear-secure-configuration'
labels: 'security, configuration, pii'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

- **As a** Marketing Operator or Developer,
- **I want to** have the application's configuration clearly separate sensitive credentials from campaign-specific settings, and to have clear guidance on PII logging,
- **so that** I can manage configurations securely, avoid accidental exposure of sensitive data, and understand the implications of PII logging.

## Acceptance Criteria

- Sensitive credentials (API tokens, key paths) are exclusively stored in `.env` files.
- Non-sensitive, campaign-specific settings (template data, header mappings) are stored in the CLI/config file.
- The application functions correctly with this separation.
- Documentation clearly explains the configuration separation and PII logging practices.

## Metrics for Success

- **Primary Metric**: 0 instances of sensitive data accidentally committed to version control.
- **Secondary Metrics**: Reduced confusion for users regarding where to store different types of configuration.
