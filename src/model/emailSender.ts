import { ServerClient } from 'postmark';
import * as fs from 'fs/promises';
import { PostmarkError } from 'postmark/dist/client/errors/Errors';
import { OpenAPIV3 } from 'openapi-types';
import { piiLog, processTemplate, UrlConfig, sanitizeObjectStrings } from './utils';
import { Config, createLeadService } from './services';
import { logError, logValidationSummary, logWarn } from '../view';

export async function sendEmails(options: {
  from: string;
  htmlTemplatePath: string;
  source: string;
  forceSend?: string[];
  subject: string;
  textBody?: string;
  templateData: Record<string, string | UrlConfig>;
  headerMapping: Record<string, string>;
  config: Config;
  leadSchema: OpenAPIV3.Document;
}) {
  const client = new ServerClient(options.config.postmarkServerToken);
  const leadService = createLeadService(
    options.source,
    options.config,
    options.headerMapping,
    options.leadSchema
  );
  const validationResult = await leadService.getLeads();
  const leads = validationResult.validLeads;

  logValidationSummary(
    validationResult.totalRecords,
    validationResult.validRecords,
    validationResult.invalidRecords,
    validationResult.errorsByType
  );

  const htmlTemplate = await fs.readFile(options.htmlTemplatePath, 'utf-8');

  const leadServiceReservedKeys = await leadService.getReservedTemplateKeys();
  const reservedTemplateKeys = new Set<string>([...Array.from(leadServiceReservedKeys)]);

  const sanitizedTemplateData = sanitizeObjectStrings(options.templateData);

  const conflictingKeys = Object.keys(sanitizedTemplateData).filter((key) =>
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
    const sanitizedLead = sanitizeObjectStrings(lead);
    if (!sanitizedLead.email) {
      logWarn(`Skipping lead with no email`);
      piiLog(`Skipping lead with no email: ${sanitizedLead.first_name} ${sanitizedLead.last_name}`);
      continue;
    }

    const messages = await client.getOutboundMessages({ count: 1, recipient: sanitizedLead.email });
    if (Number(messages.TotalCount) > 0 && !options.forceSend?.includes(sanitizedLead.email)) {
      logWarn(`Email already sent to recipient, skipping.`);
      piiLog(`Email already sent to ${sanitizedLead.email}, skipping.`);
      continue;
    }

    const currentTemplateData: Record<string, string | UrlConfig> = {};
    for (const key of Array.from(leadServiceReservedKeys)) {
      if (Object.prototype.hasOwnProperty.call(sanitizedLead, key)) {
        currentTemplateData[key] = String(sanitizedLead[key as keyof typeof sanitizedLead] || '');
      }
    }
    Object.assign(currentTemplateData, sanitizedTemplateData);

    const { personalizedHtml, personalizedSubject, personalizedText } = processTemplate(
      htmlTemplate,
      options.subject,
      currentTemplateData,
      sanitizedLead
    );

    try {
      await client.sendEmail({
        From: options.from,
        To: sanitizedLead.email,
        HtmlBody: personalizedHtml,
        Subject: personalizedSubject,
        TextBody: options.textBody || personalizedText,
      });

      piiLog(`Email sent to ${sanitizedLead.email}`);
    } catch (error: unknown) {
      if (error instanceof PostmarkError) {
        logError(
          `Postmark API Error (Code: ${error.code}, Status: ${error.statusCode}): ${error.message}`
        );
        throw error;
      } else if (error instanceof Error) {
        logError(`An unexpected error occurred: ${error.message}`);
        throw error;
      } else {
        logError(`An unknown error occurred.`);
        throw error;
      }
    }
  }
}
