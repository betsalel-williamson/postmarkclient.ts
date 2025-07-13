import { Lead, LeadService } from './leadService.types';
import { GoogleSheetsApi } from './googleSheetsApi';
import { Config } from './configService';

export class GoogleSheetsLeadService implements LeadService {
  private config: Config;
  private _headerMapping: Record<string, keyof Lead>;

  constructor(config: Config) {
    if (!config.googleSheetsKeyFilePath) {
      throw new Error('GOOGLE_GCP_CREDENTIALS_PATH not set in .env file');
    }

    if (
      !config.googleSheetsSpreadsheetId &&
      (!config.googleSheetsUrl || !config.googleSheetsSheetName)
    ) {
      throw new Error(
        'Either GOOGLE_SHEETS_SPREADSHEET_ID or both GOOGLE_SHEETS_URL and GOOGLE_SHEETS_SHEET_NAME must be set in .env file'
      );
    }
    if (!config.headerMapping) {
      throw new Error('headerMapping not provided in config.');
    }
    this.config = config;
    this._headerMapping = config.headerMapping; // This is now correctly typed as Record<string, keyof Lead>
  }

  private async _getHeaders(): Promise<string[]> {
    const api = new GoogleSheetsApi(this.config.googleSheetsKeyFilePath as string);

    let spreadsheetId = this.config.googleSheetsSpreadsheetId;
    let range = 'A1:Z';

    if (this.config.googleSheetsUrl && this.config.googleSheetsSheetName) {
      const match = this.config.googleSheetsUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        throw new Error('Invalid Google Sheets URL provided.');
      }
      spreadsheetId = match[1];
      range = `${this.config.googleSheetsSheetName}!A1:Z`;
    } else if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set in .env file');
    }

    const rows = await api.getValues(spreadsheetId as string, range);

    if (!rows || rows.length < 1) {
      throw new Error('Sheet must contain a header row.');
    }
    return rows[0];
  }

  public async getReservedTemplateKeys(): Promise<Set<string>> {
    const headers = await this._getHeaders();
    // Return the actual headers from the Google Sheet as reserved keys
    return new Set(headers);
  }

  public async getLeads(): Promise<Lead[]> {
    const api = new GoogleSheetsApi(this.config.googleSheetsKeyFilePath as string);

    let spreadsheetId = this.config.googleSheetsSpreadsheetId;
    let range = 'A1:Z';

    if (this.config.googleSheetsUrl && this.config.googleSheetsSheetName) {
      const match = this.config.googleSheetsUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        throw new Error('Invalid Google Sheets URL provided.');
      }
      spreadsheetId = match[1];
      range = `${this.config.googleSheetsSheetName}!A1:Z`;
    } else if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set in .env file');
    }

    const rows = await api.getValues(spreadsheetId as string, range);

    if (!rows || rows.length < 2) {
      throw new Error('Sheet must contain a header row and at least one data row.');
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Validate headers
    if (new Set(headers).size !== headers.length) {
      throw new Error('Headers must be unique.');
    }
    if (headers[0] !== '#') {
      throw new Error("The first column must be '#'.");
    }

    const leads: Partial<Lead>[] = dataRows.map((row, index) => {
      if (!row[0]) {
        throw new Error(`Missing ID for row ${index + 2}`);
      }

      const lead: Partial<Lead> = {};
      headers.forEach((header, i) => {
        // Ensure header exists in _headerMapping and its value is a valid keyof Lead
        if (this._headerMapping[header]) {
          const mappedHeader: keyof Lead = this._headerMapping[header];
          lead[mappedHeader] = row[i] || null;
        }
      });
      return lead;
    });

    return leads as Lead[];
  }
}
