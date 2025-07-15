import Ajv, { ValidateFunction } from 'ajv';
import { OpenAPIV3 } from 'openapi-types';

export interface Lead {
  [key: string]: string | null | undefined | number | boolean;
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

  public async getLeads(): Promise<Array<{ [key: string]: string | null | undefined }>> {
    const rawLeads = await this._getRawLeads();

    // validate and transform each lead
    const leads = rawLeads.filter((rawLeadData) => this.validateLead(rawLeadData));

    return leads;
  }

  public getReservedTemplateKeys(): Promise<Set<string>> {
    const schemaProperties = (this.leadSchema.components?.schemas?.Lead as OpenAPIV3.SchemaObject)
      .properties;
    const reservedKeys = new Set<string>(Object.keys(schemaProperties || {}));
    return Promise.resolve(reservedKeys);
  }
}
