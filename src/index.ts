import * as dotenv from 'dotenv';
dotenv.config();
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

interface Arguments {
  from: string;
  to: string;
  subject: string;
  body: string;
  [key: string]: unknown; // Add index signature
}

import { getLeads } from './services/leadService';
import { buildOptInUrl } from './utils/url';
import { ServerClient } from 'postmark';

export async function run(argv: { from: string, campaign: string, template: string }, dbPath?: string) {
  const serverToken = process.env.POSTMARK_SERVER_TOKEN;

  if (!serverToken) {
    console.error('Error: POSTMARK_SERVER_TOKEN environment variable not set.');
    throw new Error('POSTMARK_SERVER_TOKEN not set');
  }

  const client = new ServerClient(serverToken);
  const leads = await getLeads(dbPath);

  for (const lead of leads) {
    if (!lead.email) {
      console.warn(`Skipping lead with no email: ${lead.first_name} ${lead.last_name}`);
      continue;
    }

    const url = buildOptInUrl('https://homelifepet.com/pages/b2b-marketing-opt-in', argv.campaign, lead);

    await client.sendEmailWithTemplate({
      From: argv.from,
      To: lead.email,
      TemplateAlias: argv.template,
      TemplateModel: {
        ...lead,
        action_url: url,
      }
    });

    console.log(`Email sent to ${lead.email}`);
  }
}

export async function main() {
  yargs(hideBin(process.argv))
    .command(
      'send <from> <campaign> <template>',
      'Send a batch of emails using a Postmark template',
      (yargs) => {
        return yargs
          .positional('from', { describe: 'The from email address', type: 'string' })
          .positional('campaign', { describe: 'The campaign name (for UTM tracking)', type: 'string' })
          .positional('template', { describe: 'The Postmark template alias to use', type: 'string' });
      },
      async (argv) => {
        if (typeof argv.from === 'string' && typeof argv.campaign === 'string' && typeof argv.template === 'string') {
          await run(argv as { from: string, campaign: string, template: string }, undefined);
        } else {
          console.error('Invalid arguments');
          process.exit(1);
        }
      }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('help', 'h')
    .parse();
}

if (require.main === module) {
  main();
}

