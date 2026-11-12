const crypto = require('node:crypto');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const DEMO_ACCOUNTS = [
  { nombre: 'Director', email: 'director@forcafitness.com', rol: 'admin' },
  { nombre: 'Tesorero', email: 'tesorero@forcafitness.com', rol: 'tesorero' },
  { nombre: 'Recepcionista', email: 'recepcion@forcafitness.com', rol: 'recepcion' },
  { nombre: 'Profesor', email: 'profesor@forcafitness.com', rol: 'instructor' },
  {
    nombre: 'Martín Gómez',
    email: 'martin.gomez@forcafitness.com',
    rol: 'alumno'
  }
];

const createDemoUsers = async (client, options = {}) => {
  const hashPassword = options.hashPassword || ((password) => bcrypt.hash(password, 12));
  const generatePassword = options.generatePassword || (() => crypto.randomBytes(24).toString('hex'));
  const accounts = await Promise.all(DEMO_ACCOUNTS.map(async (account) => {
    const password = generatePassword();
    return { ...account, password, passwordHash: await hashPassword(password) };
  }));

  await client.query('BEGIN');
  try {
    const emails = accounts.map(({ email }) => email.toLowerCase());
    const existing = await client.query(
      'SELECT email FROM usuarios WHERE LOWER(email) = ANY($1::text[])',
      [emails]
    );
    if (existing.rows.length > 0) {
      throw new Error('Ya existen cuentas demo; no se modificó ninguna cuenta');
    }

    const student = await client.query(
      'SELECT id FROM alumnos WHERE LOWER(email) = $1 LIMIT 1',
      ['martin.gomez@forcafitness.com']
    );
    if (student.rows.length === 0) {
      throw new Error('Falta el alumno demo de seed.sql; carga los datos de demostración primero');
    }

    for (const account of accounts) {
      const alumnoId = account.rol === 'alumno' ? student.rows[0].id : null;
      await client.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, alumno_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [account.nombre, account.email, account.passwordHash, account.rol, alumnoId]
      );
    }

    await client.query('COMMIT');
    return accounts.map(({ email, rol, password }) => ({ email, rol, password }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const run = async () => {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  if (!process.env.DATABASE_URL) {
    throw new Error('Configura DATABASE_URL en backend/.env o en el entorno de ejecución');
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (!localHosts.has(databaseUrl.hostname) && process.env.ALLOW_REMOTE_DEMO_ACCOUNT_SEED !== 'true') {
    throw new Error('La base es remota. Define ALLOW_REMOTE_DEMO_ACCOUNT_SEED=true solo si confirmas que es la base de demostración correcta');
  }

  const pool = require('../config/db');
  const client = await pool.connect();
  try {
    const credentials = await createDemoUsers(client);
    console.log('Cuentas demo creadas. Guarda estas contraseñas fuera del repositorio; no se mostrarán de nuevo:');
    credentials.forEach(({ email, rol, password }) => {
      console.log(`${rol} | ${email} | ${password}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { createDemoUsers, DEMO_ACCOUNTS };
