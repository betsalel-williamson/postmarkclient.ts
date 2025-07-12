import { LeadService } from './leadService.types';
import { DuckDbLeadService } from './duckdbLeadService';

export function createLeadService(source: string): LeadService {
  switch (source) {
    case 'duckdb':
      return new DuckDbLeadService();
    // case 'google-sheets':
    //   return new GoogleSheetsLeadService();
    default:
      throw new Error(`Unsupported lead service source: ${source}`);
  }
}
