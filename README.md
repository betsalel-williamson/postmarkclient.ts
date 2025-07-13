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

### Running Tests

To run the test suite:

```bash
npm test
```

### Building the Project

To compile the TypeScript code:

```bash
npm run build
```
