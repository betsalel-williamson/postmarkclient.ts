import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleSheetsLeadService, Config } from './';
import { OpenAPIV3 } from 'openapi-types';

let mockGetValues = vi.fn();

vi.mock('./googleSheetsApi', () => {
  return {
    GoogleSheetsApi: vi.fn().mockImplementation(() => {
      return {
        getValues: mockGetValues,
      };
    }),
  };
});

describe('GoogleSheetsLeadService', () => {
  const dummyHeaderMapping: Record<string, string> = {
    company: 'company',
    title: 'title',
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    cell_phone: 'phone_number',
    product_interest: 'product_interest',
    customer_notes: 'notes',
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

  // Reset mock before each test to avoid interference
  beforeEach(() => {
    mockGetValues = vi.fn((spreadsheetId: string, range: string) => {
      if (range.includes('A1:Z')) {
        // This is a call for headers and data
        return Promise.resolve([
          [
            '#',
            'company',
            'title',
            'first_name',
            'last_name',
            'email',
            'cell_phone',
            'product_interest',
            'customer_notes',
          ],
          [
            '1',
            'Example Company',
            'Example Title',
            'GenericFirstName',
            'GenericLastName',
            'john.doe@example.com',
            null,
            'cat+dog',
            'test note',
          ],
        ]);
      } else {
        // This is a call for just headers (e.g., from getReservedTemplateKeys)
        return Promise.resolve([['#', 'first_name', 'email', 'company', 'custom_field']]);
      }
    });
  });

  it('should throw an error if googleSheetsKeyFilePath is not provided', () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsSpreadsheetId: 'test-id',
    };
    expect(() => new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema)).toThrow(
      'GOOGLE_GCP_CREDENTIALS_PATH not set in .env file'
    );
  });

  it('should throw an error if neither spreadsheet ID nor URL/sheet name are provided', () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
    };
    expect(() => new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema)).toThrow(
      'Either GOOGLE_SHEETS_SPREADSHEET_ID or both GOOGLE_SHEETS_URL and GOOGLE_SHEETS_SHEET_NAME must be set in .env file'
    );
  });

  it('should throw an error if there are duplicate headers', async () => {
    mockGetValues.mockResolvedValueOnce([
      ['#', 'email', 'email'],
      ['1', 'test1@example.com', 'test2@example.com'],
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    await expect(service.getLeads()).rejects.toThrow('Headers must be unique.');
  });

  it("should throw an error if the first header is not '#'", async () => {
    mockGetValues.mockResolvedValueOnce([
      ['email', '#'],
      ['test1@example.com', '1'],
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    await expect(service.getLeads()).rejects.toThrow("The first column must be '#'.");
  });

  it('should throw an error if a row is missing an ID', async () => {
    mockGetValues.mockResolvedValueOnce([
      ['#', 'email'],
      ['1', 'test1@example.com'],
      [null, 'test2@example.com'],
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    await expect(service.getLeads()).rejects.toThrow('Missing ID for row 3');
  });

  it('should correctly parse lead data with the new header mapping using spreadsheet ID', async () => {
    mockGetValues.mockResolvedValueOnce([
      [
        '#',
        'company',
        'title',
        'first_name',
        'last_name',
        'email',
        'cell_phone',
        'product_interest',
        'customer_notes',
      ],
      [
        '1',
        'My Pet Store',
        'My Title',
        'FirstName',
        'LastName',
        'example@gmail.com',
        null,
        'cat+dog',
        'test note',
      ],
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].company).toBe('My Pet Store');
    expect(result.validLeads[0].first_name).toBe('FirstName');
    expect(result.validLeads[0].notes).toBe('test note');
    expect(result.totalRecords).toBe(1);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(0);
    expect(mockGetValues).toHaveBeenCalledWith('test-id', 'A1:Z');
  });

  it('should filter out invalid leads', async () => {
    mockGetValues.mockResolvedValueOnce([
      ['#', 'email'],
      ['1', 'valid@example.com'],
      ['2', 'invalid-email'], // Invalid email format
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].email).toBe('valid@example.com');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('format');
  });

  it('should correctly parse lead data with the new header mapping using URL and sheet name', async () => {
    mockGetValues.mockResolvedValueOnce([
      [
        '#',
        'company',
        'title',
        'first_name',
        'last_name',
        'email',
        'cell_phone',
        'product_interest',
        'customer_notes',
      ],
      [
        '1',
        'Another Pet Store',
        'Another Title',
        'Jane',
        'Doe',
        'jane.doe@example.com',
        null,
        'dog',
        'another note',
      ],
    ]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet_id_from_url/edit',
      googleSheetsSheetName: 'data',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const result = await service.getLeads();
    expect(result.validLeads).toHaveLength(1);
    expect(result.validLeads[0].company).toBe('Another Pet Store');
    expect(result.validLeads[0].first_name).toBe('Jane');
    expect(result.validLeads[0].notes).toBe('another note');
    expect(result.totalRecords).toBe(1);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(0);
    expect(mockGetValues).toHaveBeenCalledWith('spreadsheet_id_from_url', 'data!A1:Z');
  });

  it('should throw an error for an invalid Google Sheets URL', async () => {
    mockGetValues.mockResolvedValueOnce([]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsUrl: 'invalid-url',
      googleSheetsSheetName: 'data',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    await expect(service.getLeads()).rejects.toThrow('Invalid Google Sheets URL provided.');
  });

  it('should return reserved template keys from Google Sheets headers', async () => {
    // This mock is specifically for getReservedTemplateKeys
    mockGetValues.mockResolvedValueOnce([['#', 'first_name', 'email', 'company', 'custom_field']]);
    const config: Config = {
      postmarkServerToken: 'test-token',
      googleSheetsKeyFilePath: 'test-path',
      googleSheetsSpreadsheetId: 'test-id',
    };
    const service = new GoogleSheetsLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const reservedKeys = await service.getReservedTemplateKeys();
    expect(reservedKeys).toEqual(
      new Set([
        '#',
        'company',
        'custom_field',
        'customer_facing_notes',
        'email',
        'first_name',
        'last_name',
        'notes',
        'phone_number',
        'product_interest',
        'title',
      ])
    );
  });
});
