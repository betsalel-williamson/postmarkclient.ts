import { LeadService } from './leadService.types';
import { DuckDbLeadService } from './duckdbLeadService';

import { GoogleSheetsLeadService } from './googleSheetsLeadService';
import { Config } from './configService';
import { OpenAPIV3 } from 'openapi-types';

export function createLeadService(
  source: string,
  config: Config,
  headerMapping: Record<string, string>,
  leadSchema: OpenAPIV3.Document
): LeadService {
  switch (source) {
    case 'duckdb':
      return new DuckDbLeadService(config, headerMapping, leadSchema);
    case 'google-sheets':
      return new GoogleSheetsLeadService(config, headerMapping, leadSchema);
    default:
      throw new Error(`Unsupported lead service source: ${source}`);
  }
}
