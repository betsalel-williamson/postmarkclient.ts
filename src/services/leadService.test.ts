import { describe, it, expect } from 'vitest';
import { createLeadService } from './leadService';
import { DuckDbLeadService } from './duckdbLeadService';
import { Config } from './configService';
import { GoogleSheetsLeadService } from './googleSheetsLeadService';
import { OpenAPIV3 } from 'openapi-types';

describe('leadService factory', () => {
  const dummyHeaderMapping: Record<string, string> = {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    cell: 'phone_number',
    phone: 'phone_number',
    company: 'company',
    title: 'title',
    products: 'product_interest',
    notes: 'notes',
    customer_facing_notes: 'customer_facing_notes',
  };

  const mockLeadSchema: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
      title: 'Lead Schema',
      version: '1.0.0',
    },
    paths: {},
    components: {
      schemas: {
        Lead: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone_number: { type: 'string' },
            company: { type: 'string' },
            title: { type: 'string' },
            product_interest: { type: 'string', enum: ['cat', 'dog', 'cat+dog'] },
            notes: { type: 'string' },
            customer_facing_notes: { type: 'string' },
          },
          required: ['email'],
        },
      },
    },
  };

  it("should return a DuckDbLeadService instance for source 'duckdb'", () => {
    const mockConfig: Config = { dbPath: './test.duckdb', postmarkServerToken: 'test-token' };
    const service = createLeadService('duckdb', mockConfig, dummyHeaderMapping, mockLeadSchema);
    expect(service).toBeInstanceOf(DuckDbLeadService);
  });

  it("should return a GoogleSheetsLeadService instance for source 'google-sheets'", () => {
    const mockConfig: Config = {
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
      postmarkServerToken: 'test-token',
    };
    const service = createLeadService(
      'google-sheets',
      mockConfig,
      dummyHeaderMapping,
      mockLeadSchema
    );
    expect(service).toBeInstanceOf(GoogleSheetsLeadService);
  });

  it('should throw an error for an unsupported source', () => {
    const mockConfig: Config = { dbPath: './test.duckdb', postmarkServerToken: 'test-token' };
    expect(() =>
      createLeadService('unsupported', mockConfig, dummyHeaderMapping, mockLeadSchema)
    ).toThrow('Unsupported lead service source: unsupported');
  });
});
