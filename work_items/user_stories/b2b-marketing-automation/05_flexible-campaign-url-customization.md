---
title: 'Flexible Campaign URL Customization'
project_name: postmark
epic_name: b2b-marketing-automation
story_id: 05_b2b-marketing-automation_flexible-campaign-url-customization
labels: 
status: done
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 2025-07-13T00:00:00-07:00
touched: *
---

- **As a** Marketing Manager,
- **I want to** configure URL generation via `config.json` to generate campaign-specific URLs with customizable parameters,
- **so that** I can easily integrate it with various landing pages and analytics tools for different campaigns without needing technical assistance or code modifications.

## Acceptance Criteria

- The program must generate URLs where the base URL is configurable.
- The program must allow for static query parameters (e.g., UTM parameters) to be defined in `config.json`.
- The program must allow for dynamic query parameters, mapped from lead/database fields, to be defined in `config.json`.
- The URL generation logic must be generalized to use the configuration, replacing hardcoded values.

## Metrics for Success

- **Primary Metric**: Reduced time for Marketing Managers to set up new campaigns requiring custom URLs.
- **Secondary Metrics**: Increased flexibility in integrating with various marketing platforms; decreased reliance on developer intervention for URL customization.
