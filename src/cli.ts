import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import * as fs from 'fs/promises';
import { getConfig } from './services/configService';
import { sendEmails } from './emailSender';
import { customReviver } from './utils/templateProcessor';

export async function main() {
  try {
    const config = getConfig();
    return yargs(hideBin(process.argv))
      .command(
        'send <from> <htmlTemplatePath>',
        'Send a batch of emails using a custom HTML template',
        (yargs) => {
          return yargs
            .positional('from', { describe: 'The from email address', type: 'string' })
            .positional('htmlTemplatePath', {
              describe: 'The path to the compiled HTML email template',
              type: 'string',
            })
            .option('source', {
              describe: 'The lead data source to use',
              type: 'string',
              choices: ['duckdb', 'google-sheets'],
              demandOption: true,
            })
            .option('force-send', {
              describe: 'A comma-separated list of email addresses to force send to',
              type: 'string',
            })
            .option('google-sheets-url', {
              describe: 'The URL of the Google Sheet to load data from',
              type: 'string',
            })
            .option('google-sheets-sheet-name', {
              describe: 'The name of the sheet within the Google Sheet (e.g., "Sheet1", "data")',
              type: 'string',
            })
            .option('db-path', {
              describe: 'The path to the DuckDB database file',
              type: 'string',
            })
            .option('subject', {
              describe: 'The subject line for the email',
              type: 'string',
              demandOption: true,
            })
            .option('text-body', {
              describe:
                'The plain text body for the email (optional, generated from HTML if not provided)',
              type: 'string',
            })
            .option('template-data', {
              describe: 'JSON string of key-value pairs for template personalization',
              type: 'string',
              default: '{}',
            })
            .option('header-mapping', {
              describe: 'JSON string of key-value pairs for header mapping',
              type: 'string',
              demandOption: true,
            })
            .group(['google-sheets-url', 'google-sheets-sheet-name'], 'Google Sheets Options:')
            .group(['db-path'], 'DuckDB Options:')
            .conflicts('google-sheets-url', 'db-path')
            .conflicts('google-sheets-sheet-name', 'db-path');
        },
        async (argv) => {
          const forceSend = argv.forceSend?.split(',').map((email) => email.trim());
          await sendEmails({
            from: argv.from as string,
            htmlTemplatePath: argv.htmlTemplatePath as string,
            source: argv.source,
            forceSend,
            subject: argv.subject as string,
            textBody: argv.textBody as string,
            templateData: JSON.parse(argv.templateData as string, customReviver),
            headerMapping: JSON.parse(argv.headerMapping as string),
            config: config,
          });
        }
      )
      .command(
        'send-from-config <configFilePath>',
        'Send a batch of emails using a JSON configuration file',
        (yargs) => {
          return yargs.positional('configFilePath', {
            describe: 'Path to the JSON configuration file',
            type: 'string',
          });
        },
        async (argv) => {
          try {
            const configContent = await fs.readFile(argv.configFilePath as string, 'utf-8');
            const runConfig = JSON.parse(configContent);
            // Handle forceSend if it's a comma-separated string in the config file
            if (typeof runConfig.forceSend === 'string') {
              runConfig.forceSend = runConfig.forceSend
                .split(',')
                .map((email: string) => email.trim());
            }
            if (!runConfig.headerMapping) {
              throw new Error('headerMapping is required in the config file.');
            }
            await sendEmails({ ...runConfig, config: config });
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error reading or parsing config file: ${error.message}`);
            }
            process.exit(1);
          }
        }
      )
      .demandCommand(1, 'You need at least one command before moving on')
      .help()
      .alias('help', 'h')
      .strict()
      .exitProcess(false) // Prevent yargs from calling process.exit
      .parseAsync();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      throw error; // Re-throw the error for testing
    } else {
      throw error; // Re-throw unknown errors as well
    }
  }
}

if (require.main === module) {
  main();
}
