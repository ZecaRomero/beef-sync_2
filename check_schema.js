const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'estoque_semen',
  password: process.env.DB_PASSWORD || 'jcromero85',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function checkSchema() {
  try {
    const client = await pool.connect();
    
    const table = 'animais';
    const cols = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${table}'
    `);
    console.log(`Columns for ${table}:`);
    cols.rows.forEach(c => console.log(`- ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`));

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
