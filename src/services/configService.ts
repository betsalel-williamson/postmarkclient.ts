import * as dotenv from 'dotenv';
dotenv.config();

export interface Config {
  postmarkServerToken: string;
  googleSheetsKeyFilePath?: string;
  googleSheetsSpreadsheetId?: string;
  googleSheetsUrl?: string;
  googleSheetsSheetName?: string;
  dbPath?: string;
}

export function getConfig(): Config {
  const postmarkServerToken = process.env.POSTMARK_API_TOKEN;
  if (!postmarkServerToken) {
    throw new Error('POSTMARK_API_TOKEN not set in .env file');
  }

  const googleSheetsKeyFilePath = process.env.GOOGLE_GCP_CREDENTIALS_PATH;
  const googleSheetsSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const googleSheetsUrl = process.env.GOOGLE_SHEETS_URL;
  const googleSheetsSheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;
  const dbPath = process.env.DB_PATH;

  if (!dbPath && !googleSheetsUrl) {
    throw new Error('Either DB_PATH or GOOGLE_SHEETS_URL must be set in .env file');
  }

  if (dbPath && googleSheetsUrl) {
    throw new Error('DB_PATH and GOOGLE_SHEETS_URL cannot both be set in .env file.');
  }

  return {
    postmarkServerToken,
    googleSheetsKeyFilePath,
    googleSheetsSpreadsheetId,
    googleSheetsUrl,
    googleSheetsSheetName,
    dbPath,
  };
}
