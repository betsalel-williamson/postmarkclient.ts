import { LeadService } from './leadService.types';
import { DuckDbLeadService } from './duckdbLeadService';

import { GoogleSheetsLeadService } from './googleSheetsLeadService';
import { Config } from './configService';

export function createLeadService(source: string, config: Config): LeadService {
  switch (source) {
    case 'duckdb':
      return new DuckDbLeadService(config);
    case 'google-sheets':
      return new GoogleSheetsLeadService(config);
    default:
      throw new Error(`Unsupported lead service source: ${source}`);
  }
}
