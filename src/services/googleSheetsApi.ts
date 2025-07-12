import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export class GoogleSheetsApi {
  private auth: GoogleAuth;

  constructor(keyFilePath: string) {
    this.auth = new GoogleAuth({
      keyFile: keyFilePath,
      scopes: SCOPES,
    });
  }

  public async getValues(
    spreadsheetId: string,
    range: string
  ): Promise<any[][] | null | undefined> {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return res.data.values;
  }
}
