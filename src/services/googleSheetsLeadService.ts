import { Lead, LeadService } from './leadService.types';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function authorize(keyFilePath: string) {
  const auth = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  return client;
}

export class GoogleSheetsLeadService implements LeadService {
  public async getLeads(options: { spreadsheetId: string; range: string; keyFilePath: string }): Promise<Lead[]> {
    const auth = await authorize(options.keyFilePath);
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: options.spreadsheetId,
      range: options.range,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return [];
    }

    const leads: Lead[] = rows.map((row: any[]) => ({
      first_name: row[0] || null,
      last_name: row[1] || null,
      email: row[2] || null,
      phone_number: row[3] || null,
      company: row[4] || null,
      title: row[5] || null,
      product_interest: row[6] || null,
      notes: row[7] || null,
      customer_facing_notes: row[8] || null,
    }));

    return leads;
  }
}