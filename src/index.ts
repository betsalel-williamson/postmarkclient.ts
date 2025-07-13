import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { createLeadService } from './services/leadService';
import { buildUrl, isUrlConfig, UrlConfig } from './utils/url';
import { ServerClient } from 'postmark';
import { Config, getConfig } from './services/configService';
import * as fs from 'fs/promises';
import { piiLog } from './utils/piiLogger';
import { processTemplate } from './utils/templateProcessor';
import { Lead } from './services/leadService.types';

export async function run(
  argv: {
    from: string;
    htmlTemplatePath: string;
    source: string;
    forceSend?: string[];
    subject: string;
    textBody?: string;
    templateData: Record<string, string | UrlConfig>;
    headerMapping: Record<string, string>; // Added headerMapping to argv
  },
  config: Config
) {
  // Merge headerMapping from argv into config for leadService initialization
  const currentConfig = { ...config, headerMapping: argv.headerMapping };

  const client = new ServerClient(currentConfig.postmarkServerToken);
  const leadService = createLeadService(argv.source, currentConfig);
  const leads = await leadService.getLeads();

  const htmlTemplate = await fs.readFile(argv.htmlTemplatePath, 'utf-8');

  // Dynamically determine reserved keys once before the loop
  const leadServiceReservedKeys = await leadService.getReservedTemplateKeys();

  const reservedTemplateKeys = new Set<string>([...Array.from(leadServiceReservedKeys)]);

  // Check for conflicts with user-provided templateData before processing leads
  const conflictingKeys = Object.keys(argv.templateData).filter((key) =>
    reservedTemplateKeys.has(key)
  );
  if (conflictingKeys.length > 0) {
    throw new Error(
      `Conflict detected in templateData keys: ${conflictingKeys.join(', ')}. ` +
        `Reserved keys are: ${Array.from(reservedTemplateKeys).sort().join(', ')}. ` +
        `These keys are automatically generated and cannot be overridden.`
    );
  }

  for (const lead of leads) {
    if (!lead.email) {
      console.warn(`Skipping lead with no email: ${lead.first_name} ${lead.last_name}`);
      continue;
    }

    const messages = await client.getOutboundMessages({ count: 1, recipient: lead.email });
    if (Number(messages.TotalCount) > 0 && !argv.forceSend?.includes(lead.email)) {
      console.warn(`Email already sent to ${lead.email}, skipping.`);
      continue;
    }

    // Prepare templateData with dynamic values, allowing argv.templateData to override
    const currentTemplateData: Record<string, string | UrlConfig> = {};

    // Dynamically add lead properties
    for (const key of Array.from(leadServiceReservedKeys)) {
      if (Object.prototype.hasOwnProperty.call(lead, key)) {
        currentTemplateData[key] = String(lead[key] || '');
      }
    }

    // User-provided templateData last to allow user overrides for non-reserved keys
    Object.assign(currentTemplateData, argv.templateData);

    const { personalizedHtml, personalizedSubject, personalizedText } = processTemplate(
      htmlTemplate,
      argv.subject,
      currentTemplateData,
      lead
    );

    await client.sendEmail({
      From: argv.from,
      To: lead.email,
      HtmlBody: personalizedHtml,
      Subject: personalizedSubject,
      TextBody: argv.textBody || personalizedText,
    });

    console.log(`Email sent to recipient.`);
    piiLog(`Email sent to ${lead.email}`);
  }
}

export async function main() {
  try {
    const config = getConfig();
    await yargs(hideBin(process.argv))
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
            });
        },
        async (argv) => {
          const forceSend = argv.forceSend?.split(',').map((email) => email.trim());
          await run(
            {
              from: argv.from as string,
              htmlTemplatePath: argv.htmlTemplatePath as string,
              source: argv.source,
              forceSend,
              subject: argv.subject as string,
              textBody: argv.textBody as string,
              templateData: JSON.parse(argv.templateData as string, customReviver),
              headerMapping: JSON.parse(argv.headerMapping as string),
            },
            config
          );
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
            await run(runConfig, config);
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
      .parseAsync();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

function customReviver(
  key: string,
  value: unknown
): Record<string, string | UrlConfig | number | boolean | null | undefined> | unknown {
  if (key === '') {
    // Top-level object
    return value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'baseUrl' in value &&
    'searchParams' in value // Changed from searchParams
  ) {
    return value as UrlConfig;
  }
  return value;
}
