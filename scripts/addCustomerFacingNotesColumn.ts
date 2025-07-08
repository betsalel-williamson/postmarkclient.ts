import { DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';

const dbPath = 'business_cards.duckdb';

async function addCustomerFacingNotesColumn() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: Database file not found at: ${dbPath}`);
    process.exit(1);
  }

  const instance = await DuckDBInstance.create(dbPath);
  const connection = await instance.connect();

  try {
    // Check if the column already exists to prevent errors on re-run
    const columnCheck = await connection.runAndReadAll(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'stg_cards_data' AND column_name = 'customer_facing_notes';`
    );

    if (columnCheck.getRows().length === 0) {
      console.log('Adding customer_facing_notes column...');
      await connection.run('ALTER TABLE stg_cards_data ADD COLUMN customer_facing_notes VARCHAR;');
      console.log('customer_facing_notes column added successfully.');
    } else {
      console.log('customer_facing_notes column already exists. Skipping migration.');
    }
  } catch (error) {
    console.error(`Error during migration: ${error.message}`);
    process.exit(1);
  } finally {
    await connection.disconnectSync();
  }
}

addCustomerFacingNotesColumn();
