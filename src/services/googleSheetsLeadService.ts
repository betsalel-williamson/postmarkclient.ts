import { Lead, LeadService } from './leadService.types';
import { GoogleSheetsApi } from './googleSheetsApi';

export class GoogleSheetsLeadService implements LeadService {
  public async getLeads(options: {
    spreadsheetId: string;
    keyFilePath: string;
  }): Promise<Lead[]> {
    const api = new GoogleSheetsApi(options.keyFilePath);
    const rows = await api.getValues(options.spreadsheetId, 'A1:Z');

    if (!rows || rows.length < 2) {
      throw new Error('Sheet must contain a header row and at least one data row.');
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Validate headers
    if (new Set(headers).size !== headers.length) {
      throw new Error('Headers must be unique.');
    }
    if (headers[0] !== 'row_id') {
      throw new Error("The first column must be 'row_id'.");
    }

    const leads: Lead[] = dataRows.map((row, index) => {
      if (!row[0]) {
        throw new Error(`Missing row_id for row ${index + 2}`);
      }

      const lead: Partial<Lead> = {};
      headers.forEach((header, i) => {
        if (header in { first_name: '', last_name: '', email: '', phone_number: '', company: '', title: '', product_interest: '', notes: '', customer_facing_notes: '' }) {
          lead[header as keyof Lead] = row[i] || null;
        }
      });
      return lead as Lead;
    });

    return leads;
  }
}
