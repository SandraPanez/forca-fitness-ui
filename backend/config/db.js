const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false   // necesario para Render
  }
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL en Render'))
  .catch(err => console.error('❌ Error de conexión a BD:', err.message));

module.exports = pool;
