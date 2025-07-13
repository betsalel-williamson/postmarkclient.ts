import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DuckDbLeadService } from './duckdbLeadService';
import { DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { Config } from './configService';
import { Lead } from './leadService.types';

describe('DuckDbLeadService', () => {
  const testDbPath = './test_business_cards.duckdb';

  const dummyHeaderMapping: Record<string, keyof Lead> = {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    cell: 'phone_number',
    phone: 'phone_number',
    company: 'company',
    title: 'title',
    products: 'product_interest',
    notes: 'notes',
    customer_facing_notes: 'customer_facing_notes',
  };

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const instance = await DuckDBInstance.create(testDbPath);
    const connection = await instance.connect();
    try {
      await connection.run(
        'CREATE TABLE stg_cards_data (first_name VARCHAR, last_name VARCHAR, email VARCHAR, cell VARCHAR, phone VARCHAR, company VARCHAR, title VARCHAR, products VARCHAR, notes VARCHAR, customer_facing_notes VARCHAR);'
      );
      await connection.run(
        "INSERT INTO stg_cards_data VALUES ('John', 'Doe', 'john.doe@example.com', '123-456-7890', null, 'ACME Inc', 'CEO', 'cat', 'Test note', null)"
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

  it('should throw an error if dbPath is not provided in the config', () => {
    const config: Config = { postmarkServerToken: 'test-token', headerMapping: dummyHeaderMapping };
    expect(() => new DuckDbLeadService(config)).toThrow('DB_PATH not set in .env file');
  });

  it('should throw an error if the database file does not exist', async () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: './non_existent_db.duckdb',
      headerMapping: dummyHeaderMapping,
    };
    const service = new DuckDbLeadService(config);
    await expect(service.getLeads()).rejects.toThrow(
      `Database file not found at: ${config.dbPath}`
    );
  });

  it('should return an array of leads from a test database', async () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: testDbPath,
      headerMapping: dummyHeaderMapping,
    };
    const service = new DuckDbLeadService(config);
    const leads = await service.getLeads();

    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0].first_name).toBe('John');
  });

  it('should return reserved template keys from DuckDB schema', async () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: testDbPath,
      headerMapping: dummyHeaderMapping,
    };
    const service = new DuckDbLeadService(config);
    const reservedKeys = await service.getReservedTemplateKeys();
    expect(reservedKeys).toEqual(
      new Set([
        'first_name',
        'last_name',
        'email',
        'cell',
        'phone',
        'phone_number',
        'product_interest',
        'company',
        'title',
        'products',
        'notes',
        'customer_facing_notes',
      ])
    );
  });
});
