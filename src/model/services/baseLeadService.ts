import Ajv, { ValidateFunction } from 'ajv';
import { OpenAPIV3 } from 'openapi-types';
import { piiLog } from '../utils/piiLogger';
import { logWarn } from '../../view/consoleOutput';

export interface Lead {
  [key: string]: string | null | undefined | number | boolean;
}

export interface LeadValidationResult {
  validLeads: Array<{ [key: string]: string | null | undefined }>;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errorsByType: Record<string, number>;
}

export abstract class LeadService {
  protected _headerMapping: Record<string, string>;
  protected ajv: Ajv;
  protected validateLead: ValidateFunction;
  protected leadSchema: OpenAPIV3.Document;

  constructor(headerMapping: Record<string, string>, leadSchema: OpenAPIV3.Document) {
    this._headerMapping = headerMapping;
    this.ajv = new Ajv({
      useDefaults: true,
      coerceTypes: true,
      strict: true,
      allErrors: true, // Collect all errors, not just the first one
    });
    this.ajv.addFormat('email', /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
    this.ajv.addVocabulary([
      // OpenAPI root elements
      'components',
      'externalDocs',
      'info',
      'openapi',
      'paths',
      'security',
      'servers',
      // OpenAPI Request/Response (relative) root element
      'content',
    ]);
    this.validateLead = this.ajv.compile(
      leadSchema.components?.schemas?.Lead as OpenAPIV3.SchemaObject
    );
    this.leadSchema = leadSchema;
  }

  protected abstract _getRawLeads(): Promise<Array<Record<string, string | null | undefined>>>;

  public async getLeads(): Promise<LeadValidationResult> {
    const rawLeads = await this._getRawLeads();

    const validLeads: Array<{ [key: string]: string | null | undefined }> = [];
    const totalRecords = rawLeads.length;
    let validRecords = 0;
    let invalidRecords = 0;
    const errorsByType: Record<string, number> = {};

    for (const rawLeadData of rawLeads) {
      const isValid = this.validateLead(rawLeadData);
      if (isValid) {
        validLeads.push(rawLeadData);
        validRecords++;
      } else {
        invalidRecords++;
        if (this.validateLead.errors) {
          piiLog(`Invalid lead data: ${JSON.stringify(rawLeadData)}`);
          piiLog(`Validation errors: ${JSON.stringify(this.validateLead.errors)}`);
          for (const error of this.validateLead.errors) {
            const errorType = error.keyword || 'unknown';
            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
          }
        } else {
          piiLog(`Invalid lead data (no specific errors reported): ${JSON.stringify(rawLeadData)}`);
          errorsByType['unknown'] = (errorsByType['unknown'] || 0) + 1;
        }
      }
    }

    if (invalidRecords > 0 && process.env.ENABLE_PII_LOGGING !== 'true') {
      logWarn(
        `Warning: ${invalidRecords} records had validation errors. Set ENABLE_PII_LOGGING=true in your .env file to see detailed error information in pii.log.`
      );
    }

    return {
      validLeads,
      totalRecords,
      validRecords,
      invalidRecords,
      errorsByType,
    };
  }

  public getReservedTemplateKeys(): Promise<Set<string>> {
    const schemaProperties = (this.leadSchema.components?.schemas?.Lead as OpenAPIV3.SchemaObject)
      .properties;
    const reservedKeys = new Set<string>(Object.keys(schemaProperties || {}));
    return Promise.resolve(reservedKeys);
  }
}
