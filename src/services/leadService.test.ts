import { describe, it, expect } from 'vitest';
import { createLeadService } from './leadService';
import { DuckDbLeadService } from './duckdbLeadService';
import { Config } from './configService';

describe('leadService factory', () => {
  it("should return a DuckDbLeadService instance for source 'duckdb'", () => {
    const mockConfig: Config = { dbPath: './test.duckdb', postmarkServerToken: 'test-token' };
    const service = createLeadService('duckdb', mockConfig);
    expect(service).toBeInstanceOf(DuckDbLeadService);
  });

  it('should throw an error for an unsupported source', () => {
    const mockConfig: Config = { dbPath: './test.duckdb', postmarkServerToken: 'test-token' };
    expect(() => createLeadService('unsupported', mockConfig)).toThrow(
      'Unsupported lead service source: unsupported'
    );
  });
});
