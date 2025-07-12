import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DuckDbLeadService } from './duckdbLeadService';
import { DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';

describe('DuckDbLeadService', () => {
  const testDbPath = './test_business_cards.duckdb';

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const instance = await DuckDBInstance.create(testDbPath);
    const connection = await instance.connect();
    try {
      await connection.run(
        'CREATE TABLE stg_cards_data (first_name VARCHAR, last_name VARCHAR, email VARCHAR, cell VARCHAR, phone VARCHAR, company VARCHAR, title VARCHAR, products VARCHAR, notes VARCHAR);'
      );
      await connection.run(
        "INSERT INTO stg_cards_data VALUES ('John', 'Doe', 'john.doe@example.com', '123-456-7890', null, 'ACME Inc', 'CEO', 'cat', 'Test note')"
      );
    } finally {
      await connection.disconnectSync();
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should throw an error if the database file does not exist', async () => {
    const service = new DuckDbLeadService();
    const nonExistentDbPath = './non_existent_db.duckdb';
    await expect(service.getLeads({ dbPath: nonExistentDbPath })).rejects.toThrow(
      `Database file not found at: ${nonExistentDbPath}`
    );
  });

  it('should return an array of leads from a test database', async () => {
    const service = new DuckDbLeadService();
    const leads = await service.getLeads({ dbPath: testDbPath });

    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0].first_name).toBe('John');
  });
});
