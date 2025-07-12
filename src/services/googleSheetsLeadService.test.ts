import { describe, it, expect, vi } from 'vitest';
import { GoogleSheetsLeadService } from './googleSheetsLeadService';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

vi.mock('google-auth-library', () => {
  const GoogleAuth = vi.fn().mockImplementation(() => ({
    getClient: vi.fn().mockResolvedValue({}),
  }));
  return { GoogleAuth };
});

vi.mock('googleapis', () => {
  const sheets = {
    spreadsheets: {
      values: {
        get: vi.fn().mockResolvedValue({
          data: {
            values: [
              ['John', 'Doe', 'john.doe@example.com', '123-456-7890', 'ACME Inc', 'CEO', 'cat', 'Test note', null],
            ],
          },
        }),
      },
    },
  };
  return { google: { sheets: () => sheets } };
});

describe('GoogleSheetsLeadService', () => {
  it('should be defined', () => {
    expect(GoogleSheetsLeadService).toBeDefined();
  });

  it('should return an array of leads', async () => {
    const service = new GoogleSheetsLeadService();
    const leads = await service.getLeads({ spreadsheetId: 'test-id', range: 'A1:I', keyFilePath: 'test-path' });
    expect(leads).toHaveLength(1);
    expect(leads[0].first_name).toBe('John');
  });
});