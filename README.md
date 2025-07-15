# Postmark CLI Helper

This project provides a command-line interface (CLI) application to automate sending personalized email blasts using Postmark, leveraging lead data primarily from Google Sheets, but also supporting other sources. It is designed for flexible and configurable email campaigns.

## Features

- Reads lead data from various sources, including Google Sheets and DuckDB.
- Validates and transforms lead information (e.g., character limits, product interest mapping).
- Generates unique, pre-filled form URLs for each lead, including UTM tracking parameters.
- Sends personalized emails via Postmark using a specified template.
- Securely handles the Postmark Server Token via environment variables.
- Developed following Test-Driven Development (TDD) principles.

## Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd postmark
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure your Postmark Server Token:**
   Create a `.env` file in the root of the project and add your Postmark Server Token:

   ```dotenv
   POSTMARK_SERVER_TOKEN=your_postmark_server_token_here
   ```

   _Note: This file is `.gitignore`d to prevent accidental commits of your secret token._

4. **Configure Google Sheets API Credentials (if using Google Sheets as a data source):**
   If you are using Google Sheets as a lead data source, you will need to provide a service account key file. Set the path to this file in your `.env`:

   ```dotenv
   GOOGLE_GCP_CREDENTIALS_PATH=/path/to/your/google-sheets-key.json
   ```

   _Note: Ensure this key file is stored securely and is not committed to version control._

5. **Configuration File Example:**
   A `config.json.example` file is provided at the project root. This file outlines the structure for configuring various aspects of the application, including the new configurable URL generation.

6. **Ensure your DuckDB database is present:**
   Place your `business_cards.duckdb` file in the root of the project. The application will read lead data from the `stg_cards_data` table within this database.

## Usage

To send email blasts, use the `send` command with command-line arguments or the `send-from-config` command with a JSON configuration file.

For detailed usage examples and configuration, please refer to the `examples/` directory:

- `examples/send-command-example.sh`: Example of using the `send` command with command-line arguments.
- `examples/config-example.json`: Example of a JSON configuration file for the `send-from-config` command.

## Development

For development instructions, including how to run tests and build the project, please refer to [DEVELOPMENT.md](DEVELOPMENT.md).

## Security & PII

This project handles sensitive information and offers PII (Personally Identifiable Information) logging capabilities. Understanding how configuration is managed and PII is handled is crucial for secure operation.

### Configuration Management

Configuration is strictly separated into two categories:

1. **Sensitive/Environment-Specific (`.env` file):** This file, located at the project root, stores all credentials, API keys, and paths to sensitive files. It is **`.gitignore`d** to prevent accidental commitment to version control. Examples include `POSTMARK_API_TOKEN`, `GOOGLE_GCP_CREDENTIALS_PATH`, and database paths.

   _Always ensure your `.env` file is not committed to your repository._

2. **Non-Sensitive/Project-Specific/Campaign-Specific (CLI arguments or `config.json`):** This includes all campaign-related settings such as the 'from' email address, HTML template path, subject lines, template data for personalization, and header mappings. These are safe to store in configuration files or pass via command-line arguments.

   _Never place sensitive credentials directly in `config.json` or as direct CLI arguments._

### PII Logging

For debugging and auditing purposes, this application includes an optional PII logging feature. When enabled, certain PII (e.g., recipient email addresses) will be written to a local log file (`pii.log`).

- **Enabling PII Logging:** Set the `ENABLE_PII_LOGGING` environment variable to `true` in your `.env` file:

  ```dotenv
  ENABLE_PII_LOGGING="true"
  ```

- **Log File Location:** The `pii.log` file will be created in the project's root directory.

- **Security Warning:** The `pii.log` file contains sensitive data and is **`.gitignore`d**. Exercise extreme caution when handling this file. Do not share it or commit it to version control. Ensure it is regularly reviewed and securely deleted when no longer needed.

  _It is your responsibility to manage the security of the `pii.log` file._
