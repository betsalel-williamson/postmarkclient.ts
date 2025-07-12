import { describe, it, expect, vi } from 'vitest';
import { GoogleSheetsLeadService } from './googleSheetsLeadService';
import { GoogleSheetsApi } from './googleSheetsApi';

vi.mock('./googleSheetsApi');

describe('GoogleSheetsLeadService', () => {
  it('should throw an error if there are duplicate headers', async () => {
    const mockGetValues = vi.fn().mockResolvedValueOnce([
      ['row_id', 'email', 'email'],
      ['1', 'test1@example.com', 'test2@example.com'],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    const service = new GoogleSheetsLeadService();
    await expect(service.getLeads({ spreadsheetId: 'test-id', keyFilePath: 'test-path' })).rejects.toThrow(
      'Headers must be unique.'
    );
  });

  it("should throw an error if the first header is not 'row_id'", async () => {
    const mockGetValues = vi.fn().mockResolvedValueOnce([
      ['email', 'row_id'],
      ['test1@example.com', '1'],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    const service = new GoogleSheetsLeadService();
    await expect(service.getLeads({ spreadsheetId: 'test-id', keyFilePath: 'test-path' })).rejects.toThrow(
      "The first column must be 'row_id'."
    );
  });

  it('should throw an error if a row is missing a row_id', async () => {
    const mockGetValues = vi.fn().mockResolvedValueOnce([
      ['row_id', 'email'],
      ['1', 'test1@example.com'],
      [null, 'test2@example.com'],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    const service = new GoogleSheetsLeadService();
    await expect(service.getLeads({ spreadsheetId: 'test-id', keyFilePath: 'test-path' })).rejects.toThrow(
      'Missing row_id for row 3'
    );
  });

  it('should correctly parse lead data', async () => {
    const mockGetValues = vi.fn().mockResolvedValueOnce([
      ['row_id', 'first_name', 'last_name', 'email'],
      ['1', 'John', 'Doe', 'john.doe@example.com'],
    ]);
    GoogleSheetsApi.prototype.getValues = mockGetValues;
    const service = new GoogleSheetsLeadService();
    const leads = await service.getLeads({ spreadsheetId: 'test-id', keyFilePath: 'test-path' });
    expect(leads).toHaveLength(1);
    expect(leads[0].first_name).toBe('John');
  });
});
