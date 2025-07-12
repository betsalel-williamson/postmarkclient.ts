import { describe, it, expect, vi } from 'vitest';
import { getConfig } from './configService';

describe('configService', () => {
  it('should return the config from environment variables', () => {
    process.env.POSTMARK_API_TOKEN = 'test-token';
    process.env.GOOGLE_GCP_CREDENTIALS_PATH = 'test-path';
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'test-id';
    process.env.GOOGLE_SHEETS_URL = 'test-url';
    process.env.GOOGLE_SHEETS_SHEET_NAME = 'test-sheet-name';
    process.env.DB_PATH = 'test-db-path';

    const config = getConfig();

    expect(config.postmarkServerToken).toBe('test-token');
    expect(config.googleSheetsKeyFilePath).toBe('test-path');
    expect(config.googleSheetsSpreadsheetId).toBe('test-id');
    expect(config.googleSheetsUrl).toBe('test-url');
    expect(config.googleSheetsSheetName).toBe('test-sheet-name');
    expect(config.dbPath).toBe('test-db-path');
  });

  it('should throw an error if POSTMARK_API_TOKEN is not set', () => {
    delete process.env.POSTMARK_API_TOKEN;
    expect(() => getConfig()).toThrow('POSTMARK_API_TOKEN not set in .env file');
  });
});
