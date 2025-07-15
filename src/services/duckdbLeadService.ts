import { validateAndTransformLead } from '../utils/validation';
import { DuckDBInstance, DuckDBValue } from '@duckdb/node-api';
import { LeadService } from './leadService.types';
import * as fs from 'fs';
import { Config } from './configService';
import { OpenAPIV3 } from 'openapi-types';

export class DuckDbLeadService extends LeadService {
  private config: Config;

  constructor(
    config: Config,
    headerMapping: Record<string, string>,
    leadSchema: OpenAPIV3.Document
  ) {
    super(headerMapping, leadSchema);

    if (!config.dbPath) {
      throw new Error('DB_PATH not set in .env file');
    }
    this.config = config;
  }

  public async getReservedTemplateKeys(): Promise<Set<string>> {
    const dbPath = this.config.dbPath as string;
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at: ${dbPath}`);
    }

    const instance = await DuckDBInstance.create(dbPath);
    const connection = await instance.connect();

    try {
      const reader = await connection.runAndReadAll(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'stg_cards_data' ORDER BY ordinal_position;"
      );
      const columns = reader.getRows().map((row) => row[0] as string);
      const superHeaders = await super.getReservedTemplateKeys();
      return new Set([...columns, ...superHeaders]);
    } finally {
      await connection.disconnectSync();
    }
  }

  public async getLeads() {
    const dbPath = this.config.dbPath as string;
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at: ${dbPath}`);
    }

    const instance = await DuckDBInstance.create(dbPath);
    const connection = await instance.connect();

    try {
      // Get column names first
      const columnReader = await connection.runAndReadAll(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'stg_cards_data' ORDER BY ordinal_position;"
      );
      const columnNames: DuckDBValue[] = columnReader.getRows().map((row) => row[0]);

      // Select all data
      const dataReader = await connection.runAndReadAll('SELECT * FROM stg_cards_data');
      const rawRows: DuckDBValue[][] = dataReader.getRows();

      const leads = rawRows.map((row) => {
        const rawLeadData: { [key: string]: string } = {};
        columnNames.forEach((colName, index) => {
          rawLeadData[colName as string] = row[index] as string;
        });

        const validated = validateAndTransformLead(rawLeadData);

        // Start with validated data, then overlay raw data, then specific mappings
        const lead = {
          ...rawLeadData, // Include all raw data
          ...validated, // Overlay validated/transformed data
          // Explicit mappings for core Lead properties, ensuring correct types
          first_name: rawLeadData.first_name as string | null,
          last_name: rawLeadData.last_name as string | null,
          email: rawLeadData.email as string | null,
          phone_number: (rawLeadData.cell || rawLeadData.phone) as string | null,
          company: (validated.company || rawLeadData.company) as string | null,
          title: (validated.title || rawLeadData.title) as string | null,
          product_interest: validated.product_interest,
          notes: (validated.notes || rawLeadData.notes) as string | null,
          customer_facing_notes: rawLeadData.customer_facing_notes as string | null,
          // Ensure '#' is included if it exists in rawLeadData
          '#': rawLeadData['#'] as string | null | undefined,
        };

        return lead;
      });
      return leads;
    } finally {
      await connection.disconnectSync();
    }
  }
}
