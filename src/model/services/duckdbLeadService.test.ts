import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DuckDbLeadService, Config } from './';
import { DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { OpenAPIV3 } from 'openapi-types';

describe('DuckDbLeadService', () => {
  const testDbPath = './test_business_cards.duckdb';

  const dummyHeaderMapping: Record<string, string> = {
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

  const mockLeadSchema: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
      title: 'Lead Schema',
      version: '1.0.0',
    },
    paths: {},
    components: {
      schemas: {
        Lead: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone_number: { type: 'string' },
            company: { type: 'string' },
            title: { type: 'string' },
            product_interest: { type: 'string', enum: ['cat', 'dog', 'cat+dog'] },
            notes: { type: 'string' },
            customer_facing_notes: { type: 'string' },
          },
          required: ['email'],
        },
      },
    },
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

  beforeEach(async () => {
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

  it('should throw an error if dbPath is not provided in the config', () => {
    const config: Config = { postmarkServerToken: 'test-token' };
    expect(() => new DuckDbLeadService(config, dummyHeaderMapping, mockLeadSchema)).toThrow(
      'DB_PATH not set in .env file'
    );
  });

  it('should return an array of leads from a test database', async () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: testDbPath,
    };
    const service = new DuckDbLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const result = await service.getLeads();

    expect(Array.isArray(result.validLeads)).toBe(true);
    expect(result.validLeads.length).toBeGreaterThan(0);
    expect(result.validLeads[0].first_name).toBe('John');
    expect(result.totalRecords).toBe(1);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(0);
  });

  it('should filter out invalid leads', async () => {
    const instance = await DuckDBInstance.create(testDbPath);
    const connection = await instance.connect();
    try {
      await connection.run(
        `INSERT INTO stg_cards_data VALUES ('Invalid', 'Lead', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`
      );
    } finally {
      await connection.disconnectSync();
    }

    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: testDbPath,
    };
    const service = new DuckDbLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const result = await service.getLeads();
    expect(result.validLeads.length).toBe(1); // Only the valid lead should remain
    expect(result.validLeads[0].first_name).toBe('John');
    expect(result.totalRecords).toBe(2);
    expect(result.validRecords).toBe(1);
    expect(result.invalidRecords).toBe(1);
    expect(result.errorsByType).toHaveProperty('format');
    expect(result.errorsByType.format).toBe(1);
  });

  it('should return reserved template keys from DuckDB schema', async () => {
    const config: Config = {
      postmarkServerToken: 'test-token',
      dbPath: testDbPath,
    };
    const service = new DuckDbLeadService(config, dummyHeaderMapping, mockLeadSchema);
    const reservedKeys = await service.getReservedTemplateKeys();
    expect(reservedKeys).toEqual(
      new Set([
        'cell',
        'company',
        'customer_facing_notes',
        'email',
        'first_name',
        'last_name',
        'notes',
        'phone_number',
        'phone',
        'product_interest',
        'products',
        'title',
      ])
    );
  });
});
