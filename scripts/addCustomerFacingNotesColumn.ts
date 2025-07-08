import * as duckdb from '@duckdb/node-api';
import * as fs from 'fs';

const dbPath = 'business_cards.duckdb';

async function addCustomerFacingNotesColumn() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: Database file not found at: ${dbPath}`);
    process.exit(1);
  }

  const instance = await duckdb.DuckDBInstance.create(dbPath);
  const connection = await instance.connect();

  try {
    // Ensure the table exists before attempting to alter it
    await connection.run(
      'CREATE TABLE IF NOT EXISTS stg_cards_data (first_name VARCHAR, last_name VARCHAR, email VARCHAR, cell VARCHAR, phone VARCHAR, company VARCHAR, title VARCHAR, products VARCHAR, notes VARCHAR);'
    );

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
    if (error instanceof Error) {
      console.error(`Error during migration: ${error.message}`);
    } else {
      console.error(`An unknown error occurred during migration: ${error}`);
    }
    process.exit(1);
  } finally {
    await connection.disconnectSync();
  }
}

addCustomerFacingNotesColumn();
