import { LeadService } from './baseLeadService';
import { GoogleSheetsApi } from './googleSheetsApi';
import { Config } from './configService';
import { OpenAPIV3 } from 'openapi-types';

export class GoogleSheetsLeadService extends LeadService {
  private config: Config;

  constructor(
    config: Config,
    headerMapping: Record<string, string>,
    leadSchema: OpenAPIV3.Document
  ) {
    super(headerMapping, leadSchema);

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
    this.config = config;
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
    const superHeaders = await super.getReservedTemplateKeys();
    const headers = await this._getHeaders();
    return new Set([...headers, ...superHeaders]);
  }

  async _getRawLeads() {
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

    const leads = dataRows.map((row, index) => {
      if (!row[0]) {
        throw new Error(`Missing ID for row ${index + 2}`);
      }

      const rawLeadData: { [key: string]: string | null | undefined } = {};
      headers.forEach((header, i) => {
        rawLeadData[this._headerMapping[header]] = row[i] || null;
      });
      return rawLeadData;
    });

    return leads;
  }
}
