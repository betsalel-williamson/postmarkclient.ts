import * as dotenv from 'dotenv';
dotenv.config();

import { Lead } from '../services/leadService.types';
import { UrlConfig } from '../utils/url'; // Import UrlConfig

export interface Config {
  postmarkServerToken: string;
  googleSheetsKeyFilePath?: string;
  googleSheetsSpreadsheetId?: string;
  googleSheetsUrl?: string;
  googleSheetsSheetName?: string;
  dbPath?: string;
  headerMapping?: Record<string, keyof Lead>;
  templateData?: Record<string, string | UrlConfig>; // Updated type
}

export function getConfig(): Config {
  const postmarkServerToken = process.env.POSTMARK_API_TOKEN;
  const googleSheetsKeyFilePath = process.env.GOOGLE_GCP_CREDENTIALS_PATH;
  const googleSheetsSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const googleSheetsUrl = process.env.GOOGLE_SHEETS_URL;
  const googleSheetsSheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;
  const dbPath = process.env.DB_PATH;

  if (!postmarkServerToken) {
    throw new Error('POSTMARK_API_TOKEN not set in .env file');
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
