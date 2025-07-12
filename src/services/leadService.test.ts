import { describe, it, expect } from 'vitest';
import { createLeadService } from './leadService';
import { DuckDbLeadService } from './duckdbLeadService';

describe('leadService factory', () => {
  it("should return a DuckDbLeadService instance for source 'duckdb'", () => {
    const service = createLeadService('duckdb');
    expect(service).toBeInstanceOf(DuckDbLeadService);
  });

  it('should throw an error for an unsupported source', () => {
    expect(() => createLeadService('unsupported')).toThrow(
      'Unsupported lead service source: unsupported'
    );
  });
});
