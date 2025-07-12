import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { createLeadService } from './services/leadService';
import { buildOptInUrl } from './utils/url';
import { ServerClient } from 'postmark';
import { Config, getConfig } from './services/configService';
import * as fs from 'fs/promises';
import { piiLog } from './utils/piiLogger';
import { convert } from 'html-to-text';

export async function run(
  argv: {
    from: string;
    campaign: string;
    htmlTemplatePath: string;
    source: string;
    forceSend?: string[];
    subject: string;
    textBody?: string;
  },
  config: Config
) {
  const client = new ServerClient(config.postmarkServerToken);
  const leadService = createLeadService(argv.source, config);
  const leads = await leadService.getLeads();

  const htmlTemplate = await fs.readFile(argv.htmlTemplatePath, 'utf-8');

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

    const url = buildOptInUrl(
      'https://homelifepet.com/pages/b2b-marketing-opt-in',
      argv.campaign,
      lead
    );

    let personalizedHtml = htmlTemplate.replace(/{{first_name}}/g, lead.first_name || '');
    personalizedHtml = personalizedHtml.replace(/{{campaign}}/g, argv.campaign);
    personalizedHtml = personalizedHtml.replace(/{{action_url}}/g, url);

    await client.sendEmail({
      From: argv.from,
      To: lead.email,
      HtmlBody: personalizedHtml,
      Subject: argv.subject,
      TextBody: argv.textBody || convert(personalizedHtml, { wordwrap: 130 }),
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
        'send <from> <campaign> <htmlTemplatePath>',
        'Send a batch of emails using a custom HTML template',
        (yargs) => {
          return yargs
            .positional('from', { describe: 'The from email address', type: 'string' })
            .positional('campaign', {
              describe: 'The campaign name (for UTM tracking)',
              type: 'string',
            })
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
              describe: 'The plain text body for the email',
              type: 'string',
              demandOption: true,
            });
        },
        async (argv) => {
          const forceSend = argv.forceSend?.split(',').map((email) => email.trim());
          await run(
            {
              from: argv.from as string,
              campaign: argv.campaign as string,
              htmlTemplatePath: argv.htmlTemplatePath as string,
              source: argv.source,
              forceSend,
              subject: argv.subject as string,
              textBody: argv.textBody as string,
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
            await run(runConfig, config);
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error reading or parsing config file: ${error.message}`);
            } else {
              console.error(`An unknown error occurred while reading or parsing config file: ${error}`);
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
