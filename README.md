# Postmark CLI Helper

This project provides a command-line interface (CLI) application to automate sending personalized email blasts using Postmark, leveraging lead data from a DuckDB database.

## Features

- Reads lead data from an existing `business_cards.duckdb` file.
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

    *Note: This file is `.gitignore`d to prevent accidental commits of your secret token.*

4. **Ensure your DuckDB database is present:**
    Place your `business_cards.duckdb` file in the root of the project. The application will read lead data from the `stg_cards_data` table within this database.

## Usage

To send email blasts, use the `send` command with the required arguments:

```bash
npm start -- send <from_email> <campaign_name> <postmark_template_alias>
```

- `<from_email>`: The sender's email address (e.g., `marketing@yourcompany.com`).
- `<campaign_name>`: A name for your marketing campaign (e.g., `summer-promo-2025`). This will be used for UTM tracking in the generated URLs.
- `<postmark_template_alias>`: The alias of the email template you have configured in your Postmark account (e.g., `b2b-opt-in`). This template should include merge tags for personalization and an `action_url` for the pre-filled form link.

**Example:**

```bash
npm start -- send "info@example.com" "q3-lead-nurturing" "my-custom-template"
```

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

## Project Structure

- `src/index.ts`: Main CLI application logic.
- `src/services/leadService.ts`: Handles database interactions and lead retrieval.
- `src/utils/validation.ts`: Contains data validation and transformation logic.
- `src/utils/url.ts`: Responsible for generating personalized URLs.
- `src/mocks/`: Mock Service Worker setup for API testing.
- `work_items/`: User stories and tasks defining project scope and progress.
