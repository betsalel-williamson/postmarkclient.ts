# Postmark CLI Helper: Architectural Documentation

This document provides a high-level overview of the architecture, key components, and design decisions behind the Postmark CLI Helper. It is intended for developers and contributors to understand how the utility is structured and operates.

## 1. High-Level Overview

The Postmark CLI Helper is a command-line interface (CLI) application designed to automate the process of sending personalized email blasts via Postmark. It supports fetching lead data from various table based sources (currently Google Sheets and DuckDB), validating this data against a configurable schema, personalizing email templates, and generating unique, pre-filled form URLs for each lead.

## 2. System Context

This utility operates as a standalone application, typically executed in a batch or scheduled manner. It integrates with external services for data retrieval (Google Sheets API, DuckDB) and email delivery (Postmark API). Its primary users are marketing operators who configure and run campaigns, and developers who extend or maintain the application.

## 3. Architectural Style & Patterns

The application largely follows a Model-View-Controller (MVC) pattern, adapted for a CLI environment, promoting separation of concerns:

- **Controller (CLI Layer)**: Handles command-line argument parsing, command dispatch, and orchestration of business logic.
- **Model (Business Logic & Data Access Layer)**: Encapsulates core application logic, data validation, data transformation, and interactions with external data sources and APIs.
- **View (Output Layer)**: Manages all console output, ensuring consistent logging and user feedback.

A **Factory Pattern** is used for lead data services, allowing for easy extension with new data sources without modifying core email sending logic.

## 4. Major Components & Interactions

### 4.1. CLI Layer (`src/cli`)

- **`main.ts`**: The entry point for the CLI. It uses `yargs` to define commands (`send`, `send-from-config`) and their options. It parses arguments, loads configuration, and dispatches calls to the `emailSender` in the Model layer.
- **`main.test.ts`**: Contains unit tests for the CLI's command parsing and dispatching logic.

### 4.2. Model Layer (`src/model`)

This layer contains the core business logic and data management.

- **`emailSender.ts`**:
  - Orchestrates the email sending process for each lead.
  - Fetches leads using the `LeadService` factory.
  - Performs conflict detection for template data to prevent overwrites of auto-generated fields.
  - Personalizes HTML templates, subjects, and generates plain text bodies.
  - Interacts with the Postmark API to send emails.
  - Manages PII logging for sensitive data.
- **`services/`**:
  - **`configService.ts`**: Loads application configuration (e.g., API tokens, database paths) from environment variables. Enforces mutual exclusivity for data source configurations.
  - **`baseLeadService.ts`**: An abstract class defining the common interface (`getLeads`, `getReservedTemplateKeys`) for all lead data sources. It includes shared lead validation logic using `ajv` and an external OpenAPI schema.
  - **`duckdbLeadService.ts`**: Concrete implementation of `LeadService` for fetching leads from a DuckDB database.
  - **`googleSheetsLeadService.ts`**: Concrete implementation of `LeadService` for fetching leads from Google Sheets via the Google Sheets API.
  - **`googleSheetsApi.ts`**: A wrapper around the `googleapis` library for authenticating and interacting with the Google Sheets API.
  - **`leadServiceFactory.ts`**: A factory function responsible for instantiating the correct `LeadService` implementation based on the configured data source (`duckdb` or `google-sheets`).
- **`types/`**: Defines TypeScript interfaces for data structures like `CampaignConfig` and `UrlConfig`.
- **`utils/`**:
  - **`piiLogger.ts`**: Utility for conditionally logging Personally Identifiable Information (PII) to a separate file, controlled by an environment variable.
  - **`schemaLoader.ts`**: Loads and parses OpenAPI YAML schema files, used for lead data validation.
  - **`templateProcessor.ts`**: Handles the dynamic replacement of placeholders in HTML templates and subject lines, including the generation of dynamic URLs. Converts HTML to plain text for email bodies.
  - **`url.ts`**: Contains logic for building dynamic URLs with base URLs, static search parameters, and parameters derived from lead data.

### 4.3. View Layer (`src/view`)

- **`consoleOutput.ts`**: Centralizes all console output functions (`logInfo`, `logWarn`, `logError`, `logValidationSummary`) to provide a consistent interface for logging and feedback to the user.

## 5. Data Flow

1. **Configuration Loading**: `getConfig()` reads environment variables for sensitive credentials and data source paths.
2. **Command Execution**: The CLI (`main.ts`) receives a command (e.g., `send`) and its arguments (or a config file path).
3. **Schema Loading**: The lead data schema (OpenAPI YAML) is loaded and compiled for validation.
4. **Lead Service Instantiation**: `createLeadService()` uses the configured `source` (e.g., `google-sheets`) to return an appropriate `LeadService` instance.
5. **Lead Data Retrieval & Validation**: The `LeadService` fetches raw lead data, maps it according to `headerMapping`, and validates each lead against the loaded schema. Invalid leads are reported and skipped.
6. **Template Processing**: For each valid lead, `templateProcessor` dynamically populates the HTML template and subject line. This includes generating personalized URLs based on `UrlConfig` and lead data.
7. **Email Sending**: `emailSender` checks if an email has already been sent to the recipient (unless `forceSend` is enabled). If not, it constructs the email payload and sends it via the Postmark API.
8. **Logging**: Throughout the process, `piiLogger` handles sensitive logging, and `consoleOutput` provides general status updates and validation summaries.

## 6. Key Design Decisions & Rationale

- **Externalized Lead Schema**: Using an OpenAPI YAML schema (`src/schemas/lead/lead.yaml`) allows for flexible and dynamic validation of lead data without code changes. This promotes data integrity and adaptability to evolving data requirements.
- **Separation of Configuration**: Sensitive credentials are strictly managed via `.env` files, while campaign-specific settings are passed via CLI arguments or non-sensitive JSON config files. This enhances security and prevents accidental exposure of secrets in version control.
- **Pluggable Lead Services**: The `LeadService` abstract class and factory pattern enable easy integration of new lead data sources (e.g., CRM, CSV files) by simply implementing the `LeadService` interface.
- **Test-Driven Development (TDD)**: The project adheres to TDD principles, ensuring that new features are driven by failing tests, leading to robust and maintainable code.
- **Immutability**: Functional patterns and immutable data structures are preferred where appropriate (e.g., in `templateProcessor`) to reduce side effects and improve predictability.
- **PII Logging Control**: Sensitive data logging is opt-in via an environment variable, providing a clear mechanism for debugging while maintaining privacy by default.

## 7. Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **CLI Framework**: `yargs`
- **Email API**: `postmark` SDK
- **Data Validation**: `ajv` (JSON Schema validator), `js-yaml`
- **Data Sources**: `@duckdb/node-api` (DuckDB), `googleapis` (Google Sheets API)
- **Testing**: `vitest`, `msw` (Mock Service Worker)
- **Code Quality**: `eslint`, `prettier`, `markdownlint-cli2`

## 8. Deployment & Execution

The application is built using TypeScript (`tsc`) and can be run directly via Node.js. Detailed instructions for installation, building, and running campaigns are provided in the project's `README.md` file. The `package.json` defines various scripts for building, testing, formatting, and linting.
