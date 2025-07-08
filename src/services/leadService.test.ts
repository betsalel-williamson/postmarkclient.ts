import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getLeads, Lead } from './leadService';
import * as duckdb from 'duckdb';
import * as fs from 'fs';

describe('leadService', () => {
  const testDbPath = './test_business_cards.duckdb';

  // Use a promise-based setup to handle async operations
  beforeAll(() => new Promise<void>((resolve, reject) => {
    // Clean up old test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const db = new duckdb.Database(testDbPath, (err) => {
      if (err) return reject(err);

      db.exec(
        "CREATE TABLE stg_cards_data (first_name VARCHAR, last_name VARCHAR, email VARCHAR, cell VARCHAR, phone VARCHAR, company VARCHAR, title VARCHAR, products VARCHAR, notes VARCHAR);",
        (err) => {
          if (err) return reject(err);

          db.exec(
            "INSERT INTO stg_cards_data VALUES ('John', 'Doe', 'john.doe@example.com', '123-456-7890', null, 'ACME Inc', 'CEO', 'cat', 'Test note')",
            (err) => {
              if (err) return reject(err);
              db.close(resolve);
            }
          );
        }
      );
    });
  }));

  // Cleanup the dummy database after tests
  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should return an array of leads from a test database', async () => {
    const leads = await getLeads(testDbPath);

    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0].first_name).toBe('John');
  });
});
