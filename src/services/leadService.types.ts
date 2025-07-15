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
    this.ajv = new Ajv();
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
    this.validateLead = this.ajv.compile(leadSchema);
    this.leadSchema = leadSchema;
  }

  abstract getLeads(
    options?: Record<string, unknown>
  ): Promise<{ [key: string]: string | null | undefined }[]>;

  getReservedTemplateKeys(): Promise<Set<string>> {
    const schemaProperties = (this.leadSchema.components?.schemas?.Lead as OpenAPIV3.SchemaObject)
      .properties;
    const reservedKeys = new Set<string>(Object.keys(schemaProperties || {}));
    return Promise.resolve(reservedKeys);
  }
}
