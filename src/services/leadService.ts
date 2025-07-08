import { validateAndTransformLead } from '../utils/validation';
import { DuckDBInstance } from '@duckdb/node-api';

export interface Lead {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  company: string | null;
  title: string | null;
  product_interest: 'cat' | 'dog' | 'cat+dog' | null | undefined;
  notes: string | null;
}

import * as fs from 'fs';

export async function getLeads(dbPath: string = 'business_cards.duckdb'): Promise<Lead[]> {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at: ${dbPath}`);
  }

  const instance = await DuckDBInstance.create(dbPath);
  const connection = await instance.connect();

  try {
    const reader = await connection.runAndReadAll('SELECT * FROM stg_cards_data');
    const res = reader.getRows();

    const leads: Lead[] = res.map((row: unknown) => {
      const validated = validateAndTransformLead(row);

      // Type guard to ensure row is an object with string properties
      if (typeof row !== 'object' || row === null) {
        // Or handle this error more gracefully
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
      };
    });
    return leads;
  } finally {
    await connection.disconnectSync();
  }
}
