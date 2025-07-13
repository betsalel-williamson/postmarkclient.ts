const duckdb = require('duckdb');
const db = new duckdb.Database('business_cards.duckdb');
db.all(
  "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'main' ORDER BY table_name, ordinal_position;",
  (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    let currentTable = '';
    res.forEach((row) => {
      if (row.table_name !== currentTable) {
        console.log(`
Table: ${row.table_name}`);
        currentTable = row.table_name;
      }
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
  }
);
db.close();
