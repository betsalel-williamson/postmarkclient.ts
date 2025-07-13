import { validateAndTransformLead } from '../utils/validation';
import { DuckDBInstance } from '@duckdb/node-api';
import { Lead, LeadService } from './leadService.types';
import * as fs from 'fs';
import { Config } from './configService';

export class DuckDbLeadService implements LeadService {
  private config: Config;

  constructor(config: Config) {
    if (!config.dbPath) {
      throw new Error('DB_PATH not set in .env file');
    }
    this.config = config;
  }

  public async getReservedTemplateKeys(): Promise<Set<string>> {
    const dbPath = this.config.dbPath as string;
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at: ${dbPath}`);
    }

    const instance = await DuckDBInstance.create(dbPath);
    const connection = await instance.connect();

    try {
      const reader = await connection.runAndReadAll(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'stg_cards_data' ORDER BY ordinal_position;"
      );
      // Assuming reader.getRows() returns an array of objects, where each object has a 'column_name' property.
      // If it returns an array of arrays, then row[0] would be appropriate.
      // Given the error 'undefined', it's likely 'column_name' property is missing or row is an array.
      // Let's try accessing it as an array element first.
      const columns = reader.getRows().map((row: any) => row[0]);
      return new Set(columns);
    } finally {
      await connection.disconnectSync();
    }
  }

  public async getLeads(): Promise<Lead[]> {
    const dbPath = this.config.dbPath as string;
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at: ${dbPath}`);
    }

    const instance = await DuckDBInstance.create(dbPath);
    const connection = await instance.connect();

    try {
      const reader = await connection.runAndReadAll(
        'SELECT first_name, last_name, email, cell, phone, company, title, products, notes FROM stg_cards_data'
      );
      const res = reader.getRows();

      const leads: Lead[] = res.map((row: unknown) => {
        const validated = validateAndTransformLead(row);

        if (typeof row !== 'object' || row === null) {
          throw new Error('Invalid row data from database');
        }
        const leadRow = row as string[];

        return {
          first_name: leadRow[0] as string | null,
          last_name: leadRow[1] as string | null,
          email: leadRow[2] as string | null,
          phone_number: (leadRow[3] || leadRow[4]) as string | null,
          company: (validated.company || leadRow[5]) as string | null,
          title: (validated.title || leadRow[6]) as string | null,
          product_interest: validated.product_interest,
          notes: (validated.notes || leadRow[8]) as string | null,
          customer_facing_notes: null,
        };
      });
      return leads;
    } finally {
      await connection.disconnectSync();
    }
  }
}
