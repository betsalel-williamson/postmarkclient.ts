import { describe, it, expect } from 'vitest';
import { createLeadService } from './leadServiceFactory';
import { LeadService } from './baseLeadService';
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

// Mock a concrete implementation of LeadService for testing the abstract class's logic
class MockLeadService extends LeadService {
  private mockRawLeads: Array<Record<string, string | null | undefined>>;

  constructor(
    headerMapping: Record<string, string>,
    leadSchema: OpenAPIV3.Document,
    rawLeads: Array<Record<string, string | null | undefined>>
  ) {
    super(headerMapping, leadSchema);
    this.mockRawLeads = rawLeads;
  }

  protected async _getRawLeads(): Promise<Array<Record<string, string | null | undefined>>> {
    return Promise.resolve(this.mockRawLeads);
  }
}

describe('LeadService (Abstract Class)', () => {
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
            company: { type: 'string', maxLength: 128 },
            title: { type: 'string', maxLength: 128 },
            product_interest: { type: 'string', enum: ['cat', 'dog', 'cat+dog'] },
            notes: { type: 'string', maxLength: 5000 },
            customer_facing_notes: { type: 'string' },
          },
          required: ['email'],
        },
      },
    },
  };

  const dummyHeaderMapping = {}; // Not directly used in these tests, but required by constructor

  it('should correctly filter leads with invalid email format and report stats', async () => {
    const rawData = [{ email: 'valid@example.com' }, { email: 'invalid-email' }];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].email).toBe('valid@example.com');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('format');
    expect(result.errorsByType.format).toBe(1);
  });

  it('should correctly filter leads with missing required email and report stats', async () => {
    const rawData = [
      { email: 'valid@example.com' },
      { first_name: 'John' }, // Missing email
    ];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].email).toBe('valid@example.com');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('required');
    expect(result.errorsByType.required).toBe(1);
  });

  it('should correctly filter leads for company exceeding maxLength', async () => {
    const rawData = [
      { email: 'valid@example.com', company: 'Short Company' },
      { email: 'test@example.com', company: 'a'.repeat(129) }, // Exceeds maxLength
    ];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].company).toBe('Short Company');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('maxLength');
    expect(result.errorsByType.maxLength).toBe(1);
  });

  it('should correctly filter leads for notes exceeding maxLength', async () => {
    const rawData = [
      { email: 'valid@example.com', notes: 'Short notes' },
      { email: 'test@example.com', notes: 'a'.repeat(5001) }, // Exceeds maxLength
    ];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].notes).toBe('Short notes');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('maxLength');
    expect(result.errorsByType.maxLength).toBe(1);
  });

  it('should return a valid lead for valid data', async () => {
    const rawData = [{ email: 'valid@example.com', first_name: 'Test', company: 'Test Company' }];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].email).toBe('valid@example.com');
    expect(result.totalRecords).toBe(1);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(0);
  });

  it('should return reserved template keys from schema properties', async () => {
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, []);
    const reservedKeys = await service.getReservedTemplateKeys();
    expect(reservedKeys).toEqual(
      new Set([
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'company',
        'title',
        'product_interest',
        'notes',
        'customer_facing_notes',
      ])
    );
  });

  // Test for product_interest transformation (now handled by AJV enum validation)
  it.each([
    ['cat', 'cat'],
    ['dog', 'dog'],
    ['cat+dog', 'cat+dog'],
    ['cats+dogs', undefined], // Invalid enum value, should be filtered out
    ['DOG and CAT', undefined], // Invalid enum value, should be filtered out
    ['kitty', undefined], // Invalid enum value, should be filtered out
    ['puppy', undefined], // Invalid enum value, should be filtered out
  ])('should validate product interest %s to %s', async (input, expected) => {
    const rawData = [{ email: 'test@example.com', product_interest: input }];
    const service = new MockLeadService(dummyHeaderMapping, mockLeadSchema, rawData);
    const result = await service.getLeads();

    if (expected === undefined) {
      expect(result.validLeads).toHaveLength(0); // Invalid leads should be filtered
      expect(result.invalidRecords).toBe(1);
      expect(result.errorsByType).toHaveProperty('enum');
    } else {
      expect(result.validLeads).toHaveLength(1);
      expect(result.validLeads[0].product_interest).toBe(expected);
      expect(result.validRecords).toBe(1);
      expect(result.invalidRecords).toBe(0);
    }
  });
});
