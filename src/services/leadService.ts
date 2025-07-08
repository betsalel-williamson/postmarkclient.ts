import { validateAndTransformLead } from '../utils/validation';
import * as duckdb from 'duckdb';

export interface Lead {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  company: string | null;
  title: string | null;
  product_interest: 'cat' | 'dog' | 'cat+dog' | null;
  notes: string | null;
}

export function getLeads(dbPath: string = 'business_cards.duckdb'): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    const db = new duckdb.Database(dbPath);

    db.all('SELECT * FROM stg_cards_data', (err, res) => {
      // Ensure the database is closed, even if there's an error.
      db.close((closeErr) => {
        if (err) {
          return reject(err);
        }
        if (closeErr) {
          return reject(closeErr);
        }

        const leads: Lead[] = res.map((row: unknown) => {
          const validated = validateAndTransformLead(row);

          // Type guard to ensure row is an object with string properties
          if (typeof row !== 'object' || row === null) {
            // Or handle this error more gracefully
            throw new Error('Invalid row data from database'); 
          }
          const leadRow = row as { [key: string]: any };

          return {
            first_name: leadRow.first_name,
            last_name: leadRow.last_name,
            email: leadRow.email,
            phone_number: leadRow.cell || leadRow.phone,
            company: validated.company || leadRow.company,
            title: validated.title || leadRow.title,
            product_interest: validated.product_interest,
            notes: validated.notes || leadRow.notes,
          };
        });
        resolve(leads);
      });
    });
  });
}
