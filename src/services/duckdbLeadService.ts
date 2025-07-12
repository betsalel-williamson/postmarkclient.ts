import { validateAndTransformLead } from '../utils/validation';
import { DuckDBInstance } from '@duckdb/node-api';
import { Lead, LeadService } from './leadService.types';
import * as fs from 'fs';

export class DuckDbLeadService implements LeadService {
  public async getLeads(options: { dbPath: string }): Promise<Lead[]> {
    const { dbPath = 'business_cards.duckdb' } = options;
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
