---
title: 'Enhance README.md with Security and PII Information'
project_name: 'postmark'
epic_name: 'config-security'
task_id: '07_enhance-readme'
labels: 'documentation, security, pii'
status: 'todo'
date_created: '2025-07-15T00:00:00-07:00'
date_verified_completed: ''
touched: '*'
---

## Task

Add a new section to `README.md` on "Security & PII" explaining the `.env` vs. config file distinction and the `ENABLE_PII_LOGGING` variable.

## Acceptance Criteria

- [ ] A new section titled "Security & PII" is added to `README.md`.
- [ ] The new section clearly explains the purpose of `.env` files for sensitive data and config files for non-sensitive data.
- [ ] The implications of `ENABLE_PII_LOGGING` and the `pii.log` file are explained, including when and how to use it responsibly.
- [ ] Guidance on avoiding accidental commitment of sensitive data is provided.

## Context/Links

- Related user story: ../../user_stories/config-security/00_clear-secure-configuration.md
